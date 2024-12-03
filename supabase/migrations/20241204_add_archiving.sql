-- Add archiving fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Add archiving fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Create index for archived tasks
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);

-- Create function to update task status when archiving
CREATE OR REPLACE FUNCTION update_task_status_on_archive()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.archived = true AND OLD.archived = false THEN
    NEW.status = 'ARCHIVED';
    NEW.archived_at = NOW();
  ELSIF NEW.archived = false AND OLD.archived = true THEN
    NEW.status = 'TODO';
    NEW.archived_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task archiving
DROP TRIGGER IF EXISTS task_archive_status_trigger ON tasks;
CREATE TRIGGER task_archive_status_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  WHEN (OLD.archived IS DISTINCT FROM NEW.archived)
  EXECUTE FUNCTION update_task_status_on_archive();

-- Create function to update project archived_at
CREATE OR REPLACE FUNCTION update_project_archived_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.archived = true AND OLD.archived = false THEN
    NEW.archived_at = NOW();
  ELSIF NEW.archived = false AND OLD.archived = true THEN
    NEW.archived_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project archiving
DROP TRIGGER IF EXISTS project_archive_trigger ON projects;
CREATE TRIGGER project_archive_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW
  WHEN (OLD.archived IS DISTINCT FROM NEW.archived)
  EXECUTE FUNCTION update_project_archived_at();
