-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" text NOT NULL,
    "description" text,
    "status" text NOT NULL,
    "priority" text NOT NULL,
    "project_id" uuid REFERENCES projects(id) ON DELETE CASCADE,
    "assignee_id" uuid REFERENCES auth.users(id),
    "due_date" timestamp with time zone,
    "labels" text[] DEFAULT '{}'::text[],
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read tasks"
ON "public"."tasks"
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert tasks"
ON "public"."tasks"
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update tasks"
ON "public"."tasks"
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete tasks"
ON "public"."tasks"
FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at DESC);

-- Add trigger for updating updated_at
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
