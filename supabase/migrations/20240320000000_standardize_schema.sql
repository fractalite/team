-- Standardize tasks table
ALTER TABLE tasks
  RENAME COLUMN projectId TO project_id;

-- Add proper constraints
ALTER TABLE tasks 
  ADD CONSTRAINT fk_project 
    FOREIGN KEY (project_id) 
    REFERENCES projects(id) 
    ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at DESC);

-- Add triggers for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();