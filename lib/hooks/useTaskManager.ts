import { useState } from 'react'
import { DatabaseService } from '@/lib/services/database'
import { Task, TaskStatus } from '@/types/database'

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  const db = new DatabaseService()

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await db.updateTaskStatus(taskId, status)
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
      // Optionally revert optimistic update
      throw err
    }
  }

  return {
    tasks,
    error,
    updateTaskStatus
  }
} 