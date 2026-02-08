-- =============================================================================
-- TCG Trade Hub - Initial Schema Migration
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE public.tcg_type AS ENUM ('pokemon', 'mtg', 'yugioh');
CREATE TYPE public.listing_type AS ENUM ('wts', 'wtb', 'wtt');
CREATE TYPE public.card_condition AS ENUM ('nm', 'lp', 'mp', 'hp', 'dmg');
CREATE TYPE public.listing_status AS ENUM ('active', 'matched', 'completed', 'expired');
CREATE TYPE public.swipe_direction AS ENUM ('like', 'pass');
CREATE TYPE public.match_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.message_type AS ENUM ('text', 'image', 'card_offer', 'card_offer_response', 'meetup_proposal', 'meetup_response', 'system');
CREATE TYPE public.meetup_status AS ENUM ('confirmed', 'completed', 'cancelled');
CREATE TYPE public.report_category AS ENUM ('inappropriate_content', 'scam', 'counterfeit', 'no_show', 'harassment', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved');

-- =============================================================================
-- TRIGGER FUNCTION: auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE: users (extends auth.users)
-- =============================================================================

CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  avatar_url      TEXT,
  location        extensions.geometry(Point, 4326),
  radius_km       INTEGER NOT NULL DEFAULT 25 CHECK (radius_km >= 5 AND radius_km <= 100),
  preferred_tcgs  public.tcg_type[] NOT NULL DEFAULT '{}',
  rating_score    NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_trades    INTEGER NOT NULL DEFAULT 0,
  expo_push_token TEXT,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- TABLE: collection_items
-- =============================================================================

CREATE TABLE public.collection_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tcg         public.tcg_type NOT NULL,
  external_id TEXT NOT NULL,
  card_name   TEXT NOT NULL,
  set_name    TEXT NOT NULL,
  set_code    TEXT NOT NULL,
  card_number TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  rarity      TEXT,
  condition   public.card_condition NOT NULL DEFAULT 'nm',
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_collection_items_updated_at
  BEFORE UPDATE ON public.collection_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- TABLE: listings
-- =============================================================================

CREATE TABLE public.listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type              public.listing_type NOT NULL,
  tcg               public.tcg_type NOT NULL,
  card_name         TEXT NOT NULL,
  card_set          TEXT NOT NULL,
  card_number       TEXT NOT NULL,
  card_external_id  TEXT NOT NULL,
  card_image_url    TEXT NOT NULL,
  card_rarity       TEXT,
  card_market_price NUMERIC(10,2),
  condition         public.card_condition NOT NULL,
  asking_price      NUMERIC(10,2),
  description       TEXT,
  photos            TEXT[] NOT NULL DEFAULT '{}',
  status            public.listing_status NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- TABLE: swipes
-- =============================================================================

CREATE TABLE public.swipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  direction   public.swipe_direction NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- TABLE: matches
-- =============================================================================

CREATE TABLE public.matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_b_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_a_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  listing_b_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  status        public.match_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- TABLE: conversations
-- =============================================================================

CREATE TABLE public.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- TABLE: messages
-- =============================================================================

CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            public.message_type NOT NULL DEFAULT 'text',
  body            TEXT,
  payload         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- TABLE: shops (before meetups due to FK dependency)
-- =============================================================================

CREATE TABLE public.shops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  address         TEXT NOT NULL,
  location        extensions.geometry(Point, 4326) NOT NULL,
  hours           JSONB,
  website         TEXT,
  phone           TEXT,
  supported_tcgs  public.tcg_type[] NOT NULL DEFAULT '{}',
  verified        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- TABLE: meetups
-- =============================================================================

CREATE TABLE public.meetups (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id            UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  proposal_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  shop_id             UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  location_name       TEXT,
  location_coords     extensions.geometry(Point, 4326),
  proposed_time       TIMESTAMPTZ,
  status              public.meetup_status NOT NULL DEFAULT 'confirmed',
  user_a_completed    BOOLEAN NOT NULL DEFAULT false,
  user_b_completed    BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_meetups_updated_at
  BEFORE UPDATE ON public.meetups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- TABLE: ratings
-- =============================================================================

CREATE TABLE public.ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id   UUID NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  rater_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ratee_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment     TEXT CHECK (char_length(comment) <= 200),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- TABLE: blocks
-- =============================================================================

CREATE TABLE public.blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

-- =============================================================================
-- TABLE: reports
-- =============================================================================

CREATE TABLE public.reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  category            public.report_category NOT NULL,
  description         TEXT,
  status              public.report_status NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- INDEXES
-- =============================================================================

-- users
CREATE INDEX idx_users_location ON public.users USING GIST (location);
CREATE INDEX idx_users_preferred_tcgs ON public.users USING GIN (preferred_tcgs);

-- collection_items
CREATE INDEX idx_collection_items_user_id ON public.collection_items (user_id);
CREATE INDEX idx_collection_items_tcg ON public.collection_items (tcg);
CREATE UNIQUE INDEX idx_collection_items_user_card ON public.collection_items (user_id, external_id, condition);

-- listings
CREATE INDEX idx_listings_user_id ON public.listings (user_id);
CREATE INDEX idx_listings_status ON public.listings (status);
CREATE INDEX idx_listings_tcg ON public.listings (tcg);
CREATE INDEX idx_listings_type ON public.listings (type);
CREATE INDEX idx_listings_card_external_id ON public.listings (card_external_id);
CREATE INDEX idx_listings_active_feed ON public.listings (tcg, type, status, created_at DESC)
  WHERE status = 'active';

-- swipes
CREATE INDEX idx_swipes_user_id ON public.swipes (user_id);
CREATE INDEX idx_swipes_listing_id ON public.swipes (listing_id);
CREATE UNIQUE INDEX idx_swipes_user_listing ON public.swipes (user_id, listing_id);

-- matches
CREATE INDEX idx_matches_user_a_id ON public.matches (user_a_id);
CREATE INDEX idx_matches_user_b_id ON public.matches (user_b_id);
CREATE INDEX idx_matches_status ON public.matches (status);

-- conversations
CREATE INDEX idx_conversations_match_id ON public.conversations (match_id);

-- messages
CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages (sender_id);

-- meetups
CREATE INDEX idx_meetups_match_id ON public.meetups (match_id);
CREATE INDEX idx_meetups_shop_id ON public.meetups (shop_id);
CREATE INDEX idx_meetups_status ON public.meetups (status);

-- shops
CREATE INDEX idx_shops_location ON public.shops USING GIST (location);
CREATE INDEX idx_shops_supported_tcgs ON public.shops USING GIN (supported_tcgs);

-- ratings
CREATE INDEX idx_ratings_meetup_id ON public.ratings (meetup_id);
CREATE INDEX idx_ratings_rater_id ON public.ratings (rater_id);
CREATE INDEX idx_ratings_ratee_id ON public.ratings (ratee_id);
CREATE UNIQUE INDEX idx_ratings_unique_per_meetup ON public.ratings (meetup_id, rater_id);

-- blocks
CREATE INDEX idx_blocks_blocker_id ON public.blocks (blocker_id);
CREATE INDEX idx_blocks_blocked_id ON public.blocks (blocked_id);

-- reports
CREATE INDEX idx_reports_reporter_id ON public.reports (reporter_id);
CREATE INDEX idx_reports_reported_user_id ON public.reports (reported_user_id);
CREATE INDEX idx_reports_status ON public.reports (status);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users: read own + any non-deleted user's public profile. Write own only.
-- -----------------------------------------------------------------------------

CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users_select_public_profiles"
  ON public.users FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- collection_items: read own + read other users' collections. Write own only.
-- -----------------------------------------------------------------------------

CREATE POLICY "collection_items_select_own"
  ON public.collection_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "collection_items_select_others"
  ON public.collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = collection_items.user_id
        AND users.deleted_at IS NULL
    )
  );

