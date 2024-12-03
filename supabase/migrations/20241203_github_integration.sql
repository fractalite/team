-- Create github_repositories table
CREATE TABLE IF NOT EXISTS github_repositories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  github_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  html_url TEXT NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  webhook_id INTEGER,
  webhook_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create github_issues table
CREATE TABLE IF NOT EXISTS github_issues (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  github_id INTEGER NOT NULL,
  repository_id uuid REFERENCES github_repositories(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  state TEXT NOT NULL,
  html_url TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_github_repositories_project_id ON github_repositories(project_id);
CREATE INDEX IF NOT EXISTS idx_github_issues_repository_id ON github_issues(repository_id);
CREATE INDEX IF NOT EXISTS idx_github_issues_task_id ON github_issues(task_id);

-- Add RLS policies
ALTER TABLE github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_issues ENABLE ROW LEVEL SECURITY;

-- Repositories policies
CREATE POLICY "Users can view repositories in their projects"
ON github_repositories FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN teams t ON t.id = p.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert repositories for their projects"
ON github_repositories FOR INSERT
TO authenticated
WITH CHECK (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN teams t ON t.id = p.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update repositories in their projects"
ON github_repositories FOR UPDATE
TO authenticated
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN teams t ON t.id = p.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN teams t ON t.id = p.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
);

-- Issues policies
CREATE POLICY "Users can view issues in their repositories"
ON github_issues FOR SELECT
TO authenticated
USING (
  repository_id IN (
    SELECT gr.id FROM github_repositories gr
    JOIN projects p ON p.id = gr.project_id
    JOIN teams t ON t.id = p.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert issues for their repositories"
ON github_issues FOR INSERT
TO authenticated
WITH CHECK (
  repository_id IN (
    SELECT gr.id FROM github_repositories gr
    JOIN projects p ON p.id = gr.project_id
    JOIN teams t ON t.id = p.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update issues in their repositories"
ON github_issues FOR UPDATE
TO authenticated
USING (
  repository_id IN (
    SELECT gr.id FROM github_repositories gr
    JOIN projects p ON p.id = gr.project_id
    JOIN teams t ON t.id = p.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
)
WITH CHECK (
  repository_id IN (
    SELECT gr.id FROM github_repositories gr
    JOIN projects p ON p.id = gr.project_id
    JOIN teams t ON t.id = p.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
);
