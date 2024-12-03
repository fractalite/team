import { create } from 'zustand';
import { supabase } from './supabase';

export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

// Task status type that matches database enum
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ARCHIVED';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Comment {
  id: string;
  content: string;
  task_id: string;
  author_id: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  project_id: string;
  assignee_id?: string;
  due_date?: string;
  labels: string[];
  created_at: string;
  updated_at: string;
  comments: Comment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  team_id: string;
  category_id?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  profile?: Profile;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  members: TeamMember[];
}

interface Store {
  profile: Profile | null;
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  categories: Category[];
  setProfile: (profile: Profile | null) => void;
  setTeams: (teams: Team[]) => void;
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
  setCategories: (categories: Category[]) => void;
  addTeam: (team: Team) => void;
  addProject: (project: Project) => void;
  addTask: (task: Task) => void;
  addCategory: (category: Category) => void;
  deleteTeam: (teamId: string) => void;
  deleteProject: (projectId: string) => void;
  deleteTask: (taskId: string) => void;
  deleteCategory: (categoryId: string) => void;
  updateTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addTeamMember: (teamId: string, member: TeamMember) => void;
  addTaskComment: (taskId: string, comment: Comment) => void;
  deleteTaskComment: (taskId: string, commentId: string) => void;
  removeTask: (taskId: string) => void;
  removeProject: (projectId: string) => void;
  removeCategory: (categoryId: string) => void;
}

export const useStore = create<Store>((set) => ({
  profile: null,
  teams: [],
  projects: [],
  tasks: [],
  categories: [],

  setProfile: (profile) => set({ profile }),
  setTeams: (teams) => set({ teams }),
  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),
  setCategories: (categories) => set({ categories }),

  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  
  addTask: (task) => set((state) => ({ 
    tasks: [task, ...state.tasks]
  })),

  addCategory: (category) => set((state) => ({ 
    categories: [...state.categories, category] 
  })),

  deleteTeam: (teamId) => set((state) => ({
    teams: state.teams.filter((team) => team.id !== teamId),
    projects: state.projects.filter((project) => project.team_id !== teamId),
    tasks: state.tasks.filter((task) =>
      !state.projects.find((p) => p.team_id === teamId && p.id === task.project_id)
    ),
  })),
  
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== projectId),
    tasks: state.tasks.filter((task) => task.project_id !== projectId),
  })),
  
  deleteTask: async (taskId: string) => {
    try {
      // Update the task status to ARCHIVED in the database
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'ARCHIVED',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { 
                ...task, 
                status: 'ARCHIVED',
                updated_at: new Date().toISOString()
              }
            : task
        )
      }));
    } catch (error) {
      console.error('Error archiving task:', error);
    }
  },

  updateTaskStatus: async (taskId, status) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);

    if (!error) {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, status } : task
        ),
      }));
    }
  },

  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === updatedTask.id ? { ...task, ...updatedTask } : task
    ),
  })),
  
  addTeamMember: (teamId, member) => set((state) => ({
    teams: state.teams.map((team) =>
      team.id === teamId
        ? { ...team, members: [...team.members, member] }
        : team
    ),
  })),
  
  addTaskComment: (taskId, comment) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? { ...task, comments: [...task.comments, comment] }
        : task
    ),
  })),
  
  deleteTaskComment: (taskId, commentId) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            comments: task.comments.filter((c) => c.id !== commentId),
          }
        : task
    ),
  })),

  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== taskId),
  })),

  removeProject: (projectId) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== projectId),
  })),

  removeCategory: (categoryId) => set((state) => ({
    categories: state.categories.filter((category) => category.id !== categoryId),
  })),
}));