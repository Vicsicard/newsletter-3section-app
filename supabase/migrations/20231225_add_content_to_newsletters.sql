-- Add content column to newsletters table
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS content TEXT;

-- Update existing newsletters with content from sections
UPDATE newsletters n
SET content = (
  SELECT string_agg(
    '<h2>' || ns.heading || '</h2><div>' || ns.body || '</div>',
    '<br/><br/>'
  )
  FROM newsletter_sections ns
  WHERE ns.newsletter_id = n.id
  ORDER BY ns.section_number
);
