import { useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export function useProfile() {
  const user = useUser();
  const { setProfile } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const fetchOrCreateProfile = async () => {
      try {
        // Try to fetch existing profile first
        let { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // If profile doesn't exist, create one
        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
            throw createError;
          }
          profile = newProfile;
        } else if (error) {
          console.error('Profile fetch error:', error);
          throw error;
        }

        if (profile) {
          setProfile(profile);
        }
      } catch (error: any) {
        console.error('Profile operation failed:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    fetchOrCreateProfile();

    // Subscribe to profile changes
    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
}