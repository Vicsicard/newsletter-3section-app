-- First, add new columns to newsletter_sections
ALTER TABLE newsletter_sections
ADD COLUMN IF NOT EXISTS enhanced_image_prompt TEXT,
ADD COLUMN IF NOT EXISTS replicate_image_url TEXT,
ADD COLUMN IF NOT EXISTS image_status TEXT CHECK (image_status IN ('pending', 'generating', 'completed', 'failed')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS image_generation_error TEXT;

-- Create new table for image generation history
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

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_image_generation_history_updated_at
    BEFORE UPDATE ON image_generation_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Add index for faster lookups
CREATE INDEX idx_image_generation_newsletter_section 
ON image_generation_history(newsletter_section_id);

-- Verify the changes
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'newsletter_sections' 
    AND column_name IN (
        'enhanced_image_prompt',
        'replicate_image_url',
        'image_status',
        'image_generation_error'
    );

SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_name = 'image_generation_history';
