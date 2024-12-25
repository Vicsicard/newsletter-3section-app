-- 1. Check latest company submission
SELECT 
    id,
    company_name,
    industry,
    version,
    created_at
FROM companies
ORDER BY created_at DESC
LIMIT 1;

-- 2. Check industry insights for this company
WITH latest_company AS (
    SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT 
    industry,
    insights,
    created_at
FROM industry_insights
WHERE company_id = (SELECT id FROM latest_company);

-- 3. Check newsletter and its sections
WITH latest_company AS (
    SELECT id FROM companies ORDER BY created_at DESC LIMIT 1
)
SELECT 
    ns.section_number,
    ns.heading,
    ns.body,
    ns.image_prompt,
    n.status as newsletter_status,
    ns.created_at
FROM newsletters n
JOIN newsletter_sections ns ON ns.newsletter_id = n.id
WHERE n.company_id = (SELECT id FROM latest_company)
ORDER BY ns.section_number;
