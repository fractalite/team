import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { Task } from '@/lib/store';
import { TaskCard } from './task-card';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: string;
}

export function KanbanColumn({ title, tasks, status }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col w-80 bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-muted-foreground text-sm">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 min-h-[200px]"
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}