import { Project } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Users, Tags } from 'lucide-react';
import { useStore } from '@/lib/store';

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const teams = useStore((state) => state.teams);
  const categories = useStore((state) => state.categories);
  const projectTasks = useStore((state) => state.tasks.filter((task) => task.project_id === project.id));
  
  const team = teams.find((t) => t.id === project.team_id);
  const category = categories.find((c) => c.id === project.category_id);

  const completedPercentage = (projectTasks?.filter((task) => task.status === 'DONE').length || 0) / (projectTasks?.length || 1) * 100;

  return (
    <div
      data-project-id={project.id}
      onClick={() => onClick(project.id)}
      className={cn(
        "group relative rounded-lg border p-6 hover:bg-accent transition-colors cursor-pointer space-y-4",
        project.color && { borderColor: project.color }
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold tracking-tight">{project.name}</h3>
        {category && (
          <Badge 
            variant="secondary" 
            className={cn(
              "flex items-center gap-1",
              category.color && { backgroundColor: category.color, color: 'white' }
            )}
          >
            <Tags className="h-3 w-3" />
            {category.name}
          </Badge>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">{project.description}</p>
      
      {team && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{team.name}</span>
          <span className="text-xs">·</span>
          <span className="text-xs">{team.members?.length || 0} members</span>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completedPercentage}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="bg-accent h-2 rounded-full" style={{ width: `${completedPercentage}%` }}></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-green-500" />
            <div className="text-sm">
              {projectTasks?.filter((task) => task.status === 'DONE').length || 0}/{projectTasks?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}