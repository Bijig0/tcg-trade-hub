-- Have/Want system: add accepts_cash and accepts_trades columns
-- These replace the rigid WTS/WTB/WTT single-type model with composable booleans.
-- A listing can now accept cash, trades, or both.

ALTER TABLE public.listings
  ADD COLUMN accepts_cash boolean NOT NULL DEFAULT false,
  ADD COLUMN accepts_trades boolean NOT NULL DEFAULT false;

-- Backfill existing data based on current type
UPDATE public.listings SET accepts_cash = true WHERE type = 'wts';
UPDATE public.listings SET accepts_trades = true WHERE type = 'wtt';
UPDATE public.listings SET accepts_cash = true WHERE type = 'wtb';

-- Index for the new filter columns (only active listings matter for feed)
CREATE INDEX idx_listings_accepts ON public.listings (accepts_cash, accepts_trades)
  WHERE status = 'active';

-- Enable trigram extension for fuzzy card name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram index on listing_items.card_name for search
CREATE INDEX idx_listing_items_card_name_trgm
  ON public.listing_items USING gin (card_name gin_trgm_ops);
