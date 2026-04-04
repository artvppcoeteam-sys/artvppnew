-- Creative Services Module Migration
-- Includes: Commission Services, Pre-Release Products, Bookable Sessions

CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- ==========================================
-- TYPE 1: COMMISSION SERVICES (Fiverr-style)
-- ==========================================

-- Main services table
CREATE TABLE IF NOT EXISTS creative_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('commission', 'prerelease', 'booking')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  main_image_url TEXT,
  gallery_images TEXT[],
  portfolio_ids UUID[],
  
  -- Commission Service specific fields
  extra_revision_price NUMERIC(10,2),
  is_limited BOOLEAN DEFAULT false,
  max_orders_allowed INTEGER,
  current_orders INTEGER DEFAULT 0,
  
  -- Pre-release Service specific fields
  release_date TIMESTAMP,
  is_digital BOOLEAN,
  product_type VARCHAR(50),
  
  -- Booking Service specific fields
  event_date TIMESTAMP,
  event_time TIME,
  total_seats INTEGER,
  booked_seats INTEGER DEFAULT 0,
  location_details TEXT,
  invite_link_token VARCHAR(255),
  
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_creative_services_artist FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
);

-- Pricing tiers for commission services (Basic, Standard, Premium)
CREATE TABLE IF NOT EXISTS service_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL,
  tier_name VARCHAR(50) NOT NULL CHECK (tier_name IN ('Basic', 'Standard', 'Premium')),
  price NUMERIC(10,2) NOT NULL,
  delivery_days INTEGER NOT NULL,
  included_features TEXT[],
  num_revisions INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_service_tiers_service FOREIGN KEY (service_id) REFERENCES creative_services(id) ON DELETE CASCADE,
  CONSTRAINT unique_tier_per_service UNIQUE(service_id, tier_name)
);

-- ==========================================
-- TYPE 2: PRE-RELEASE / LIMITED DROP
-- ==========================================

CREATE TABLE IF NOT EXISTS prerelease_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  tier_id UUID,
  quantity INTEGER DEFAULT 1,
  total_price NUMERIC(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pre_ordered' CHECK (status IN ('pre_ordered', 'released', 'shipped', 'completed', 'cancelled')),
  download_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_prerelease_orders_service FOREIGN KEY (service_id) REFERENCES creative_services(id) ON DELETE CASCADE,
  CONSTRAINT fk_prerelease_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_prerelease_orders_tier FOREIGN KEY (tier_id) REFERENCES service_tiers(id) ON DELETE SET NULL
);

-- ==========================================
-- TYPE 3: BOOKABLE SESSIONS / WORKSHOPS
-- ==========================================

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'confirmed', 'completed', 'cancelled')),
  seats_booked INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES creative_services(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- COMMISSION SERVICE ORDERS
-- ==========================================

CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL,
  tier_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  artist_id UUID NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled')),
  requirements TEXT,
  revisions_used INTEGER DEFAULT 0,
  extra_revisions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_service_orders_service FOREIGN KEY (service_id) REFERENCES creative_services(id) ON DELETE CASCADE,
  CONSTRAINT fk_service_orders_tier FOREIGN KEY (tier_id) REFERENCES service_tiers(id) ON DELETE CASCADE,
  CONSTRAINT fk_service_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_service_orders_artist FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_creative_services_artist_id ON creative_services(artist_id);
CREATE INDEX IF NOT EXISTS idx_creative_services_service_type ON creative_services(service_type);
CREATE INDEX IF NOT EXISTS idx_creative_services_status ON creative_services(status);
CREATE INDEX IF NOT EXISTS idx_service_tiers_service_id ON service_tiers(service_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_service_id ON service_orders(service_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_customer_id ON service_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_artist_id ON service_orders(artist_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_prerelease_orders_service_id ON prerelease_orders(service_id);
CREATE INDEX IF NOT EXISTS idx_prerelease_orders_customer_id ON prerelease_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

COMMIT;
