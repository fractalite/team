import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Task, Project } from '@/types/database'

export function useRealtimeSync(
  onTaskUpdate: (task: Task) => void,
  onProjectUpdate: (project: Project) => void
) {
  const supabase = createClientComponentClient()

  useEffect(() => {
    const taskSubscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        payload => {
          onTaskUpdate(payload.new as Task)
        }
      )
      .subscribe()

    const projectSubscription = supabase
      .channel('projects-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        payload => {
          onProjectUpdate(payload.new as Project)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(taskSubscription)
      supabase.removeChannel(projectSubscription)
    }
  }, [onTaskUpdate, onProjectUpdate])
} 