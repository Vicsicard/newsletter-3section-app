-- Add missing columns to newsletters table
ALTER TABLE newsletters
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled Newsletter',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS email_subject TEXT,
ADD COLUMN IF NOT EXISTS preview_text TEXT;
