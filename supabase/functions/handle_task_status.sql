-- Function to handle task status changes
CREATE OR REPLACE FUNCTION handle_task_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the task's updated_at timestamp
    NEW.updated_at = NOW();
    
    -- If status is being changed to ARCHIVED, record archive time
    IF NEW.status = 'ARCHIVED' AND OLD.status != 'ARCHIVED' THEN
        NEW.archived_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task status changes
DROP TRIGGER IF EXISTS task_status_trigger ON tasks;
CREATE TRIGGER task_status_trigger
    BEFORE UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION handle_task_status();
