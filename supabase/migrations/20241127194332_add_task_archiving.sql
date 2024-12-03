-- Add task archiving columns
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

-- Create index for faster querying of archived tasks
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived, project_id);

-- Create trigger to update status when archiving
CREATE OR REPLACE FUNCTION update_task_status_on_archive()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.archived = true THEN
        NEW.status = 'ARCHIVED';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_status_on_archive
    BEFORE UPDATE OF archived ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_status_on_archive();

-- Update RLS policies for archived tasks
ALTER POLICY "Enable read access for authenticated users" ON tasks
USING (
  archived = false AND (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN teams t ON t.id = p.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  )
);

-- Add new policy for archived tasks
CREATE POLICY "Enable read access for archived tasks" ON tasks
FOR SELECT
TO authenticated
USING (
  archived = true AND (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN teams t ON t.id = p.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  )
);

-- Enable archiving instead of deletion
CREATE POLICY "Enable archiving tasks" ON tasks
FOR UPDATE
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
  archived = true AND
  project_id IN (
    SELECT p.id FROM projects p
    JOIN teams t ON t.id = p.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
);