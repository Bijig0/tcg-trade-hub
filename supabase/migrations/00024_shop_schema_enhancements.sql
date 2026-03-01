-- Expand tcg_type enum with new TCGs
ALTER TYPE public.tcg_type ADD VALUE IF NOT EXISTS 'lorcana';
ALTER TYPE public.tcg_type ADD VALUE IF NOT EXISTS 'fab';
ALTER TYPE public.tcg_type ADD VALUE IF NOT EXISTS 'starwars';
ALTER TYPE public.tcg_type ADD VALUE IF NOT EXISTS 'onepiece';

-- Add new columns to shops table
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS suburb TEXT,
  ADD COLUMN IF NOT EXISTS google_rating NUMERIC(2,1),
  ADD COLUMN IF NOT EXISTS google_review_count INTEGER,
  ADD COLUMN IF NOT EXISTS social_links JSONB,
  ADD COLUMN IF NOT EXISTS hosts_events BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seating_capacity INTEGER;
