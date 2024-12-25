-- Get the latest company
SELECT 
    id,
    company_name,
    industry,
    target_audience
FROM companies
ORDER BY created_at DESC
LIMIT 1;
