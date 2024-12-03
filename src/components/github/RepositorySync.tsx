import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { GitHubService } from '@/lib/github';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, GitBranch, Check, X } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
}

export function RepositorySync({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [syncedRepos, setSyncedRepos] = useState<string[]>([]);
  const { toast } = useToast();
  const github = GitHubService.getInstance();

  useEffect(() => {
    loadRepositories();
    loadSyncedRepos();
  }, [projectId]);

  const loadRepositories = async () => {
    try {
      const repos = await github.getRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Error loading repositories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load GitHub repositories',
        variant: 'destructive',
      });
    }
  };

  const loadSyncedRepos = async () => {
    try {
      const { data } = await supabase
        .from('github_repositories')
        .select('github_id')
        .eq('project_id', projectId);

      setSyncedRepos(data?.map(r => r.github_id.toString()) || []);
    } catch (error) {
      console.error('Error loading synced repositories:', error);
    }
  };

  const syncRepository = async (repo: Repository) => {
    setLoading(true);
    try {
      // Generate a webhook secret
      const webhookSecret = crypto.randomUUID();
      
      // Create webhook in GitHub
      const webhook = await github.createWebhook(
        repo.full_name.split('/')[0],
        repo.full_name.split('/')[1],
        `${window.location.origin}/api/github/webhook`,
        webhookSecret
      );

      // Store repository and webhook info in database
      const { data, error } = await supabase
        .from('github_repositories')
        .insert({
          github_id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          project_id: projectId,
          webhook_id: webhook.id,
          webhook_secret: webhookSecret,
        })
        .select()
        .single();

      if (error) throw error;

      setSyncedRepos([...syncedRepos, repo.id.toString()]);

      toast({
        title: 'Repository Synced',
        description: `Successfully connected ${repo.name}`,
      });

      // Load initial issues
      const issues = await github.getIssues(
        repo.full_name.split('/')[0],
        repo.full_name.split('/')[1]
      );

      await supabase.from('github_issues').insert(
        issues.map(issue => ({
          github_id: issue.id,
          repository_id: data.id,
          number: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          html_url: issue.html_url,
          author: issue.user.login,
        }))
      );

    } catch (error) {
      console.error('Error syncing repository:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync repository. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const unsyncRepository = async (repo: Repository) => {
    setLoading(true);
    try {
      const { data: repoData } = await supabase
        .from('github_repositories')
        .select('webhook_id')
        .eq('github_id', repo.id)
        .single();

      if (repoData?.webhook_id) {
        await github.deleteWebhook(
          repo.full_name.split('/')[0],
          repo.full_name.split('/')[1],
          repoData.webhook_id
        );
      }

      await supabase
        .from('github_repositories')
        .delete()
        .eq('github_id', repo.id);

      setSyncedRepos(syncedRepos.filter(id => id !== repo.id.toString()));

      toast({
        title: 'Repository Unsynced',
        description: `Successfully disconnected ${repo.name}`,
      });
    } catch (error) {
      console.error('Error unsyncing repository:', error);
      toast({
        title: 'Unsync Failed',
        description: 'Failed to unsync repository. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">GitHub Repositories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repositories.map((repo) => (
          <Card key={repo.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {repo.name}
              </CardTitle>
              <CardDescription>{repo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end">
                <Button
                  variant={syncedRepos.includes(repo.id.toString()) ? "destructive" : "default"}
                  onClick={() => 
                    syncedRepos.includes(repo.id.toString())
                      ? unsyncRepository(repo)
                      : syncRepository(repo)
                  }
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : syncedRepos.includes(repo.id.toString()) ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Unsync
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Sync
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
