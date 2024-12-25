-- Add new tables for ChatGPT responses

-- Industry Insights table (stores ChatGPT industry analysis)
CREATE TABLE IF NOT EXISTS industry_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    industry TEXT NOT NULL,
    insights JSONB NOT NULL, -- Stores the bullet points from GPT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Newsletters table (main newsletter metadata)
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    industry_insight_id UUID REFERENCES industry_insights(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'published')) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Newsletter Sections table (stores ChatGPT generated sections)
CREATE TABLE IF NOT EXISTS newsletter_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
    section_number INTEGER NOT NULL CHECK (section_number BETWEEN 1 AND 3),
    heading TEXT NOT NULL,
    body TEXT NOT NULL,
    image_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(newsletter_id, section_number)
);

-- Create triggers for timestamp updates (only if they don't exist)
DO $$
BEGIN
    -- Check and create trigger for industry_insights
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_industry_insights_updated_at') THEN
        CREATE TRIGGER update_industry_insights_updated_at
            BEFORE UPDATE ON industry_insights
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;

    -- Check and create trigger for newsletters
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_newsletters_updated_at') THEN
        CREATE TRIGGER update_newsletters_updated_at
            BEFORE UPDATE ON newsletters
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;

    -- Check and create trigger for newsletter_sections
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_newsletter_sections_updated_at') THEN
        CREATE TRIGGER update_newsletter_sections_updated_at
            BEFORE UPDATE ON newsletter_sections
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;
END
$$;
