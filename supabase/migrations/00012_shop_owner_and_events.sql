-- ============================================================================
-- Migration: Shop owner, events, and notifications
--
-- 1. ALTER shops — add owner_id, description, email, logo_url, cover_photo_url
-- 2. CREATE shop_events with status transition trigger
-- 3. CREATE shop_notifications
-- 4. RLS policies for all three tables
-- 5. Realtime publication for shop_events and shop_notifications
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. ALTER shops — add new columns for shop portal
-- ---------------------------------------------------------------------------

ALTER TABLE public.shops
  ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN description TEXT,
  ADD COLUMN email TEXT,
  ADD COLUMN logo_url TEXT,
  ADD COLUMN cover_photo_url TEXT;

CREATE INDEX idx_shops_owner_id ON public.shops (owner_id);
CREATE UNIQUE INDEX idx_shops_owner_id_unique ON public.shops (owner_id) WHERE owner_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. CREATE shop_events
-- ---------------------------------------------------------------------------

CREATE TYPE public.shop_event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

CREATE TABLE public.shop_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id           UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  event_type        TEXT NOT NULL,
  tcg               public.tcg_type,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ,
  max_participants  INTEGER,
  entry_fee         NUMERIC(10,2),
  image_url         TEXT,
  status            public.shop_event_status NOT NULL DEFAULT 'draft',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_shop_events_updated_at
  BEFORE UPDATE ON public.shop_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_shop_events_shop_id ON public.shop_events (shop_id);
CREATE INDEX idx_shop_events_starts_at ON public.shop_events (starts_at);
CREATE INDEX idx_shop_events_status ON public.shop_events (status);
CREATE INDEX idx_shop_events_published_upcoming ON public.shop_events (starts_at)
  WHERE status = 'published';

-- ---------------------------------------------------------------------------
-- 3. CREATE shop_notifications
-- ---------------------------------------------------------------------------

CREATE TABLE public.shop_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  payload     JSONB,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shop_notifications_shop_created ON public.shop_notifications (shop_id, created_at DESC);
CREATE INDEX idx_shop_notifications_unread ON public.shop_notifications (shop_id)
  WHERE read = false;

-- ---------------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.shop_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_notifications ENABLE ROW LEVEL SECURITY;

-- shops: INSERT for authenticated users (owner_id set to their uid)
CREATE POLICY "shops_insert_owner"
  ON public.shops FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- shops: UPDATE for owner only
CREATE POLICY "shops_update_owner"
  ON public.shops FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- shop_events: SELECT published events OR own shop's events
CREATE POLICY "shop_events_select_published_or_owner"
  ON public.shop_events FOR SELECT
  USING (
    status = 'published'
    OR EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_events.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- shop_events: INSERT for shop owner
CREATE POLICY "shop_events_insert_owner"
  ON public.shop_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_events.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- shop_events: UPDATE for shop owner
CREATE POLICY "shop_events_update_owner"
  ON public.shop_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_events.shop_id
        AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_events.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- shop_events: DELETE for shop owner
CREATE POLICY "shop_events_delete_owner"
  ON public.shop_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_events.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- shop_notifications: SELECT for shop owner
CREATE POLICY "shop_notifications_select_owner"
  ON public.shop_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_notifications.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- shop_notifications: UPDATE (mark read) for shop owner
CREATE POLICY "shop_notifications_update_owner"
  ON public.shop_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_notifications.shop_id
        AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_notifications.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Status transition trigger for shop_events
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION enforce_shop_event_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM validate_status_transition(
    'shop_event',
    OLD.status::TEXT,
    NEW.status::TEXT,
    '{"draft": ["published", "cancelled"], "published": ["cancelled", "completed"], "cancelled": [], "completed": []}'::JSONB
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_shop_event_status_transition
  BEFORE UPDATE OF status ON shop_events
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION enforce_shop_event_status_transition();

-- ---------------------------------------------------------------------------
-- 6. Realtime publication
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['shop_events', 'shop_notifications']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
    END IF;
  END LOOP;
END $$;
