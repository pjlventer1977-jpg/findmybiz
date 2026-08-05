-- 016: Whole-province service coverage for businesses
-- Complements city-level business_service_areas.

BEGIN;

CREATE TABLE IF NOT EXISTS business_service_provinces (
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (business_id, province_id)
);

CREATE INDEX IF NOT EXISTS idx_business_service_provinces_province
  ON business_service_provinces (province_id);

ALTER TABLE business_service_provinces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read business service provinces" ON business_service_provinces
  FOR SELECT USING (true);

CREATE POLICY "Owners manage own service provinces" ON business_service_provinces
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Admins manage all service provinces" ON business_service_provinces
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

COMMIT;
