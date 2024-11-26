import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Users, Github, MessageSquare, ArrowLeft } from 'lucide-react';
import { KanbanBoard } from './components/kanban/board';
import { useStore } from './lib/store';
import { Header } from './components/layout/Header';
import { ProjectList } from './components/projects/ProjectList';
import { TeamList } from './components/teams/TeamList';
import { GitHubIntegration } from './components/github/GitHubIntegration';
import { DiscordIntegration } from './components/discord/DiscordIntegration';
import { DashboardMetrics } from './components/dashboard/DashboardMetrics';
import { useSupabaseData } from './lib/hooks/useSupabaseData';
import { useProfile } from './lib/hooks/useProfile';
import { useUser } from '@supabase/auth-helpers-react';
import { Welcome } from './components/welcome/Welcome';

export default function App() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { teams, projects, profile } = useStore();
  const user = useUser();

  // Initialize Supabase data and profile
  useSupabaseData();
  useProfile();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-6">
          <Welcome />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="projects" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="inline-flex">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="discord" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discord
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="mt-0">
            {selectedProject ? (
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedProject(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Projects
                </Button>
                <KanbanBoard projectId={selectedProject} />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-3">
                  <ProjectList 
                    projects={projects} 
                    onSelectProject={setSelectedProject} 
                  />
                </div>
                <div className="col-span-1">
                  <DashboardMetrics />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-3">
                <TeamList teams={teams} />
              </div>
              <div className="col-span-1">
                <DashboardMetrics />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="github" className="mt-0">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-3">
                <GitHubIntegration />
              </div>
              <div className="col-span-1">
                <DashboardMetrics />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discord" className="mt-0">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-3">
                <DiscordIntegration />
              </div>
              <div className="col-span-1">
                <DashboardMetrics />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}