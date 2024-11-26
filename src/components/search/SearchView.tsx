import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

export function SearchView() {
  const [searchTerm, setSearchTerm] = useState('');
  const { tasks, projects } = useStore();

  // Filter tasks based on search term
  const results = searchTerm.trim() ? tasks
    .filter((task) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    })
    .map(task => ({
      ...task,
      projectName: projects.find(p => p.id === task.projectId)?.name
    })) : [];

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-slate-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'IN_REVIEW': return 'bg-yellow-500';
      case 'DONE': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Search</h2>
        <p className="text-sm text-muted-foreground">
          Search across all tasks and projects
        </p>
      </div>

      <div className="flex gap-2 max-w-xl">
        <Input
          placeholder="Start typing to search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          autoFocus
        />
        <Button 
          variant="default"
          className="shrink-0"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="space-y-4">
        {results.length === 0 && searchTerm.trim() !== '' && (
          <p className="text-muted-foreground">No results found</p>
        )}

        {results.map((result) => (
          <Card key={result.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{result.title}</h3>
                  <Badge 
                    variant="secondary"
                    className={`${getStatusColor(result.status)} text-white`}
                  >
                    {result.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.projectName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {result.priority && (
                  <Badge variant="outline">
                    {result.priority}
                  </Badge>
                )}
                {result.dueDate && (
                  <Badge variant="outline">
                    Due {format(new Date(result.dueDate), 'MMM d')}
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {result.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}