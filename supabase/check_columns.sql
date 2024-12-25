-- Check columns for industry_insights
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'industry_insights'
ORDER BY ordinal_position;

-- Check columns for newsletter_sections
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'newsletter_sections'
ORDER BY ordinal_position;
