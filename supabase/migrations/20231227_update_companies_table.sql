-- Update companies table to match new schema
ALTER TABLE companies
  RENAME COLUMN company_name TO name;

-- Drop columns that are no longer needed
ALTER TABLE companies
  DROP COLUMN IF EXISTS audience_description,
  DROP COLUMN IF EXISTS newsletter_objectives,
  DROP COLUMN IF EXISTS primary_cta,
  DROP COLUMN IF EXISTS contacts_count;

-- Add new columns
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS company_description TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Make some columns optional
ALTER TABLE companies
  ALTER COLUMN website_url DROP NOT NULL,
  ALTER COLUMN phone_number DROP NOT NULL;
