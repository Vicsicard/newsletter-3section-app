-- 1. Get all sections that need image generation (status is pending)
CREATE OR REPLACE FUNCTION get_pending_image_generations()
RETURNS TABLE (
    section_id UUID,
    newsletter_id UUID,
    section_number INTEGER,
    original_prompt TEXT,
    enhanced_prompt TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ns.id as section_id,
        ns.newsletter_id,
        ns.section_number,
        ns.image_prompt as original_prompt,
        ns.enhanced_image_prompt
    FROM newsletter_sections ns
    WHERE ns.image_status = 'pending'
    ORDER BY ns.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 2. Update image generation status and URL
CREATE OR REPLACE FUNCTION update_image_generation(
    p_section_id UUID,
    p_status TEXT,
    p_image_url TEXT DEFAULT NULL,
    p_error TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    UPDATE newsletter_sections
    SET 
        image_status = p_status,
        replicate_image_url = COALESCE(p_image_url, replicate_image_url),
        image_generation_error = p_error,
        updated_at = NOW()
    WHERE id = p_section_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Log a new image generation attempt
CREATE OR REPLACE FUNCTION log_image_generation_attempt(
    p_section_id UUID,
    p_original_prompt TEXT,
    p_enhanced_prompt TEXT,
    p_replicate_prediction_id TEXT,
    p_model_version TEXT,
    p_generation_params JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_history_id UUID;
BEGIN
    INSERT INTO image_generation_history (
        newsletter_section_id,
        original_prompt,
        enhanced_prompt,
        replicate_prediction_id,
        model_version,
        generation_params
    ) VALUES (
        p_section_id,
        p_original_prompt,
        p_enhanced_prompt,
        p_replicate_prediction_id,
        p_model_version,
        p_generation_params
    )
    RETURNING id INTO v_history_id;
    
    RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Get image generation status for a newsletter
CREATE OR REPLACE FUNCTION get_newsletter_image_status(p_newsletter_id UUID)
RETURNS TABLE (
    section_number INTEGER,
    image_status TEXT,
    image_url TEXT,
    error_message TEXT,
    last_attempt_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ns.section_number,
        ns.image_status,
        ns.replicate_image_url,
        ns.image_generation_error,
        (
            SELECT created_at 
            FROM image_generation_history 
            WHERE newsletter_section_id = ns.id 
            ORDER BY created_at DESC 
            LIMIT 1
        ) as last_attempt_at
    FROM newsletter_sections ns
    WHERE ns.newsletter_id = p_newsletter_id
    ORDER BY ns.section_number;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
/*
-- Get pending generations
SELECT * FROM get_pending_image_generations();

-- Update status for a section
SELECT update_image_generation(
    'section-uuid-here',
    'completed',
    'https://replicate-output-url.jpg'
);

-- Log a new generation attempt
SELECT log_image_generation_attempt(
    'section-uuid-here',
    'Original prompt text',
    'Enhanced prompt text',
    'replicate-prediction-id',
    'stability-ai/sdxl:latest'
);

-- Check status for a newsletter
SELECT * FROM get_newsletter_image_status('newsletter-uuid-here');
*/
