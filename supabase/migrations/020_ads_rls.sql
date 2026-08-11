-- RLS for featured and banner advertising

ALTER TABLE featured_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active featured ads" ON featured_ads
  FOR SELECT USING (is_active = true AND end_date >= NOW());

CREATE POLICY "Public read active banner ads" ON banner_ads
  FOR SELECT USING (is_active = true AND end_date >= NOW());

CREATE POLICY "Owners manage own featured ads" ON featured_ads
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners manage own banner ads" ON banner_ads
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Admins manage all featured ads" ON featured_ads
  FOR ALL USING (is_admin());

CREATE POLICY "Admins manage all banner ads" ON banner_ads
  FOR ALL USING (is_admin());
