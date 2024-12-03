import { supabase } from './supabase';
import { Octokit } from '@octokit/rest';
import { HmacSHA256 } from 'crypto-js';

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
  owner: {
    login: string;
  };
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  user: {
    login: string;
  };
}

export class GitHubService {
  private static instance: GitHubService;
  private token: string | null = null;
  private octokit: Octokit | null = null;
  private baseUrl = 'https://api.github.com';

  private constructor() {}

  static getInstance(): GitHubService {
    if (!GitHubService.instance) {
      GitHubService.instance = new GitHubService();
    }
    return GitHubService.instance;
  }

  async initialize(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    this.token = session?.provider_token || null;
    if (this.token) {
      this.octokit = new Octokit({
        auth: this.token,
      });
    }
  }

  private async fetchWithAuth(endpoint: string) {
    if (!this.token) {
      await this.initialize();
      if (!this.token) {
        throw new Error('GitHub token not found');
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(): Promise<GitHubUser> {
    if (!this.octokit) throw new Error('Not authenticated with GitHub');

    const response = await this.octokit.users.getAuthenticated();
    return response.data as GitHubUser;
  }

  async getRepositories() {
    return this.fetchWithAuth('/user/repos?sort=updated&per_page=100');
  }

  async getRepository(owner: string, repo: string) {
    return this.fetchWithAuth(`/repos/${owner}/${repo}`);
  }

  async getPullRequests(owner: string, repo: string) {
    return this.fetchWithAuth(`/repos/${owner}/${repo}/pulls?state=all`);
  }

  async getIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    if (!this.octokit) throw new Error('Not authenticated with GitHub');

    const response = await this.octokit.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100,
    });

    return response.data as GitHubIssue[];
  }

  async createWebhook(owner: string, repo: string, webhookUrl: string, secret: string) {
    if (!this.octokit) throw new Error('Not authenticated with GitHub');

    const response = await this.octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret,
        insecure_ssl: '0',
      },
      events: ['issues', 'issue_comment', 'pull_request'],
      active: true,
    });

    return response.data;
  }

  async deleteWebhook(owner: string, repo: string, hookId: number) {
    if (!this.octokit) throw new Error('Not authenticated with GitHub');

    await this.octokit.repos.deleteWebhook({
      owner,
      repo,
      hook_id: hookId,
    });
  }

  async updateWebhook(owner: string, repo: string, hookId: number, config: any) {
    if (!this.octokit) throw new Error('Not authenticated with GitHub');

    const response = await this.octokit.repos.updateWebhook({
      owner,
      repo,
      hook_id: hookId,
      config,
    });

    return response.data;
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const hash = HmacSHA256(payload, secret);
    const expectedSignature = 'sha256=' + hash.toString();
    return signature === expectedSignature;
  }
}
