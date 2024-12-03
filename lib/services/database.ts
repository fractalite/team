import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Task, Project, TaskStatus, ProjectStatus } from '@/types/database'

export class DatabaseService {
  private supabase = createClientComponentClient()

  async getTasks() {
    const { data, error } = await this.supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name)
      `)
      .not('status', 'eq', 'deleted')
      .order('updated_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch tasks: ${error.message}`)
    return data
  }

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    const { data, error } = await this.supabase
      .from('tasks')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', taskId)
      .select(`
        *,
        project:projects(id, name)
      `)
      .single()

    if (error) throw new Error(`Failed to update task: ${error.message}`)
    return data
  }

  async deleteTask(taskId: string) {
    const { error } = await this.supabase
      .from('tasks')
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (error) throw new Error(`Failed to delete task: ${error.message}`)
  }

  async createTask(task: Partial<Task>) {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert([{ 
        ...task,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        project:projects(id, name)
      `)
      .single()

    if (error) throw new Error(`Failed to create task: ${error.message}`)
    return data
  }

  async getProjects() {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        tasks(count)
      `)
      .not('status', 'eq', 'deleted')
      .order('updated_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
    return data
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus) {
    const { data, error } = await this.supabase
      .from('projects')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update project: ${error.message}`)
    return data
  }

  async deleteProject(projectId: string) {
    const { error } = await this.supabase
      .from('projects')
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (error) throw new Error(`Failed to delete project: ${error.message}`)
  }

  async createProject(project: Partial<Project>) {
    const { data, error } = await this.supabase
      .from('projects')
      .insert([{
        ...project,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create project: ${error.message}`)
    return data
  }

  async cleanupTestData() {
    // First mark all test tasks as deleted
    await this.supabase
      .from('tasks')
      .update({ status: 'deleted' })
      .eq('is_test', true)

    // Then mark all test projects as deleted
    await this.supabase
      .from('projects')
      .update({ status: 'deleted' })
      .eq('is_test', true)
  }
}