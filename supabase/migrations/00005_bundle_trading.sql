-- =============================================================================
-- Migration: Bundle-Based Trading
-- Transforms listings from single-card-per-row to bundle model.
-- Adds listing_items, offers, offer_items tables.
-- Updates matches to reference listing + offer instead of two listings.
-- =============================================================================

-- =============================================================================
-- 1. NEW ENUM: offer_status
-- =============================================================================

CREATE TYPE public.offer_status AS ENUM ('pending', 'accepted', 'declined', 'countered', 'withdrawn');

-- =============================================================================
-- 2. MODIFY: listings table — migrate data, then restructure
-- =============================================================================

-- Add new bundle columns first (nullable to allow migration)
ALTER TABLE public.listings
  ADD COLUMN title TEXT,
  ADD COLUMN cash_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN total_value NUMERIC NOT NULL DEFAULT 0;

-- Migrate existing listing data into new columns
UPDATE public.listings SET
  title = card_name,
  cash_amount = COALESCE(asking_price, 0),
  total_value = COALESCE(card_market_price, 0) + COALESCE(asking_price, 0);

-- Now make title NOT NULL
ALTER TABLE public.listings ALTER COLUMN title SET NOT NULL;

-- =============================================================================
-- 3. CREATE: listing_items table (before dropping listing card columns)
-- =============================================================================

CREATE TABLE public.listing_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id       UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  collection_item_id UUID REFERENCES public.collection_items(id) ON DELETE SET NULL,
  card_name        TEXT NOT NULL,
  card_image_url   TEXT NOT NULL,
  card_external_id TEXT NOT NULL,
  tcg              public.tcg_type NOT NULL,
  card_set         TEXT,
  card_number      TEXT,
  card_rarity      TEXT,
  condition        public.card_condition NOT NULL DEFAULT 'nm',
  market_price     NUMERIC,
  asking_price     NUMERIC,
  quantity         INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migrate existing single-card listings into listing_items
INSERT INTO public.listing_items (
  listing_id, card_name, card_image_url, card_external_id,
  tcg, card_set, card_number, card_rarity, condition,
  market_price, asking_price, quantity
)
SELECT
  id, card_name, card_image_url, card_external_id,
  tcg, card_set, card_number, card_rarity, condition,
  card_market_price, asking_price, 1
FROM public.listings;

-- =============================================================================
-- 4. DROP old single-card columns from listings
-- =============================================================================

-- Drop old indexes that reference card columns
DROP INDEX IF EXISTS idx_listings_card_external_id;
DROP INDEX IF EXISTS idx_listings_active_feed;

ALTER TABLE public.listings
  DROP COLUMN card_name,
  DROP COLUMN card_set,
  DROP COLUMN card_number,
  DROP COLUMN card_external_id,
  DROP COLUMN card_image_url,
  DROP COLUMN card_rarity,
  DROP COLUMN card_market_price,
  DROP COLUMN condition,
  DROP COLUMN IF EXISTS asking_price,
  DROP COLUMN IF EXISTS trade_wants;

-- Recreate active feed index without card columns
CREATE INDEX idx_listings_active_feed ON public.listings (tcg, type, status, created_at DESC)
  WHERE status = 'active';

-- =============================================================================
-- 5. CREATE: offers table
-- =============================================================================

CREATE TABLE public.offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  offerer_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status          public.offer_status NOT NULL DEFAULT 'pending',
  cash_amount     NUMERIC NOT NULL DEFAULT 0,
  message         TEXT,
  parent_offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 6. CREATE: offer_items table
-- =============================================================================

CREATE TABLE public.offer_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id         UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  collection_item_id UUID REFERENCES public.collection_items(id) ON DELETE SET NULL,
  card_name        TEXT NOT NULL,
  card_image_url   TEXT NOT NULL,
  card_external_id TEXT NOT NULL,
  tcg              public.tcg_type NOT NULL,
  card_set         TEXT,
  card_number      TEXT,
  condition        public.card_condition NOT NULL DEFAULT 'nm',
  market_price     NUMERIC,
  quantity         INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 7. MODIFY: matches table — switch from dual-listing to listing+offer
-- =============================================================================

-- Clear existing matches (dev/demo data, safe to drop)
TRUNCATE public.meetups CASCADE;
TRUNCATE public.conversations CASCADE;
TRUNCATE public.matches CASCADE;

-- Drop old FK columns
ALTER TABLE public.matches
  DROP COLUMN listing_a_id,
  DROP COLUMN listing_b_id;

-- Add new columns
ALTER TABLE public.matches
  ADD COLUMN listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  ADD COLUMN offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE;

-- =============================================================================
-- 8. INDEXES for new tables
-- =============================================================================

-- listing_items
CREATE INDEX idx_listing_items_listing_id ON public.listing_items (listing_id);
CREATE INDEX idx_listing_items_card_external_id ON public.listing_items (card_external_id);
CREATE INDEX idx_listing_items_tcg ON public.listing_items (tcg);

-- offers
CREATE INDEX idx_offers_listing_id ON public.offers (listing_id);
CREATE INDEX idx_offers_offerer_id ON public.offers (offerer_id);
CREATE INDEX idx_offers_status ON public.offers (status);
CREATE INDEX idx_offers_parent_id ON public.offers (parent_offer_id) WHERE parent_offer_id IS NOT NULL;

-- offer_items
CREATE INDEX idx_offer_items_offer_id ON public.offer_items (offer_id);
CREATE INDEX idx_offer_items_card_external_id ON public.offer_items (card_external_id);

-- matches (new columns)
CREATE INDEX idx_matches_listing_id ON public.matches (listing_id);
CREATE INDEX idx_matches_offer_id ON public.matches (offer_id);

-- =============================================================================
-- 9. ENABLE RLS on new tables
-- =============================================================================

ALTER TABLE public.listing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_items ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 10. RLS POLICIES
-- =============================================================================

-- listing_items: read if listing is active or owned by user. Write via listing owner.
CREATE POLICY "listing_items_select"
  ON public.listing_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_items.listing_id
        AND (listings.status = 'active' OR listings.user_id = auth.uid())
    )
  );

CREATE POLICY "listing_items_insert_own"
  ON public.listing_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_items.listing_id
        AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "listing_items_delete_own"
  ON public.listing_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_items.listing_id
        AND listings.user_id = auth.uid()
    )
  );

-- offers: read if you're the listing owner or the offerer. Write own only.
CREATE POLICY "offers_select_participant"
  ON public.offers FOR SELECT
  USING (
    offerer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = offers.listing_id
        AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "offers_insert_own"
  ON public.offers FOR INSERT
  WITH CHECK (offerer_id = auth.uid());

CREATE POLICY "offers_update_participant"
  ON public.offers FOR UPDATE
  USING (
    offerer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = offers.listing_id
        AND listings.user_id = auth.uid()
    )
  );

-- offer_items: read if user can see the parent offer. Write own offers only.
CREATE POLICY "offer_items_select"
  ON public.offer_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.offers
      WHERE offers.id = offer_items.offer_id
        AND (
          offers.offerer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = offers.listing_id
              AND listings.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "offer_items_insert_own"
  ON public.offer_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.offers
      WHERE offers.id = offer_items.offer_id
        AND offers.offerer_id = auth.uid()
    )
  );
