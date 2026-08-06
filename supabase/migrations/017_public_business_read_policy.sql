-- Ensure anonymous users can read approved businesses (public directory).
-- Safe to re-run: drops and recreates the policy.

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read approved businesses" ON businesses;

CREATE POLICY "Public read approved businesses" ON businesses
  FOR SELECT USING (status = 'approved');
