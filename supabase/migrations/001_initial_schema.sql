-- Find My Biz — Initial Schema
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE membership_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE business_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE lead_status AS ENUM ('new', 'viewed', 'contacted', 'closed', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_type AS ENUM ('subscription', 'lead_credits', 'event', 'featured_ad', 'banner_ad');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE user_role AS ENUM ('visitor', 'business_owner', 'admin');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'visitor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location hierarchy
CREATE TABLE provinces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(province_id, slug)
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_metro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(province_id, slug)
);

CREATE TABLE suburbs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, slug)
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trading_name TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  website TEXT,
  address TEXT,
  province_id UUID NOT NULL REFERENCES provinces(id),
  district_id UUID REFERENCES districts(id),
  city_id UUID NOT NULL REFERENCES cities(id),
  suburb_id UUID REFERENCES suburbs(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  logo_url TEXT,
  membership_tier membership_tier DEFAULT 'free',
  status business_status DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_local_champion BOOLEAN DEFAULT FALSE,
  biz_trust_score INT DEFAULT 0,
  profile_views INT DEFAULT 0,
  search_appearances INT DEFAULT 0,
  lead_response_rate DECIMAL(5, 2) DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_categories (
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, category_id)
);

CREATE TABLE business_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  UNIQUE(business_id, day_of_week)
);

CREATE TABLE business_social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  UNIQUE(business_id, platform)
);

CREATE TABLE business_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status moderation_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reply TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead system
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  province_id UUID NOT NULL REFERENCES provinces(id),
  city_id UUID NOT NULL REFERENCES cities(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  service_description TEXT NOT NULL,
  budget TEXT,
  photo_urls TEXT[],
  popia_consent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  status lead_status DEFAULT 'new',
  credit_deducted BOOLEAN DEFAULT FALSE,
  whatsapp_clicked BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quote_request_id, business_id)
);

CREATE TABLE lead_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  balance INT DEFAULT 0,
  monthly_allocation INT DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  transaction_type TEXT NOT NULL,
  reference_id UUID,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions & payments
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  tier membership_tier NOT NULL,
  status TEXT DEFAULT 'active',
  payfast_token TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type payment_type NOT NULL,
  status payment_status DEFAULT 'pending',
  payfast_payment_id TEXT,
  m_payment_id TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events marketplace
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  venue TEXT,
  province_id UUID REFERENCES provinces(id),
  city_id UUID REFERENCES cities(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  ticket_link TEXT,
  category TEXT,
  status moderation_status DEFAULT 'pending',
  is_paid BOOLEAN DEFAULT FALSE,
  paid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specials marketplace
CREATE TABLE specials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status moderation_status DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advertising
CREATE TABLE featured_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE banner_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  placement TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province_id UUID REFERENCES provinces(id),
  city_id UUID REFERENCES cities(id),
  category_id UUID REFERENCES categories(id),
  search_term TEXT,
  results_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_view_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_businesses_province ON businesses(province_id);
CREATE INDEX idx_businesses_city ON businesses(city_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_tier ON businesses(membership_tier);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_trust ON businesses(biz_trust_score DESC);
CREATE INDEX idx_cities_province ON cities(province_id);
CREATE INDEX idx_leads_business ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_specials_expiry ON specials(expiry_date);
CREATE INDEX idx_events_date ON events(event_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Initialize lead credits on business approval
CREATE OR REPLACE FUNCTION init_lead_credits()
RETURNS TRIGGER AS $$
DECLARE
  monthly_leads INT;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    monthly_leads := CASE NEW.membership_tier
      WHEN 'enterprise' THEN 20
      WHEN 'professional' THEN 10
      WHEN 'starter' THEN 3
      ELSE 1
    END;
    INSERT INTO lead_credits (business_id, balance, monthly_allocation)
    VALUES (NEW.id, monthly_leads, monthly_leads)
    ON CONFLICT (business_id) DO UPDATE
    SET balance = lead_credits.balance + monthly_leads,
        monthly_allocation = monthly_leads,
        last_reset_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_approved_credits
  AFTER UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION init_lead_credits();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Public read for approved businesses
CREATE POLICY "Public read approved businesses" ON businesses
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners manage own business" ON businesses
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public read provinces" ON provinces FOR SELECT USING (true);
CREATE POLICY "Public read districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read suburbs" ON suburbs FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Public read active specials" ON specials
  FOR SELECT USING (status = 'approved' AND expiry_date >= CURRENT_DATE);

CREATE POLICY "Public read approved events" ON events
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners read own leads" ON leads
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners read own credits" ON lead_credits
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Storage buckets (run in Supabase dashboard or via API)
-- business-logos, business-documents, portfolio-images, event-banners, special-images
