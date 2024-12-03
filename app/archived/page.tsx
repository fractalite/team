import { DatabaseService } from '@/lib/services/database'
import { ArchivedTasksList } from '@/components/ArchivedTasksList'

export default async function ArchivedPage() {
  const db = new DatabaseService()
  const tasks = await db.getArchivedTasks()

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Archived Tasks</h1>
      <ArchivedTasksList tasks={tasks} />
    </div>
  )
} 