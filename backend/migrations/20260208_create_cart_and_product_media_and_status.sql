-- Migration: create cart table, product_media table, and add status to products
BEGIN;

-- Create cart table (simple structure; product_id/variant_id are UUIDs)
CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  variant_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- Create product_media table (no FK to avoid migration failure if products missing)
CREATE TABLE IF NOT EXISTS product_media (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);

-- Add `status` column to products if missing (default active)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

COMMIT;
