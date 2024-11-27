import { Team } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddTeamMemberDialog } from './AddTeamMemberDialog';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const [showAddMember, setShowAddMember] = useState(false);

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold tracking-tight">{team.name}</h3>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowAddMember(true)}
        >
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
      <div className="flex -space-x-2">
        {team.members?.map((member) => (
          <Avatar key={member.user_id} className="h-8 w-8 border-2 border-background">
            <AvatarImage src={member.profile?.avatar_url} alt={member.profile?.full_name} />
            <AvatarFallback>{member.profile?.full_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <AddTeamMemberDialog
        open={showAddMember}
        onOpenChange={setShowAddMember}
        team={team}
      />
    </div>
  );
}