-- Add compiled newsletter storage
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

-- Function to compile newsletter HTML
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

-- Add trigger to update timestamps
CREATE TRIGGER update_compiled_newsletters_updated_at
    BEFORE UPDATE ON compiled_newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_compiled_newsletters_status 
ON compiled_newsletters(compiled_status);

-- Function to get newsletter compilation status
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
