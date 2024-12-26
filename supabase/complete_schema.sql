-- Complete database schema including image generation system

-- Core tables
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    website_url TEXT,
    contact_email TEXT NOT NULL,
    phone_number TEXT,
    industry TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    logo_url TEXT,
    status TEXT CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    industry_insight_id UUID,
    status TEXT CHECK (status IN ('draft', 'published')) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
    section_number INTEGER NOT NULL CHECK (section_number BETWEEN 1 AND 3),
    heading TEXT NOT NULL,
    body TEXT NOT NULL,
    image_prompt TEXT NOT NULL,
    enhanced_image_prompt TEXT,
    replicate_image_url TEXT,
    image_status TEXT CHECK (image_status IN ('pending', 'generating', 'completed', 'failed')) DEFAULT 'pending',
    image_generation_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(newsletter_id, section_number)
);

-- Image generation tracking
CREATE TABLE IF NOT EXISTS image_generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_section_id UUID REFERENCES newsletter_sections(id) ON DELETE CASCADE,
    original_prompt TEXT NOT NULL,
    enhanced_prompt TEXT NOT NULL,
    replicate_prediction_id TEXT,
    replicate_status TEXT CHECK (replicate_status IN ('pending', 'processing', 'succeeded', 'failed')) NOT NULL DEFAULT 'pending',
    replicate_image_url TEXT,
    error_message TEXT,
    model_version TEXT NOT NULL,
    generation_params JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- HTML Newsletter Storage
CREATE TABLE IF NOT EXISTS compiled_newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
    html_content TEXT NOT NULL,
    email_subject TEXT NOT NULL,
    preview_text TEXT,
    compiled_status TEXT CHECK (compiled_status IN ('draft', 'ready', 'sent', 'error')) NOT NULL DEFAULT 'draft',
    error_message TEXT,
    sent_count INTEGER DEFAULT 0,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    public_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(newsletter_id)
);

