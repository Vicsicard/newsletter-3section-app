-- Add additional fields to companies table
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT NOT NULL DEFAULT 'General Audience',
  ADD COLUMN IF NOT EXISTS audience_description TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing records with default target_audience
UPDATE companies 
SET target_audience = 'General Audience' 
WHERE target_audience IS NULL;
