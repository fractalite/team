import { Team } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const [loading, setLoading] = useState(false);
  const profile = useStore((state) => state.profile);
  const addTeamMember = useStore((state) => state.addTeamMember);
  const { toast } = useToast();
  
  const isCurrentUserMember = profile && team.members?.some(
    (member) => member.user_id === profile.id
  );

  const handleJoinTeam = async () => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be signed in to join a team",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addTeamMember(team.id, {
        team_id: team.id,
        user_id: profile.id,
        profile: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url,
        },
      });

      toast({
        title: "Success",
        description: "You've joined the team successfully",
      });
    } catch (error: any) {
      console.error('Error joining team:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join the team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold tracking-tight">{team.name}</h3>
        {profile && !isCurrentUserMember && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleJoinTeam}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {loading ? "Joining..." : "Join Team"}
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
      <div className="flex -space-x-2">
        {team.members && team.members.length > 0 ? (
          team.members.map((member) => (
            member.profile && (
              <Avatar 
                key={member.user_id} 
                className="h-8 w-8 border-2 border-background"
                title={member.profile.full_name}
              >
                <AvatarImage src={member.profile.avatar_url} alt={member.profile.full_name} />
                <AvatarFallback>{member.profile.full_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            )
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No members yet</p>
        )}
      </div>
    </div>
  );
}