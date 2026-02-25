-- ============================================================================
-- Migration: Status transition triggers + Realtime publication
--
-- Adds BEFORE UPDATE triggers on all status columns to enforce valid
-- state transitions at the database level. Also enables Realtime for
-- offers, matches, meetups, and listings tables.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Generic helper: validates a status transition against a JSONB map
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_status_transition(
  p_table_name TEXT,
  p_old_status TEXT,
  p_new_status TEXT,
  p_allowed JSONB
)
RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  v_valid_targets JSONB;
BEGIN
  -- Same status → no-op, allow it
  IF p_old_status = p_new_status THEN
    RETURN;
  END IF;

  v_valid_targets := p_allowed -> p_old_status;

  IF v_valid_targets IS NULL OR NOT v_valid_targets ? p_new_status THEN
    RAISE EXCEPTION 'Invalid % status transition: "%" → "%". Allowed from "%": %',
      p_table_name,
      p_old_status,
      p_new_status,
      p_old_status,
      COALESCE(v_valid_targets::TEXT, '[]');
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Listings: active → matched | expired; matched → completed
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_listing_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM validate_status_transition(
    'listing',
    OLD.status::TEXT,
    NEW.status::TEXT,
    '{"active": ["matched", "expired"], "matched": ["completed"], "completed": [], "expired": []}'::JSONB
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_listing_status_transition
  BEFORE UPDATE OF status ON listings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION enforce_listing_status_transition();

-- ---------------------------------------------------------------------------
-- Offers: pending → accepted | declined | countered | withdrawn;
--         countered → accepted | declined | withdrawn
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_offer_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM validate_status_transition(
    'offer',
    OLD.status::TEXT,
    NEW.status::TEXT,
    '{"pending": ["accepted", "declined", "countered", "withdrawn"], "countered": ["accepted", "declined", "withdrawn"], "accepted": [], "declined": [], "withdrawn": []}'::JSONB
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_offer_status_transition
  BEFORE UPDATE OF status ON offers
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION enforce_offer_status_transition();

-- ---------------------------------------------------------------------------
-- Matches: active → completed | cancelled
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_match_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM validate_status_transition(
    'match',
    OLD.status::TEXT,
    NEW.status::TEXT,
    '{"active": ["completed", "cancelled"], "completed": [], "cancelled": []}'::JSONB
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_match_status_transition
  BEFORE UPDATE OF status ON matches
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION enforce_match_status_transition();

-- ---------------------------------------------------------------------------
-- Meetups: confirmed → completed | cancelled
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_meetup_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM validate_status_transition(
    'meetup',
    OLD.status::TEXT,
    NEW.status::TEXT,
    '{"confirmed": ["completed", "cancelled"], "completed": [], "cancelled": []}'::JSONB
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_meetup_status_transition
  BEFORE UPDATE OF status ON meetups
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION enforce_meetup_status_transition();

-- ---------------------------------------------------------------------------
-- Reports: pending → reviewed; reviewed → resolved
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_report_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM validate_status_transition(
    'report',
    OLD.status::TEXT,
    NEW.status::TEXT,
    '{"pending": ["reviewed"], "reviewed": ["resolved"], "resolved": []}'::JSONB
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_report_status_transition
  BEFORE UPDATE OF status ON reports
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION enforce_report_status_transition();

-- ---------------------------------------------------------------------------
-- Enable Realtime for tables that need live updates between peers
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['offers', 'matches', 'meetups', 'listings']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
    END IF;
  END LOOP;
END $$;
