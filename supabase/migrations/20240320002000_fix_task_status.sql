-- Create the task_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Make sure tasks table has correct status column
ALTER TABLE tasks 
    ALTER COLUMN status TYPE task_status USING status::task_status,
    ALTER COLUMN status SET DEFAULT 'TODO'::task_status,
    ALTER COLUMN status SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
