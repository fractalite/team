-- Drop existing policy
DROP POLICY IF EXISTS "Allow authenticated users full access" ON "public"."tasks";

-- Enable RLS on tasks table
ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;

-- Create separate policies for each operation
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
