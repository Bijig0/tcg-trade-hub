-- =============================================================================
-- Pre-Registration Table
-- Collects pre-launch signups before the mobile app goes live.
-- =============================================================================

CREATE TABLE public.pre_registrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  display_name    TEXT,
  tcg             public.tcg_type NOT NULL,
  card_name       TEXT NOT NULL,
  card_set        TEXT,
  card_external_id TEXT,
  card_image_url  TEXT,
  listing_type    public.listing_type NOT NULL,
  asking_price    NUMERIC(10,2),
  city            TEXT,
  zip_code        TEXT,
  country         TEXT DEFAULT 'US',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email)
);

CREATE TRIGGER set_pre_registrations_updated_at
  BEFORE UPDATE ON public.pre_registrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_pre_registrations_email ON public.pre_registrations (email);
CREATE INDEX idx_pre_registrations_tcg ON public.pre_registrations (tcg);
CREATE INDEX idx_pre_registrations_listing_type ON public.pre_registrations (listing_type);

-- RLS: Public inserts (no auth), no public reads
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pre_registrations_insert_public"
  ON public.pre_registrations FOR INSERT
  WITH CHECK (true);
