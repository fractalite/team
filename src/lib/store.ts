import { create } from 'zustand';
import { supabase } from './supabase';

export type Status = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ARCHIVED';
export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

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
  status: Status;
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
  updateTaskStatus: (taskId: string, status: Status) => void;
  addTeamMember: (teamId: string, member: TeamMember) => Promise<TeamMember>;
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
  setTeams: (teams) => set({ 
    teams: teams.map(team => ({
      ...team,
      members: team.team_members?.map(member => ({
        team_id: team.id,
        user_id: member.user_id,
        profile: member.profiles
      })) || []
    }))
  }),
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
  
  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== taskId),
  })),

  deleteCategory: (categoryId) => set((state) => ({
    categories: state.categories.filter((category) => category.id !== categoryId),
    projects: state.projects.map((project) =>
      project.category_id === categoryId
        ? { ...project, category_id: undefined }
        : project
    ),
  })),
  
  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === updatedTask.id ? { ...task, ...updatedTask } : task
    ),
  })),
  
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? { ...task, status } : task
    ),
  })),
  
  addTeamMember: async (teamId, member) => {
    try {
      // Check if member already exists
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', member.user_id)
        .single();

      if (existingMember) {
        throw new Error('You are already a member of this team');
      }

      // Add member to database
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: member.user_id,
        })
        .select(`
          user_id,
          profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      const newMember = {
        team_id: teamId,
        user_id: data.user_id,
        profile: data.profiles
      };

      // Update local state
      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId
            ? { ...team, members: [...(team.members || []), newMember] }
            : team
        ),
      }));

      return newMember;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  },
  
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