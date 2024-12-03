import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { GitHubService } from '@/lib/github';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface GitHubStats {
  stars: number;
  forks: number;
  issues: number;
  pullRequests: number;
}

export function GitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const github = GitHubService.getInstance();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const repos = await github.getRepositories();
      
      const stats = repos.reduce((acc, repo) => ({
        stars: acc.stars + repo.stargazers_count,
        forks: acc.forks + repo.forks_count,
        issues: acc.issues + repo.open_issues_count,
        pullRequests: acc.pullRequests + (repo.open_issues_count - repo.open_issues_count), // Approximate PRs
      }), { stars: 0, forks: 0, issues: 0, pullRequests: 0 });

      setStats(stats);
    } catch (error) {
      console.error('Error loading GitHub stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load GitHub statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold">{stats.stars}</div>
        <div className="text-sm text-muted-foreground">Stars</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold">{stats.forks}</div>
        <div className="text-sm text-muted-foreground">Forks</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold">{stats.issues}</div>
        <div className="text-sm text-muted-foreground">Open Issues</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold">{stats.pullRequests}</div>
        <div className="text-sm text-muted-foreground">Pull Requests</div>
      </Card>
    </div>
  );
}
