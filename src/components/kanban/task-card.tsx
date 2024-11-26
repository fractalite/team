import { useDraggable } from '@dnd-kit/core';
import { Task, useStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, X, Calendar, AlertTriangle, ArrowUp, ArrowRight, ArrowDown, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { TaskDetailDialog } from './TaskDetailDialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TaskCardProps {
  task: Task;
}

const priorityConfig = {
  URGENT: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  HIGH: { icon: ArrowUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  MEDIUM: { icon: ArrowRight, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  LOW: { icon: ArrowDown, color: 'text-blue-500', bg: 'bg-blue-50' },
};

export function TaskCard({ task }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });
  const removeTask = useStore((state) => state.removeTask);
  const profile = useStore((state) => state.profile);
  const { toast } = useToast();

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      removeTask(task.id);
      toast({
        title: "Success",
        description: "Task removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove task",
        variant: "destructive",
      });
    }
  };

  const PriorityIcon = priorityConfig[task.priority].icon;

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group relative bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing p-4"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">{task.title}</h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary" 
                className={cn(
                  "flex items-center gap-1",
                  priorityConfig[task.priority].bg,
                  priorityConfig[task.priority].color
                )}
              >
                <PriorityIcon className="h-3 w-3" />
                {task.priority}
              </Badge>
              {task.status === 'DONE' && profile?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4 text-destructive hover:text-destructive/80" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee_id && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">Assigned</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {task.due_date && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">
                    {format(new Date(task.due_date), 'MMM d')}
                  </span>
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-xs">{task.comments?.length || 0}</span>
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer hover:bg-secondary/80"
                  onClick={() => setShowDetail(true)}
                >
                  <ExternalLink className="h-4 w-4 text-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <TaskDetailDialog
        task={task}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}