-- 015: Multiple service areas (cities/towns) per business
-- Keeps businesses.city_id / province_id as primary/HQ location.

BEGIN;

CREATE TABLE IF NOT EXISTS business_service_areas (
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (business_id, city_id)
);

CREATE INDEX IF NOT EXISTS idx_business_service_areas_city
  ON business_service_areas (city_id);

ALTER TABLE business_service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read business service areas" ON business_service_areas
  FOR SELECT USING (true);

CREATE POLICY "Owners manage own service areas" ON business_service_areas
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Admins manage all service areas" ON business_service_areas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Backfill: every business with an HQ city gets that city as a service area
INSERT INTO business_service_areas (business_id, city_id)
SELECT id, city_id
FROM businesses
WHERE city_id IS NOT NULL
ON CONFLICT DO NOTHING;

COMMIT;
