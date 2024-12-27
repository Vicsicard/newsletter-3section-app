-- Add status column to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS status text 
DEFAULT 'active' 
CHECK (status IN ('active', 'unsubscribed'));

-- Update existing rows to have 'active' status
UPDATE contacts 
SET status = 'active' 
WHERE status IS NULL;