CREATE POLICY "collection_items_insert_own"
  ON public.collection_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "collection_items_update_own"
  ON public.collection_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "collection_items_delete_own"
  ON public.collection_items FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- listings: read any active listing. Write own only.
-- -----------------------------------------------------------------------------

CREATE POLICY "listings_select_active"
  ON public.listings FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "listings_insert_own"
  ON public.listings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "listings_update_own"
  ON public.listings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "listings_delete_own"
  ON public.listings FOR DELETE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- swipes: read/write own only.
-- -----------------------------------------------------------------------------

CREATE POLICY "swipes_select_own"
  ON public.swipes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "swipes_insert_own"
  ON public.swipes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- matches: read where user is user_a or user_b. No direct write.
-- -----------------------------------------------------------------------------

CREATE POLICY "matches_select_participant"
  ON public.matches FOR SELECT
  USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- -----------------------------------------------------------------------------
-- conversations: read where user is participant (via match).
-- -----------------------------------------------------------------------------

CREATE POLICY "conversations_select_participant"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = conversations.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- messages: read where user is participant in conversation.
--           Write to own conversations only.
-- -----------------------------------------------------------------------------

CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      JOIN public.matches ON matches.id = conversations.match_id
      WHERE conversations.id = messages.conversation_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations
      JOIN public.matches ON matches.id = conversations.match_id
      WHERE conversations.id = messages.conversation_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- meetups: read where user is participant in match.
--          Write/update where user is participant.
-- -----------------------------------------------------------------------------

CREATE POLICY "meetups_select_participant"
  ON public.meetups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = meetups.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "meetups_insert_participant"
  ON public.meetups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = meetups.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "meetups_update_participant"
  ON public.meetups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = meetups.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = meetups.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- shops: read all. Write admin only (skip write policy for now).
-- -----------------------------------------------------------------------------

CREATE POLICY "shops_select_all"
  ON public.shops FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- ratings: read all. Write only if rater_id = auth.uid() and participated in meetup.
-- -----------------------------------------------------------------------------

CREATE POLICY "ratings_select_all"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "ratings_insert_participant"
  ON public.ratings FOR INSERT
  WITH CHECK (
    rater_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.meetups
      JOIN public.matches ON matches.id = meetups.match_id
      WHERE meetups.id = ratings.meetup_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- blocks: read/write own (blocker_id = auth.uid()).
-- -----------------------------------------------------------------------------

CREATE POLICY "blocks_select_own"
  ON public.blocks FOR SELECT
  USING (blocker_id = auth.uid());

CREATE POLICY "blocks_insert_own"
  ON public.blocks FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "blocks_delete_own"
  ON public.blocks FOR DELETE
  USING (blocker_id = auth.uid());

-- -----------------------------------------------------------------------------
-- reports: write own. Read admin only (skip read policy for now).
-- -----------------------------------------------------------------------------

CREATE POLICY "reports_insert_own"
  ON public.reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());
