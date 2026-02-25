-- Create a public storage bucket for cached card images.
-- Images are uploaded by edge functions (service_role) and read publicly.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-images',
  'card-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);

-- Allow anyone to read (public bucket already does this, but explicit for clarity)
CREATE POLICY "card_images_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-images');

-- Only service_role can insert (service role bypasses RLS anyway,
-- but this blocks anon key uploads)
CREATE POLICY "card_images_service_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'card-images' AND auth.role() = 'service_role');
