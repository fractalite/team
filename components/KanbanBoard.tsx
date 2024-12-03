import { columns } from '@/lib/data'
import { KanbanColumn } from './KanbanColumn'
import Link from 'next/link'

export function KanbanBoard() {
  console.log('KanbanBoard rendering')
  
  return (
    <div className="flex flex-col w-full">
      <div className="bg-red-500 p-4 m-4">Debug: KanbanBoard is rendering</div>
      
      <div className="grid grid-cols-4 gap-4 p-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} {...column} />
        ))}
      </div>
      
      <div className="w-full border-t border-border mt-4">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <Link 
            href="/archived"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
          >
            <span>View archived tasks</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
} 