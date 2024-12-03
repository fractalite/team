-- Add archiving columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Create index for archived column
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);

-- Create trigger function for status update
CREATE OR REPLACE FUNCTION update_task_status_on_archive()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.archived = true THEN
        NEW.status = 'ARCHIVED';
        NEW.archived_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS task_archive_status_trigger ON tasks;
CREATE TRIGGER task_archive_status_trigger
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_status_on_archive();
