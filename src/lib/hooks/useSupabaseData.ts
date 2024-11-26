import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabaseService } from '@/lib/services/supabase-service';
import { useUser } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseData() {
  const user = useUser();
  const { toast } = useToast();
  const {
    setTeams,
    setProjects,
    setTasks,
    setCategories,
    addTask,
    updateTask,
    removeTask,
    addProject,
    removeProject,
    addCategory,
    removeCategory,
  } = useStore();

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    // Initial data fetch
    const fetchData = async () => {
      try {
        const [teams, projects, tasks, categories] = await Promise.all([
          supabaseService.getTeams(),
          supabaseService.getProjects(),
          supabaseService.getTasks(),
          supabaseService.getCategories(),
        ]);

        if (!isMounted) return;

        // Only set the data if we actually received it
        if (teams) setTeams(teams);
        if (projects) setProjects(projects);
        if (tasks) setTasks(tasks);
        if (categories) setCategories(categories);

      } catch (error) {
        console.error('Error fetching data:', error);
        if (!isMounted) return;

        toast({
          title: "Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchData();

    // Set up realtime subscriptions with error handling
    const subscriptions = [
      supabaseService.subscribeToChanges('tasks', (payload) => {
        try {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          switch (eventType) {
            case 'INSERT':
              if (newRecord) addTask(newRecord);
              break;
            case 'UPDATE':
              if (newRecord) updateTask(newRecord);
              break;
            case 'DELETE':
              if (oldRecord?.id) removeTask(oldRecord.id);
              break;
          }
        } catch (error) {
          console.error('Error processing task changes:', error);
        }
      }),

      supabaseService.subscribeToChanges('projects', (payload) => {
        try {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          switch (eventType) {
            case 'INSERT':
              if (newRecord) addProject(newRecord);
              break;
            case 'DELETE':
              if (oldRecord?.id) removeProject(oldRecord.id);
              break;
          }
        } catch (error) {
          console.error('Error processing project changes:', error);
        }
      }),

      supabaseService.subscribeToChanges('categories', (payload) => {
        try {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          switch (eventType) {
            case 'INSERT':
              if (newRecord) addCategory(newRecord);
              break;
            case 'DELETE':
              if (oldRecord?.id) removeCategory(oldRecord.id);
              break;
          }
        } catch (error) {
          console.error('Error processing category changes:', error);
        }
      })
    ];

    // Cleanup subscriptions and prevent memory leaks
    return () => {
      isMounted = false;
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [user]);
}