-- Add new columns to newsletter_sections for image handling
ALTER TABLE newsletter_sections
ADD COLUMN IF NOT EXISTS enhanced_image_prompt TEXT,
ADD COLUMN IF NOT EXISTS replicate_image_url TEXT,
ADD COLUMN IF NOT EXISTS image_status TEXT CHECK (image_status IN ('pending', 'generating', 'completed', 'failed')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS image_generation_error TEXT;

-- Create table for storing detailed image generation history
CREATE TABLE IF NOT EXISTS image_generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_section_id UUID REFERENCES newsletter_sections(id) ON DELETE CASCADE,
    original_prompt TEXT NOT NULL,
    enhanced_prompt TEXT NOT NULL,
    replicate_prediction_id TEXT,
    replicate_status TEXT CHECK (status IN ('pending', 'processing', 'succeeded', 'failed')) NOT NULL DEFAULT 'pending',
    replicate_image_url TEXT,
    error_message TEXT,
    model_version TEXT NOT NULL,
    generation_params JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trigger for timestamp updates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_image_generation_history_updated_at') THEN
        CREATE TRIGGER update_image_generation_history_updated_at
            BEFORE UPDATE ON image_generation_history
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;
END
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_image_generation_newsletter_section 
ON image_generation_history(newsletter_section_id);

COMMENT ON TABLE image_generation_history IS 'Tracks the history and status of image generation attempts for newsletter sections';
COMMENT ON COLUMN image_generation_history.enhanced_prompt IS 'The ChatGPT-enhanced version of the original image prompt';
COMMENT ON COLUMN image_generation_history.replicate_prediction_id IS 'The unique ID returned by Replicate for tracking generation progress';
COMMENT ON COLUMN image_generation_history.generation_params IS 'JSON containing the parameters used for image generation (like steps, cfg_scale, etc)';
