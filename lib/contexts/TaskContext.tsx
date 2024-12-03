import { createContext, useContext, useEffect, useState } from 'react'
import { Task } from '@/types/database'
import { DatabaseService } from '@/lib/services/database'

type TaskContextType = {
  tasks: Task[]
  isLoading: boolean
  error: Error | null
  refreshTasks: () => Promise<void>
  updateTaskStatus: (taskId: string, status: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  createTask: (task: Partial<Task>) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const db = new DatabaseService()

  const refreshTasks = async () => {
    try {
      setIsLoading(true)
      const data = await db.getTasks()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'))
    } finally {
      setIsLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const updatedTask = await db.updateTaskStatus(taskId, status)
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'))
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await db.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'))
      throw err
    }
  }

  const createTask = async (task: Partial<Task>) => {
    try {
      const newTask = await db.createTask(task)
      setTasks(prev => [newTask, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create task'))
      throw err
    }
  }

  useEffect(() => {
    refreshTasks()
  }, [])

  return (
    <TaskContext.Provider value={{
      tasks,
      isLoading,
      error,
      refreshTasks,
      updateTaskStatus,
      deleteTask,
      createTask
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
} 