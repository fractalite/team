export type TaskStatus = 'active' | 'archived' | 'deleted'
export type ProjectStatus = 'active' | 'archived' | 'deleted'

export interface Task {
  id: string
  title: string
  description?: string
  project_id: string
  status: TaskStatus
  priority: 'high' | 'medium' | 'low'
  assignee_id?: string
  due_date?: string
  created_at: string
  updated_at: string
  is_test?: boolean
}

export interface Project {
  id: string
  name: string
  description?: string
  team_id: string
  category_id?: string
  status: ProjectStatus
  color?: string
  created_at: string
  updated_at: string
  is_test?: boolean
  tasks_count?: number
}