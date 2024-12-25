-- Remove the unique constraint on contact_email
ALTER TABLE companies DROP CONSTRAINT companies_contact_email_key;

-- Add a new unique constraint on (contact_email, status)
-- This allows multiple entries for the same email if they have different statuses
ALTER TABLE companies 
ADD CONSTRAINT companies_contact_email_status_key 
UNIQUE (contact_email, status);
