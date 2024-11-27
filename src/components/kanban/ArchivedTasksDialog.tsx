import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Calendar, AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface ArchivedTasksDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityConfig = {
  URGENT: { icon: AlertTriangle, color: 'text-red-500' },
  HIGH: { icon: ArrowUp, color: 'text-orange-500' },
  MEDIUM: { icon: ArrowRight, color: 'text-yellow-500' },
  LOW: { icon: ArrowDown, color: 'text-blue-500' },
};

export function ArchivedTasksDialog({ projectId, open, onOpenChange }: ArchivedTasksDialogProps) {
  const tasks = useStore((state) => state.tasks);

  // Handle both database (project_id) and UI (projectId) field names
  const archivedTasks = tasks.filter(
    task => (task.projectId || task.project_id) === projectId && task.status === 'ARCHIVED'
  ).sort((a, b) => {
    // Safely handle date fields with fallback to current date
    const dateA = a.createdAt || a.created_at || new Date().toISOString();
    const dateB = b.createdAt || b.created_at || new Date().toISOString();
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Archived Tasks</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          <div className="space-y-4">
            {archivedTasks.map((task) => {
              const PriorityIcon = priorityConfig[task.priority].icon;
              const createdDate = task.createdAt || task.created_at;
              
              return (
                <Card key={task.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <PriorityIcon className={`h-3 w-3 ${priorityConfig[task.priority].color}`} />
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.dueDate), 'MMM d')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  {createdDate && (
                    <div className="text-xs text-muted-foreground">
                      Archived on {format(new Date(createdDate), 'MMM d, yyyy')}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}