-- Storage buckets for Find My Biz
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('business-logos', 'business-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('business-documents', 'business-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('portfolio-images', 'portfolio-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('event-banners', 'event-banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('special-images', 'special-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Public read for public buckets
CREATE POLICY "Public read business logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-logos');

CREATE POLICY "Public read portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

CREATE POLICY "Public read event banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-banners');

CREATE POLICY "Public read special images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'special-images');

-- Business owners upload to their folders
CREATE POLICY "Owners upload business logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners read own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners upload portfolio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners upload event banners"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-banners'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners upload special images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'special-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin policies for document verification
CREATE POLICY "Admins read all documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-documents'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
