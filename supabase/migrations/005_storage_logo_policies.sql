-- Allow business owners to replace or remove their logos
CREATE POLICY "Owners update business logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'business-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners delete business logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
