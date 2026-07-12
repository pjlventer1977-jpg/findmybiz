-- Additional RLS policies for business operations and admin access

-- Business owners can insert their own business
CREATE POLICY "Owners insert own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Business owners can read their own business regardless of status
CREATE POLICY "Owners read own business" ON businesses
  FOR SELECT USING (auth.uid() = owner_id);

-- Business categories
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read business categories" ON business_categories
  FOR SELECT USING (true);

CREATE POLICY "Owners manage own categories" ON business_categories
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Quote requests - public insert via service role; no public read
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Business documents
CREATE POLICY "Owners manage own documents" ON business_documents
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Admins read all documents" ON business_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Owners manage own specials and events
CREATE POLICY "Owners manage own specials" ON specials
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners manage own events" ON events
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR organizer_id = auth.uid()
  );

-- Leads update by owners
CREATE POLICY "Owners update own leads" ON leads
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Subscriptions read by owner
CREATE POLICY "Owners read own subscription" ON subscriptions
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Admin full access helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Admin policies
CREATE POLICY "Admins manage all businesses" ON businesses
  FOR ALL USING (is_admin());

CREATE POLICY "Admins manage all events" ON events
  FOR ALL USING (is_admin());

CREATE POLICY "Admins manage all reviews" ON reviews
  FOR ALL USING (is_admin());

CREATE POLICY "Admins manage all specials" ON specials
  FOR ALL USING (is_admin());

CREATE POLICY "Admins read all leads" ON leads
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins read all payments" ON payments
  FOR SELECT USING (is_admin());

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage admin actions" ON admin_actions
  FOR ALL USING (is_admin());

-- Allow authenticated users to insert reviews
CREATE POLICY "Authenticated users insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Profile insert on signup (handled by trigger with SECURITY DEFINER)
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
