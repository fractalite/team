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
import { useState, useEffect } from 'react';
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

const PRIORITIES: { value: Priority | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const DUE_DATE_OPTIONS: { value: 'ALL' | 'OVERDUE' | 'TODAY' | 'UPCOMING'; label: string }[] = [
  { value: 'ALL', label: 'All Dates' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'TODAY', label: 'Due Today' },
  { value: 'UPCOMING', label: 'Upcoming' },
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
    .flatMap(team => team.members || [])
    .filter((member, index, self) => 
      // Remove duplicates by user_id
      index === self.findIndex((m) => m.user_id === member.user_id)
    );

  // Get all tasks for this project
  const projectTasks = tasks.filter(task => task && task.project_id === projectId);
  
  // Get active and archived tasks
  const activeTasks = projectTasks.filter(task => task.status !== 'ARCHIVED');
  const archivedTasks = projectTasks.filter(task => task.status === 'ARCHIVED');

  // Debug logging
  useEffect(() => {
    console.log('Project Tasks:', projectTasks);
    console.log('Active Tasks:', activeTasks);
    console.log('Archived Tasks:', archivedTasks);
  }, [projectTasks]);

  // Filter tasks for each status
  const columns = COLUMNS.map(column => ({
    id: column.id,
    title: column.title,
    tasks: activeTasks.filter(task => 
      task && 
      task.status === column.id && 
      // Priority filter
      (priorityFilter === 'ALL' || task.priority === priorityFilter) && 
      // Assignee filter
      (assigneeFilter === 'ALL' || 
        (assigneeFilter === 'UNASSIGNED' && !task.assignee_id) || 
        task.assignee_id === assigneeFilter) && 
      // Due date filter
      (dueDateFilter === 'ALL' || 
        (dueDateFilter === 'OVERDUE' && task.due_date && isBefore(new Date(task.due_date), startOfDay(new Date()))) || 
        (dueDateFilter === 'TODAY' && task.due_date && format(new Date(task.due_date), 'yyyy-MM-dd') === format(startOfDay(new Date()), 'yyyy-MM-dd')) || 
        (dueDateFilter === 'UPCOMING' && task.due_date && isAfter(new Date(task.due_date), startOfDay(new Date()))))
    )
  }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      updateTaskStatus(active.id as string, over.id as Status);
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="priority-filter">Priority</Label>
            <Select value={priorityFilter} onValueChange={(value: Priority | 'ALL') => setPriorityFilter(value)}>
              <SelectTrigger id="priority-filter" className="w-[140px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority, index) => (
                  <SelectItem key={index} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
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
                <SelectItem key="all" value="ALL">All Assignees</SelectItem>
                <SelectItem key="unassigned" value="UNASSIGNED">Unassigned</SelectItem>
                {allMembers.map((member) => (
                  <SelectItem key={member.user_id} value={member.id}>
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
                {DUE_DATE_OPTIONS.map((option, index) => (
                  <SelectItem key={index} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CreateTaskDialog projectId={projectId} />
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              status={column.id}
              tasks={column.tasks}
            />
          ))}
        </div>
      </DndContext>

      {/* Always show archived section, but conditionally show count */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowArchived(true)}
        >
          <Archive className="h-4 w-4" />
          {archivedTasks.length > 0 
            ? `View Archived Tasks (${archivedTasks.length})`
            : 'Archived Tasks'}
        </Button>
      </div>

      <ArchivedTasksDialog
        projectId={projectId}
        open={showArchived}
        onOpenChange={setShowArchived}
      />
    </div>
  );
}