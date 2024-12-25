-- Get the latest company ID
WITH latest_company AS (
    SELECT id, company_name, created_at 
    FROM companies 
    ORDER BY created_at DESC 
    LIMIT 1
)
-- Get all contacts for this company
SELECT 
    c.name,
    c.email,
    c.status,
    c.created_at,
    comp.company_name
FROM contacts c
JOIN latest_company comp ON c.company_id = comp.id
ORDER BY c.created_at DESC;
