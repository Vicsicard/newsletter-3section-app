-- Update newsletters table to store sections and industry summary
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS industry_summary TEXT,
  ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb;

-- Create newsletter_sections table for better querying
CREATE TABLE IF NOT EXISTS newsletter_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  section_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
