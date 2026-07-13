-- Per-business search appearance events for time-series analytics
CREATE TABLE IF NOT EXISTS search_appearance_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  search_term TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_appearance_business
  ON search_appearance_analytics(business_id);
CREATE INDEX IF NOT EXISTS idx_search_appearance_created
  ON search_appearance_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_profile_view_business
  ON profile_view_analytics(business_id);
CREATE INDEX IF NOT EXISTS idx_profile_view_created
  ON profile_view_analytics(created_at);

ALTER TABLE profile_view_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_appearance_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own profile views" ON profile_view_analytics
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners read own search appearances" ON search_appearance_analytics
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );
