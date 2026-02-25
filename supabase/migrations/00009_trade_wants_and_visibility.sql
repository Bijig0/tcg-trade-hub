-- Structured trade wants on listings (JSONB array of discriminated union objects)
ALTER TABLE public.listings
  ADD COLUMN trade_wants JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Per-item visibility toggle for collections
ALTER TABLE public.collection_items
  ADD COLUMN is_tradeable BOOLEAN NOT NULL DEFAULT true;

-- Auto-match user preference
ALTER TABLE public.users
  ADD COLUMN auto_match BOOLEAN NOT NULL DEFAULT false;
