-- Migration: Remove artist_profiles foreign keys and use users.id directly
-- This migration changes creative_services and service_orders to reference users(id) instead of artist_profiles(id)

-- Drop FK constraints from creative_services and service_orders that reference artist_profiles
ALTER TABLE creative_services DROP CONSTRAINT IF EXISTS fk_creative_services_artist;
ALTER TABLE service_orders DROP CONSTRAINT IF EXISTS fk_service_orders_artist;

-- Add new FK constraints referencing users table
ALTER TABLE creative_services 
ADD CONSTRAINT fk_creative_services_artist FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE service_orders 
ADD CONSTRAINT fk_service_orders_artist FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE;

-- Drop the artist_profiles table and related tables (optional cleanup)
-- Uncomment the lines below ONLY after confirming data migration is complete
-- DROP TABLE IF EXISTS artist_portfolio;
-- DROP TABLE IF EXISTS artist_payouts;
-- DROP TABLE IF EXISTS artist_profiles;

-- Note: Keeping artist_profiles table intact for now; it will be unused by the application
