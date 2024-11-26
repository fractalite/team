import { Card } from '@/components/ui/card';
import { useStore } from '@/lib/store';
import { 
  BarChart3, 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Github,
  MessageSquare,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AdminPanel } from '../admin/AdminPanel';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export function DashboardMetrics() {
  const { projects = [], tasks = [], teams = [] } = useStore();
  const [showAdmin, setShowAdmin] = useState(false);

  // Calculate task statistics
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(task => task.status === 'DONE')?.length || 0;
  const urgentTasks = tasks?.filter(task => task.priority === 'URGENT')?.length || 0;
  const overdueTasks = tasks?.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE'
  )?.length || 0;

  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  const totalTeamMembers = teams.filter(team => team?.members).reduce((acc, team) => acc + team.members.length, 0);

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center text-center">
          <FolderKanban className="h-8 w-8 mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{projects?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Active Projects</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center">
          <Users className="h-8 w-8 mb-2 text-green-500" />
          <div className="text-2xl font-bold">{totalTeamMembers}</div>
          <div className="text-sm text-muted-foreground">Team Members</div>
        </Card>
      </div>

      {/* Task Progress */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Task Progress
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Completion Rate</span>
            </div>
            <span className="font-bold">{completionRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Total Tasks</span>
            </div>
            <span className="font-bold">{totalTasks}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Urgent Tasks</span>
            </div>
            <span className="font-bold">{urgentTasks}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              <span>Overdue Tasks</span>
            </div>
            <span className="font-bold">{overdueTasks}</span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {tasks?.slice(0, 3).map(task => (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">
                {task.title} - {format(new Date(task.created_at), 'MMM d')}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Integration Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Github className="h-4 w-4" />
            <h4 className="font-medium">GitHub</h4>
          </div>
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-muted-foreground">Connected Repos</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4" />
            <h4 className="font-medium">Discord</h4>
          </div>
          <div className="text-2xl font-bold">3</div>
          <div className="text-sm text-muted-foreground">Active Channels</div>
        </Card>
      </div>

      {/* Settings Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdmin(true)}
        className="w-full text-muted-foreground hover:text-foreground"
      >
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>

      <Dialog open={showAdmin} onOpenChange={setShowAdmin}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <AdminPanel />
        </DialogContent>
      </Dialog>
    </div>
  );
}