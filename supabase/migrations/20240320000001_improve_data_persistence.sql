-- Add is_test flag and improve status handling
ALTER TABLE tasks
  ADD COLUMN is_test BOOLEAN DEFAULT false,
  ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add indexes for better query performance
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_task_updated_at ON tasks(updated_at);
CREATE INDEX idx_task_is_test ON tasks(is_test);

-- Add trigger to automatically update updated_at
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