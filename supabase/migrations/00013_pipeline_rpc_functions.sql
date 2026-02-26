-- ============================================================================
-- Migration: Pipeline RPC Functions
--
-- Atomic Postgres functions called by the Pipeline Registry layer.
-- Each function performs all multi-table writes in a single transaction.
-- Called via supabase.rpc() from packages/api/src/pipelines/*.
--
-- Functions:
--   accept_offer_v1   — Accept offer, decline siblings, create match + conversation
--   decline_offer_v1  — Decline a single offer
--   complete_meetup_v1 — Mark user's side complete, finalize if both done
--   expire_listing_v1  — Soft-delete listing + withdraw pending offers
--   create_offer_v1    — Create offer + offer items atomically
-- ============================================================================

-- ---------------------------------------------------------------------------
-- accept_offer_v1
--
-- Atomically:
-- 1. Accept the target offer (transition trigger validates pending→accepted)
-- 2. Decline all other pending/countered offers on the same listing
-- 3. Create a match record
-- 4. Transition the listing to 'matched'
-- 5. Create a conversation
-- 6. Insert a system message
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_offer_v1(
  p_offer_id UUID,
  p_listing_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer RECORD;
  v_listing RECORD;
  v_match_id UUID;
  v_conversation_id UUID;
  v_declined_count INTEGER;
BEGIN
  -- Lock and fetch the offer
  SELECT * INTO v_offer
  FROM offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found: %', p_offer_id;
  END IF;

  IF v_offer.listing_id != p_listing_id THEN
    RAISE EXCEPTION 'Offer does not belong to this listing';
  END IF;

  -- Lock and fetch the listing
  SELECT * INTO v_listing
  FROM listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found: %', p_listing_id;
  END IF;

  IF v_listing.user_id != p_user_id THEN
    RAISE EXCEPTION 'Not the listing owner';
  END IF;

  -- 1. Accept the offer (status transition trigger validates pending→accepted)
  UPDATE offers SET status = 'accepted' WHERE id = p_offer_id;

  -- 2. Decline all other pending/countered offers on this listing
  WITH declined AS (
    UPDATE offers
    SET status = 'declined'
    WHERE listing_id = p_listing_id
      AND id != p_offer_id
      AND status IN ('pending', 'countered')
    RETURNING id
  )
  SELECT count(*) INTO v_declined_count FROM declined;

  -- 3. Create match
  INSERT INTO matches (user_a_id, user_b_id, listing_id, offer_id)
  VALUES (p_user_id, v_offer.offerer_id, p_listing_id, p_offer_id)
  RETURNING id INTO v_match_id;

  -- 4. Transition listing to matched
  UPDATE listings SET status = 'matched' WHERE id = p_listing_id;

  -- 5. Create conversation
  INSERT INTO conversations (match_id)
  VALUES (v_match_id)
  RETURNING id INTO v_conversation_id;

  -- 6. Insert system message
  INSERT INTO messages (conversation_id, sender_id, type, body, payload)
  VALUES (
    v_conversation_id,
    p_user_id,
    'system',
    'Offer accepted! Start chatting to arrange your trade.',
    jsonb_build_object('event', 'offer_accepted')
  );

  RETURN jsonb_build_object(
    'match_id', v_match_id,
    'conversation_id', v_conversation_id,
    'declined_offer_count', v_declined_count
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- decline_offer_v1
--
-- Declines a single offer. Only the listing owner can decline.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decline_offer_v1(
  p_offer_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer RECORD;
  v_listing_owner_id UUID;
BEGIN
  -- Lock the offer
  SELECT * INTO v_offer
  FROM offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found: %', p_offer_id;
  END IF;

  -- Verify listing ownership
  SELECT user_id INTO v_listing_owner_id
  FROM listings
  WHERE id = v_offer.listing_id;

  IF v_listing_owner_id IS NULL THEN
    RAISE EXCEPTION 'Listing not found for offer: %', p_offer_id;
  END IF;

  IF v_listing_owner_id != p_user_id THEN
    RAISE EXCEPTION 'Not the listing owner';
  END IF;

  -- Decline (transition trigger validates the status change)
  UPDATE offers SET status = 'declined' WHERE id = p_offer_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ---------------------------------------------------------------------------
-- complete_meetup_v1
--
-- Marks the current user's completion flag on a meetup.
-- If both parties have completed, atomically finalizes the meetup and match,
-- and increments both users' total_trades counters.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_meetup_v1(
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
  v_both_completed BOOLEAN;
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
    RAISE EXCEPTION 'Meetup is not in confirmed state (current: %)', v_meetup.status;
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

  -- Check not already completed by this user
  IF v_is_user_a AND v_meetup.user_a_completed THEN
    RAISE EXCEPTION 'Already marked as completed';
  END IF;
  IF NOT v_is_user_a AND v_meetup.user_b_completed THEN
    RAISE EXCEPTION 'Already marked as completed';
  END IF;

  -- Set this user's completion flag
  IF v_is_user_a THEN
    UPDATE meetups SET user_a_completed = true WHERE id = p_meetup_id;
    v_both_completed := v_meetup.user_b_completed;
  ELSE
    UPDATE meetups SET user_b_completed = true WHERE id = p_meetup_id;
    v_both_completed := v_meetup.user_a_completed;
  END IF;

  -- If both completed, finalize everything
  IF v_both_completed THEN
    -- Transition triggers validate these status changes
    UPDATE meetups SET status = 'completed' WHERE id = p_meetup_id;
    UPDATE matches SET status = 'completed' WHERE id = v_meetup.match_id;

    -- Atomic increment — no read-then-write race condition
    UPDATE users SET total_trades = total_trades + 1
    WHERE id IN (v_match.user_a_id, v_match.user_b_id);
  END IF;

  RETURN jsonb_build_object(
    'meetup_id', p_meetup_id,
    'both_completed', v_both_completed
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- expire_listing_v1
--
-- Soft-deletes a listing by setting status to 'expired'.
-- Also withdraws any pending/countered offers on the listing.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_listing_v1(
  p_listing_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing RECORD;
  v_withdrawn_count INTEGER;
BEGIN
  -- Lock and fetch listing
  SELECT * INTO v_listing
  FROM listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found: %', p_listing_id;
  END IF;

  IF v_listing.user_id != p_user_id THEN
    RAISE EXCEPTION 'Not the listing owner';
  END IF;

  -- Transition trigger validates active→expired
  UPDATE listings SET status = 'expired' WHERE id = p_listing_id;

  -- Withdraw any pending/countered offers
  WITH withdrawn AS (
    UPDATE offers
    SET status = 'withdrawn'
    WHERE listing_id = p_listing_id
      AND status IN ('pending', 'countered')
    RETURNING id
  )
  SELECT count(*) INTO v_withdrawn_count FROM withdrawn;

  RETURN jsonb_build_object(
    'success', true,
    'withdrawn_offer_count', v_withdrawn_count
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- create_offer_v1
--
-- Creates an offer and its items atomically.
-- Validates listing is active and user isn't offering on their own listing.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_offer_v1(
  p_listing_id UUID,
  p_offerer_id UUID,
  p_cash_amount NUMERIC,
  p_message TEXT,
  p_items JSONB  -- Array of { card_name, card_image_url, card_external_id, tcg, card_set, card_number, condition, market_price, quantity }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing RECORD;
  v_offer_id UUID;
  v_item JSONB;
BEGIN
  -- Verify listing exists and is active
  SELECT * INTO v_listing
  FROM listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found: %', p_listing_id;
  END IF;

  IF v_listing.status != 'active' THEN
    RAISE EXCEPTION 'Listing is not active (current: %)', v_listing.status;
  END IF;

  IF v_listing.user_id = p_offerer_id THEN
    RAISE EXCEPTION 'Cannot offer on your own listing';
  END IF;

  -- Insert offer
  INSERT INTO offers (listing_id, offerer_id, cash_amount, message)
  VALUES (p_listing_id, p_offerer_id, p_cash_amount, p_message)
  RETURNING id INTO v_offer_id;

  -- Insert offer items
  IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      INSERT INTO offer_items (
        offer_id, card_name, card_image_url, card_external_id, tcg,
        card_set, card_number, condition, market_price, quantity
      )
      VALUES (
        v_offer_id,
        v_item->>'card_name',
        v_item->>'card_image_url',
        v_item->>'card_external_id',
        (v_item->>'tcg')::tcg_type,
        v_item->>'card_set',
        v_item->>'card_number',
        (v_item->>'condition')::card_condition,
        (v_item->>'market_price')::NUMERIC,
        COALESCE((v_item->>'quantity')::INTEGER, 1)
      );
    END LOOP;
  END IF;

  RETURN jsonb_build_object('offer_id', v_offer_id);
END;
$$;
