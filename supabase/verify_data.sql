-- Check companies table
SELECT 
    id,
    company_name,
    contact_email,
    industry,
    target_audience,
    status,
    created_at
FROM companies
ORDER BY created_at DESC
LIMIT 1;

-- Check contacts for the latest company
WITH latest_company AS (
    SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT 
    name,
    email,
    status,
    created_at
FROM contacts
WHERE company_id = (SELECT id FROM latest_company);

-- Check CSV upload status
WITH latest_company AS (
    SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT 
    filename,
    processed_count,
    total_count,
    status,
    error_message,
    created_at
FROM csv_uploads
WHERE company_id = (SELECT id FROM latest_company);
