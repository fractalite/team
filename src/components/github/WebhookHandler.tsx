import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface WebhookPayload {
  action: string;
  issue?: {
    id: number;
    number: number;
    title: string;
    body: string;
    state: string;
    html_url: string;
    user: {
      login: string;
    };
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
}

export function WebhookHandler() {
  const { addTask, updateTask } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('github-webhooks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'github_issues',
        },
        async (payload) => {
          try {
            // Get the repository details
            const { data: repo, error: repoError } = await supabase
              .from('github_repositories')
              .select('project_id')
              .eq('id', payload.new.repository_id)
              .single();

            if (repoError) throw repoError;

            // Create a new task for the issue
            const newTask = {
              title: payload.new.title,
              description: `GitHub Issue #${payload.new.number}\n\n${payload.new.body || ''}`,
              status: 'TODO' as TaskStatus,
              priority: 'MEDIUM' as Priority,
              project_id: repo.project_id,
              labels: ['github-issue'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              archived: false,
            };

            const { data: task, error: taskError } = await supabase
              .from('tasks')
              .insert(newTask)
              .select()
              .single();

            if (taskError) throw taskError;

            // Update the github_issue with the task_id
            const { error: updateError } = await supabase
              .from('github_issues')
              .update({ task_id: task.id })
              .eq('id', payload.new.id);

            if (updateError) throw updateError;

            addTask(task);

            toast({
              title: 'New GitHub Issue',
              description: `Created task for issue: ${payload.new.title}`,
            });
          } catch (error) {
            console.error('Error handling webhook:', error);
            toast({
              title: 'Error',
              description: 'Failed to process GitHub webhook',
              variant: 'destructive',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'github_issues',
        },
        async (payload) => {
          try {
            // Get the associated task
            const { data: issue, error: issueError } = await supabase
              .from('github_issues')
              .select('task_id')
              .eq('id', payload.new.id)
              .single();

            if (issueError) throw issueError;

            if (issue.task_id) {
              // Update the task status based on the issue state
              const status = payload.new.state === 'closed' ? 'DONE' as TaskStatus : 'TODO' as TaskStatus;
              
              const { data: task, error: taskError } = await supabase
                .from('tasks')
                .update({ status })
                .eq('id', issue.task_id)
                .select()
                .single();

              if (taskError) throw taskError;

              updateTask(task);

              toast({
                title: 'GitHub Issue Updated',
                description: `Updated task status: ${task.title}`,
              });
            }
          } catch (error) {
            console.error('Error handling webhook update:', error);
            toast({
              title: 'Error',
              description: 'Failed to process GitHub webhook update',
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addTask, updateTask, toast]);

  return null; // This is a background component, no UI needed
}
