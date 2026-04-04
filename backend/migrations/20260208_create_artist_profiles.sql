-- Create artist_profiles, artist_portfolio, artist_payouts, and service tables
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- Artist profiles table
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  profile_photo TEXT,
  country TEXT,
  languages VARCHAR(255),
  years_experience INTEGER,
  styles TEXT,
  mediums TEXT,
  price_range TEXT,
  typical_delivery_days INTEGER DEFAULT 7,
  accepts_custom_requests BOOLEAN DEFAULT true,
  accepts_rush BOOLEAN DEFAULT false,
  payout_details JSONB,
  onboarding_step INTEGER DEFAULT 0,
  portfolio_completed BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'incomplete',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_artist_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Artist portfolio items table
CREATE TABLE IF NOT EXISTS artist_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_profile_id UUID NOT NULL,
  media_url TEXT,
  media_type VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_artist_portfolio_profile FOREIGN KEY (artist_profile_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
);

-- Artist payouts table
CREATE TABLE IF NOT EXISTS artist_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  total_withdrawn NUMERIC(12,2) DEFAULT 0,
  available_balance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_artist_payouts_artist FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
);
-- Create indexes for performance
CREATE INDEX idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX idx_artist_portfolio_profile_id ON artist_portfolio(artist_profile_id);

COMMIT;
