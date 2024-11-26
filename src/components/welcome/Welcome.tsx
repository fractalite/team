import { Button } from '@/components/ui/button';
import { Users, FolderKanban, ArrowRight } from 'lucide-react';

export function Welcome() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 px-4">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          Welcome to OpenAirships Team Flow
        </h1>
        <p className="mx-auto max-w-[600px] text-muted-foreground">
          Join the OpenAirships revolution! Collaborate with teams, track projects, and help shape the future of airship technology.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 max-w-3xl">
        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
          <Users className="h-12 w-12 text-primary" />
          <h3 className="text-xl font-semibold">1. Sign Up</h3>
          <p className="text-sm text-muted-foreground">
            Create your account to join our innovative community and start collaborating on groundbreaking airship projects.
          </p>
          <Button className="mt-auto" variant="default">
            Sign Up
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
          <FolderKanban className="h-12 w-12 text-primary" />
          <h3 className="text-xl font-semibold">2. Take Action!</h3>
          <p className="text-sm text-muted-foreground">
            Browse our projects and find relevant tasks to bring this amazing vision to reality.
          </p>
          <Button 
            className="mt-auto"
            variant="default"
          >
            View Projects
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}