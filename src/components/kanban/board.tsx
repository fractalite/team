import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Status, Task, Priority, useStore } from '@/lib/store';
import { KanbanColumn } from './column';
import { CreateTaskDialog } from './CreateTaskDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import { ArchivedTasksDialog } from './ArchivedTasksDialog';

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'IN_REVIEW', title: 'In Review' },
  { id: 'DONE', title: 'Done' },
];

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [dueDateFilter, setDueDateFilter] = useState<'ALL' | 'OVERDUE' | 'TODAY' | 'UPCOMING'>('ALL');
  
  const tasks = useStore((state) => state.tasks);
  const teams = useStore((state) => state.teams);
  const updateTaskStatus = useStore((state) => state.updateTaskStatus);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // Get all team members
  const allMembers = teams
    .filter(team => team && team.members)
    .flatMap(team => team.members || []);

  // Filter tasks
  const projectTasks = tasks
    .filter(task => task && task.project_id === projectId && task.status !== 'ARCHIVED');

  // Create columns with filtered tasks
  const columns = COLUMNS.map(column => {
    const columnTasks = projectTasks
      .filter(task => task && task.status === column.id);
    return {
      id: column.id,
      title: column.title,
      tasks: columnTasks
    };
  });

  // Get archived tasks count
  const archivedTasksCount = tasks.filter(
    task => task.project_id === projectId && task.status === 'ARCHIVED'
  ).length;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      updateTaskStatus(active.id as string, over.id as Status);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="priority-filter">Priority</Label>
            <Select value={priorityFilter} onValueChange={(value: Priority | 'ALL') => setPriorityFilter(value)}>
              <SelectTrigger id="priority-filter" className="w-[140px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="assignee-filter">Assignee</Label>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger id="assignee-filter" className="w-[160px]">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Assignees</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                {allMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="due-date-filter">Due Date</Label>
            <Select value={dueDateFilter} onValueChange={(value: typeof dueDateFilter) => setDueDateFilter(value)}>
              <SelectTrigger id="due-date-filter" className="w-[140px]">
                <SelectValue placeholder="Filter by due date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Dates</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="TODAY">Due Today</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CreateTaskDialog projectId={projectId} />
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 p-4 overflow-x-auto">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              status={column.id}
              tasks={column.tasks.filter((task) => {
                if (!task) return false;

                // Priority filter
                if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;

                // Assignee filter
                if (assigneeFilter !== 'ALL') {
                  if (assigneeFilter === 'UNASSIGNED') {
                    if (task.assignee_id) return false;
                  } else {
                    if (task.assignee_id !== assigneeFilter) return false;
                  }
                }

                // Due date filter
                if (dueDateFilter !== 'ALL' && task.due_date) {
                  const today = startOfDay(new Date());
                  const dueDate = startOfDay(new Date(task.due_date));

                  switch (dueDateFilter) {
                    case 'OVERDUE':
                      if (!isBefore(dueDate, today)) return false;
                      break;
                    case 'TODAY':
                      if (format(dueDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')) return false;
                      break;
                    case 'UPCOMING':
                      if (!isAfter(dueDate, today)) return false;
                      break;
                  }
                }

                return true;
              })}
            />
          ))}
        </div>
      </DndContext>

      {archivedTasksCount > 0 && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Archive className="h-4 w-4" />
          <Button
            variant="link"
            className="h-auto p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setShowArchived(true)}
          >
            View {archivedTasksCount} archived task{archivedTasksCount !== 1 ? 's' : ''}
          </Button>
        </div>
      )}

      <ArchivedTasksDialog
        projectId={projectId}
        open={showArchived}
        onOpenChange={setShowArchived}
      />
    </div>
  );
}