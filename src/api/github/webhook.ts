import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { GitHubService } from '@/lib/github';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const signature = req.headers['x-hub-signature-256'];
  const githubEvent = req.headers['x-github-event'];
  const payload = req.body;

  if (!signature || !githubEvent) {
    return res.status(400).json({ message: 'Missing required headers' });
  }

  try {
    // Get repository details from the payload
    const { repository, sender } = payload;
    
    // Verify the webhook signature
    const { data: repoData } = await supabase
      .from('github_repositories')
      .select('webhook_secret')
      .eq('github_id', repository.id)
      .single();

    if (!repoData?.webhook_secret) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    const github = GitHubService.getInstance();
    const isValid = github.verifyWebhookSignature(
      JSON.stringify(payload),
      signature as string,
      repoData.webhook_secret
    );

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Handle different webhook events
    switch (githubEvent) {
      case 'issues':
        await handleIssueEvent(payload);
        break;
      case 'issue_comment':
        await handleIssueCommentEvent(payload);
        break;
      case 'pull_request':
        await handlePullRequestEvent(payload);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported event type' });
    }

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleIssueEvent(payload: any) {
  const { action, issue, repository } = payload;

  const { data: repo } = await supabase
    .from('github_repositories')
    .select('id')
    .eq('github_id', repository.id)
    .single();

  if (!repo) return;

  switch (action) {
    case 'opened':
      await supabase.from('github_issues').insert({
        github_id: issue.id,
        repository_id: repo.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        html_url: issue.html_url,
        author: issue.user.login,
      });
      break;

    case 'closed':
    case 'reopened':
      await supabase
        .from('github_issues')
        .update({ state: issue.state })
        .eq('github_id', issue.id);
      break;

    case 'edited':
      await supabase
        .from('github_issues')
        .update({
          title: issue.title,
          body: issue.body,
        })
        .eq('github_id', issue.id);
      break;
  }
}

async function handleIssueCommentEvent(payload: any) {
  // Handle issue comments if needed
  // This can be implemented later based on requirements
}

async function handlePullRequestEvent(payload: any) {
  // Handle pull request events if needed
  // This can be implemented later based on requirements
}
