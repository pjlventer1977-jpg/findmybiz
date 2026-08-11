-- Portfolio gallery RLS and storage delete/update policies

ALTER TABLE business_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read portfolio" ON business_portfolio
  FOR SELECT USING (true);

CREATE POLICY "Owners manage own portfolio" ON business_portfolio
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Admins manage all portfolio" ON business_portfolio
  FOR ALL USING (is_admin());

CREATE POLICY "Owners update portfolio images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolio-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners delete portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