-- Utility functions
CREATE OR REPLACE FUNCTION get_pending_image_generations()
RETURNS TABLE (
    section_id UUID,
    newsletter_id UUID,
    section_number INTEGER,
    enhanced_prompt TEXT,
    generation_params JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ns.id as section_id,
        ns.newsletter_id,
        ns.section_number,
        ns.enhanced_image_prompt,
        igh.generation_params
    FROM newsletter_sections ns
    LEFT JOIN image_generation_history igh ON igh.newsletter_section_id = ns.id
    WHERE ns.image_status = 'pending'
    ORDER BY ns.created_at ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_image_generation_status(
    p_section_id UUID,
    p_status TEXT,
    p_image_url TEXT DEFAULT NULL,
    p_error TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    UPDATE image_generation_history 
    SET 
        replicate_status = CASE 
            WHEN p_status = 'completed' THEN 'succeeded'
            WHEN p_status = 'failed' THEN 'failed'
            ELSE replicate_status
        END,
        replicate_image_url = COALESCE(p_image_url, replicate_image_url),
        error_message = p_error,
        updated_at = NOW()
    WHERE newsletter_section_id = p_section_id;

    UPDATE newsletter_sections 
    SET 
        image_status = p_status,
        replicate_image_url = COALESCE(p_image_url, replicate_image_url),
        image_generation_error = p_error,
        updated_at = NOW()
    WHERE id = p_section_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_newsletter_generation_summary(p_newsletter_id UUID)
RETURNS TABLE (
    newsletter_id UUID,
    company_name TEXT,
    total_sections INTEGER,
    completed_sections INTEGER,
    generation_status TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE,
    sections_json JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH section_details AS (
        SELECT 
            ns.section_number,
            ns.heading,
            ns.image_status,
            ns.replicate_image_url,
            ns.image_generation_error,
            igh.replicate_status,
            igh.created_at as generation_started,
            igh.updated_at as generation_completed,
            jsonb_build_object(
                'section_number', ns.section_number,
                'heading', ns.heading,
                'status', ns.image_status,
                'image_url', ns.replicate_image_url,
                'error', ns.image_generation_error,
                'started_at', igh.created_at,
                'completed_at', igh.updated_at
            ) as section_json
        FROM newsletter_sections ns
        LEFT JOIN image_generation_history igh ON igh.newsletter_section_id = ns.id
        WHERE ns.newsletter_id = p_newsletter_id
    )
    SELECT 
        n.id as newsletter_id,
        c.company_name,
        COUNT(*)::INTEGER as total_sections,
        COUNT(*) FILTER (WHERE sd.image_status = 'completed')::INTEGER as completed_sections,
        CASE 
            WHEN COUNT(*) FILTER (WHERE sd.image_status = 'failed') > 0 THEN 'Has Failed Images'
            WHEN COUNT(*) FILTER (WHERE sd.image_status = 'completed') = COUNT(*) THEN 'All Complete'
            WHEN COUNT(*) FILTER (WHERE sd.image_status = 'completed') > 0 THEN 'Partially Complete'
            ELSE 'Pending'
        END as generation_status,
        MIN(sd.generation_started) as started_at,
        MAX(sd.generation_completed) as last_updated,
        jsonb_agg(sd.section_json ORDER BY sd.section_number) as sections_json
    FROM newsletters n
    JOIN companies c ON c.id = n.company_id
    LEFT JOIN section_details sd ON true
    WHERE n.id = p_newsletter_id
    GROUP BY n.id, c.company_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION compile_newsletter_html(p_newsletter_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    html_content TEXT,
    error TEXT
) AS $$
DECLARE
    v_company_name TEXT;
    v_logo_url TEXT;
    v_website_url TEXT;
BEGIN
    -- Get company information
    SELECT 
        c.company_name,
        c.logo_url,
        c.website_url
    INTO 
        v_company_name,
        v_logo_url,
        v_website_url
    FROM newsletters n
    JOIN companies c ON c.id = n.company_id
    WHERE n.id = p_newsletter_id;

    -- Return error if newsletter not found
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            false,
            'Newsletter not found',
            NULL::TEXT,
            'Newsletter ID does not exist';
        RETURN;
    END IF;

    -- Compile HTML content
    RETURN QUERY
    WITH newsletter_data AS (
        SELECT 
            jsonb_build_object(
                'company_name', v_company_name,
                'logo_url', v_logo_url,
                'website_url', v_website_url,
                'sections', jsonb_agg(
                    jsonb_build_object(
                        'heading', ns.heading,
                        'body', ns.body,
                        'image_url', ns.replicate_image_url
                    ) ORDER BY ns.section_number
                )
            ) as template_data
        FROM newsletter_sections ns
        WHERE ns.newsletter_id = p_newsletter_id
        GROUP BY ns.newsletter_id
    )
    SELECT 
        true,
        'Newsletter compiled successfully',
        template_data::TEXT,
        NULL::TEXT
    FROM newsletter_data;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_newsletter_compilation_status(p_newsletter_id UUID)
RETURNS TABLE (
    newsletter_id UUID,
    company_name TEXT,
    compilation_status TEXT,
    sent_count INTEGER,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    public_url TEXT,
    error_message TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id as newsletter_id,
        c.company_name,
        cn.compiled_status,
        cn.sent_count,
        cn.last_sent_at,
        cn.public_url,
        cn.error_message
    FROM newsletters n
    JOIN companies c ON c.id = n.company_id
    LEFT JOIN compiled_newsletters cn ON cn.newsletter_id = n.id
    WHERE n.id = p_newsletter_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_image_generation_newsletter_section 
ON image_generation_history(newsletter_section_id);

CREATE INDEX IF NOT EXISTS idx_compiled_newsletters_status 
ON compiled_newsletters(compiled_status);

-- Triggers for timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_newsletters_updated_at
    BEFORE UPDATE ON newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_newsletter_sections_updated_at
    BEFORE UPDATE ON newsletter_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_image_generation_history_updated_at
    BEFORE UPDATE ON image_generation_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_compiled_newsletters_updated_at
    BEFORE UPDATE ON compiled_newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
