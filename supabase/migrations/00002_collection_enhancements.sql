-- Migration: Collection enhancements
-- Adds wishlist, grading, sealed products, and pricing to collection_items

-- Add new columns
ALTER TABLE public.collection_items
  ADD COLUMN is_wishlist BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN market_price NUMERIC DEFAULT NULL,
  ADD COLUMN grading_company TEXT DEFAULT NULL,
  ADD COLUMN grading_score TEXT DEFAULT NULL,
  ADD COLUMN is_sealed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN product_type TEXT DEFAULT NULL,
  ADD COLUMN purchase_price NUMERIC DEFAULT NULL;

-- Drop old unique index and create new one including is_wishlist
DROP INDEX IF EXISTS idx_collection_items_user_card;

CREATE UNIQUE INDEX idx_collection_items_user_card
  ON public.collection_items(user_id, external_id, condition, is_wishlist);

-- Add indexes for common queries
CREATE INDEX idx_collection_wishlist
  ON public.collection_items(user_id, is_wishlist);

CREATE INDEX idx_collection_sealed
  ON public.collection_items(user_id, is_sealed);
