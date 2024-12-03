-- Update task_status type
alter type task_status rename to task_status_old;
create type task_status as enum ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');

-- Add new columns to tasks table
alter table tasks add column if not exists is_archived boolean default false;
alter table tasks add column if not exists archived_at timestamptz;

-- Migrate existing archived tasks
update tasks
set is_archived = true,
    archived_at = updated_at,
    status = 'DONE'
where status = 'ARCHIVED'::task_status_old;

-- Drop old type after converting existing data
alter table tasks 
    alter column status type task_status using status::text::task_status;
