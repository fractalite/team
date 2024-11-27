import { supabase } from '@/lib/supabase';
import { Team, Project, Task, Category, Profile, TeamMember } from '@/lib/store';

export const supabaseService = {
  // Teams
  async getTeams() {
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          team_members!left (
            user_id,
            profiles!inner (
              id,
              email,
              full_name,
              avatar_url
            )
          )
        `);

      if (teamsError) throw teamsError;

      // Transform the data to match our frontend types
      const teams = teamsData?.map(team => ({
        ...team,
        members: (team.team_members || []).map(member => ({
          team_id: team.id,
          user_id: member.user_id,
          profile: member.profiles
        }))
      })) || [];

      return teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  },

  async createTeam(team: Omit<Team, 'id' | 'members'>) {
    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTeam(teamId: string) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
  },

  // Projects
  async getProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  async createProject(project: Omit<Project, 'id'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProject(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  },

  // Tasks
  async getTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id (
            id,
            email,
            full_name,
            avatar_url
          ),
          comments (
            id,
            content,
            author_id,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error in getTasks:', error);
      return [];
    }
  },

  async createTask(task: Omit<Task, 'id' | 'comments'>) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in createTask:', error);
      throw error;
    }
  },

  async updateTaskStatus(taskId: string, status: Task['status']) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  },

  // Categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async createCategory(category: Omit<Category, 'id'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(categoryId: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },

  // Comments
  async createComment(comment: Omit<Comment, 'id'>) {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  // Team Members
  async addTeamMember(teamId: string, member: Omit<TeamMember, 'id'>) {
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
          profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return {
        team_id: teamId,
        user_id: data.user_id,
        profile: data.profiles
      };
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  },

  // Realtime subscriptions
  subscribeToChanges(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  }
};