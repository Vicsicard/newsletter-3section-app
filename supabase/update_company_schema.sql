-- First, drop existing constraints
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_contact_email_key;

-- Add a new version field to track multiple submissions
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
