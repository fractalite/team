-- First, create a new task_status type
CREATE TYPE task_status_new AS ENUM (
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
  'ARCHIVED'
);

-- Update tasks table to use the new status type
ALTER TABLE tasks 
  -- Add temporary column for the transition
  ADD COLUMN status_new task_status_new;

-- Migrate existing data
UPDATE tasks
SET status_new = CASE 
  WHEN status::text = 'TODO' THEN 'TODO'::task_status_new
  WHEN status::text = 'IN_PROGRESS' THEN 'IN_PROGRESS'::task_status_new
  WHEN status::text = 'IN_REVIEW' THEN 'IN_REVIEW'::task_status_new
  WHEN status::text = 'DONE' THEN 'DONE'::task_status_new
  WHEN status::text = 'ARCHIVED' THEN 'ARCHIVED'::task_status_new
  ELSE 'TODO'::task_status_new
END;

-- Drop the old status column and rename the new one
ALTER TABLE tasks 
  DROP COLUMN status,
  ALTER COLUMN status_new SET NOT NULL,
  ALTER COLUMN status_new SET DEFAULT 'TODO'::task_status_new,
  RENAME COLUMN status_new TO status;

-- Drop the old type
DROP TYPE task_status;

-- Rename the new type to the original name
ALTER TYPE task_status_new RENAME TO task_status;

-- Remove any boolean archiving flags if they exist
ALTER TABLE tasks 
  DROP COLUMN IF EXISTS is_archived,
  DROP COLUMN IF EXISTS archived_at;

-- Create index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
