import { useDraggable } from '@dnd-kit/core';
import { Task } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 cursor-move bg-background hover:bg-accent/10 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium">{task.title}</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      {task.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 mt-4">
        <Badge variant="secondary">
          {task.priority}
        </Badge>
        {task.due_date && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.due_date), 'MMM d')}
          </Badge>
        )}
      </div>
    </Card>
  );
}
