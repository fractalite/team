import { Project, Category, useStore } from '@/lib/store';
import { ProjectCard } from './ProjectCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

export function ProjectList({ projects, onSelectProject }: ProjectListProps) {
  const categories = useStore((state) => state.categories);

  // Group projects by category
  const projectsByCategory = categories.map(category => ({
    ...category,
    projects: projects.filter(project => project.category_id === category.id)
  }));

  // Get uncategorized projects
  const uncategorizedProjects = projects.filter(project => !project.category_id);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        <p className="text-sm text-muted-foreground">
          Browse and contribute to ongoing airship projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categorized Projects */}
        {projectsByCategory.map(category => (
          category.projects.length > 0 && (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  {category.name}
                </h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    "bg-opacity-15",
                    category.color && { backgroundColor: category.color }
                  )}
                >
                  {category.projects.length} project{category.projects.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid gap-4">
                {category.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={onSelectProject}
                  />
                ))}
              </div>
            </div>
          )
        ))}

        {/* Uncategorized Projects */}
        {uncategorizedProjects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight">
                Uncategorized
              </h3>
              <Badge variant="secondary">
                {uncategorizedProjects.length} project{uncategorizedProjects.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="grid gap-4">
              {uncategorizedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={onSelectProject}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-8 mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Have an idea?</h3>
            <p className="text-sm text-muted-foreground">
              Submit your project proposal to our Team Facilitator, Rhy, and help drive innovation in airship technology.
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => window.location.href = 'mailto:rhy@leperkhanz.com?subject=OpenAirships Project Proposal'}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Submit Proposal
          </Button>
        </div>
      </div>
    </div>
  );
}