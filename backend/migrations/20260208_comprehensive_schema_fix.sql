-- Comprehensive migration: ensure all tables and columns exist with correct structure
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- Ensure artist_profiles exists with all columns
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

-- Ensure artist_portfolio exists with correct columns (artist_profile_id, not artist_id)
CREATE TABLE IF NOT EXISTS artist_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_profile_id UUID NOT NULL,
  media_url TEXT,
  media_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_artist_portfolio_profile FOREIGN KEY (artist_profile_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
);

-- Add missing columns to artist_portfolio if they don't exist
ALTER TABLE artist_portfolio
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Ensure artist_payouts exists
CREATE TABLE IF NOT EXISTS artist_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  total_withdrawn NUMERIC(12,2) DEFAULT 0,
  available_balance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_artist_payouts_profile FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
);

-- Ensure service_listings exists with all columns
-- Service-related tables removed from migration (service feature deleted)

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_portfolio_profile_id ON artist_portfolio(artist_profile_id);

COMMIT;
