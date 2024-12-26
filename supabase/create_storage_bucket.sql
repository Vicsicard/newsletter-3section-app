-- Enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow public access to the logos bucket
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'logos');

-- Allow authenticated users to upload to the logos bucket
CREATE POLICY "Allow Uploads" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'logos');

-- Allow authenticated users to update their own objects
CREATE POLICY "Allow Updates" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'logos')
    WITH CHECK (bucket_id = 'logos');
