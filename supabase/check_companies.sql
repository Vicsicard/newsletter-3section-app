-- Check existing companies
SELECT 
    company_name,
    contact_email,
    industry,
    created_at
FROM companies
ORDER BY created_at DESC;
