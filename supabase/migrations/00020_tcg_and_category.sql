-- Migration: Add 'onepiece' to tcg_type enum + listing_category column
-- Keep 'yugioh' in DB enum (removing enum values requires type recreation)

-- Add onepiece to tcg_type enum (non-destructive, idempotent)
ALTER TYPE public.tcg_type ADD VALUE IF NOT EXISTS 'onepiece';

-- Listing category enum
CREATE TYPE public.listing_category AS ENUM ('singles', 'sealed', 'graded', 'bulk');

-- Add category column to listings
ALTER TABLE public.listings
  ADD COLUMN category public.listing_category NOT NULL DEFAULT 'singles';

-- Partial index for category filtering on active listings
CREATE INDEX idx_listings_category ON public.listings (category) WHERE status = 'active';
