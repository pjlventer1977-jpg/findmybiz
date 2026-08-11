-- Allow business owners to remove special images from storage
CREATE POLICY "Owners delete special images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'special-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners update special images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'special-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
