-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN ('industry_insights', 'newsletters', 'newsletter_sections');

-- Show table columns and their types
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_name IN ('industry_insights', 'newsletters', 'newsletter_sections')
ORDER BY t.table_name, c.ordinal_position;
