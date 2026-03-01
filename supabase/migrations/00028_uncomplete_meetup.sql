-- ============================================================================
--   uncomplete_meetup_v1 — Undo a user's completion flag on a meetup
-- ============================================================================

-- ---------------------------------------------------------------------------
-- uncomplete_meetup_v1
--
-- Resets the current user's completion flag on a meetup.
-- Only allowed when the meetup is still in 'confirmed' status (i.e. the
-- other party has NOT yet completed — once both complete, the meetup is
-- atomically finalized and irreversible).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.uncomplete_meetup_v1(
  p_meetup_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_meetup RECORD;
  v_match RECORD;
  v_is_user_a BOOLEAN;
BEGIN
  -- Lock and fetch meetup
  SELECT * INTO v_meetup
  FROM meetups
  WHERE id = p_meetup_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meetup not found: %', p_meetup_id;
  END IF;

  IF v_meetup.status != 'confirmed' THEN
    RAISE EXCEPTION 'Cannot undo completion — meetup status is %', v_meetup.status;
  END IF;

  -- Fetch match to verify participation
  SELECT * INTO v_match
  FROM matches
  WHERE id = v_meetup.match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found for meetup: %', p_meetup_id;
  END IF;

  v_is_user_a := (v_match.user_a_id = p_user_id);

  IF NOT v_is_user_a AND v_match.user_b_id != p_user_id THEN
    RAISE EXCEPTION 'Not a participant in this meetup';
  END IF;

  -- Check that the user HAS completed (otherwise nothing to undo)
  IF v_is_user_a AND NOT v_meetup.user_a_completed THEN
    RAISE EXCEPTION 'You have not completed this meetup yet';
  END IF;
  IF NOT v_is_user_a AND NOT v_meetup.user_b_completed THEN
    RAISE EXCEPTION 'You have not completed this meetup yet';
  END IF;

  -- Reset the completion flag
  IF v_is_user_a THEN
    UPDATE meetups
    SET user_a_completed = false, updated_at = now()
    WHERE id = p_meetup_id;
  ELSE
    UPDATE meetups
    SET user_b_completed = false, updated_at = now()
    WHERE id = p_meetup_id;
  END IF;

  RETURN jsonb_build_object(
    'meetup_id', p_meetup_id,
    'uncompleted', true
  );
END;
$$;
