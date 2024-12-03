import { Task, TaskStatus } from '@/lib/store'
import { DatabaseService } from '@/lib/services/database'
import { Button } from '@/components/ui/button'

interface Props {
  tasks: Task[]
}

export function ArchivedTasksList({ tasks }: Props) {
  const db = new DatabaseService()

  const handleRestore = async (taskId: string) => {
    await db.updateTaskStatus(taskId, 'TODO' as TaskStatus)
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <span className="text-muted-foreground">{task.title}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleRestore(task.id)}
          >
            Restore
          </Button>
        </div>
      ))}
      {tasks.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No archived tasks found
        </p>
      )}
    </div>
  )
}