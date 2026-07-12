-- Allow business owners to create and read their own payment records
CREATE POLICY "Owners insert own payments"
  ON payments FOR INSERT
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners read own payments"
  ON payments FOR SELECT
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );
