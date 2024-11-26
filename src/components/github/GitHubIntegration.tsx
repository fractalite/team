import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github } from "lucide-react";

export function GitHubIntegration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">GitHub Integration</h2>
          <p className="text-sm text-muted-foreground">
            Connect your GitHub repositories to sync issues and pull requests
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          Connect GitHub
        </Button>
      </div>

      <div className="grid gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Repository Sync</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select repositories to sync with your projects
          </p>
          <div className="rounded-lg border bg-muted/50 p-8 text-center">
            <Github className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to start syncing repositories
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Automation Rules</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure automatic task creation from issues and pull requests
          </p>
          <div className="space-y-2">
            <div className="rounded-lg border p-4 bg-muted/20">
              <p className="text-sm font-medium">When an issue is created</p>
              <p className="text-xs text-muted-foreground">Create a task in TODO status</p>
            </div>
            <div className="rounded-lg border p-4 bg-muted/20">
              <p className="text-sm font-medium">When a pull request is opened</p>
              <p className="text-xs text-muted-foreground">Create a task in IN_REVIEW status</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}