import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { GitHubService } from '@/lib/github';
import { useToast } from '@/hooks/use-toast';

export function GitHubAuth() {
  const { toast } = useToast();
  
  const handleConnect = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/github/callback`,
          scopes: 'repo user',
        },
      });

      if (error) throw error;

      // Initialize GitHub service after successful auth
      const github = GitHubService.getInstance();
      await github.initialize();

      toast({
        title: 'GitHub Connected',
        description: 'Successfully connected to GitHub',
      });
    } catch (error) {
      console.error('GitHub auth error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to GitHub. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Connect to GitHub</h2>
      <p className="text-muted-foreground">
        Connect your GitHub account to sync repositories and issues.
      </p>
      <Button onClick={handleConnect} size="lg">
        Connect GitHub Account
      </Button>
    </div>
  );
}
