-- ============================================================================
-- Migration 00017: Per-side offer notes
--
-- Renames offers.message → offerer_note for clarity.
-- Updates create_offer_v1 RPC to use the new column name.
-- ============================================================================

-- 1. Rename column
ALTER TABLE public.offers RENAME COLUMN message TO offerer_note;

-- 2. Recreate create_offer_v1 with renamed parameter
CREATE OR REPLACE FUNCTION public.create_offer_v1(
  p_listing_id UUID,
  p_offerer_id UUID,
  p_cash_amount NUMERIC,
  p_offerer_note TEXT,
  p_items JSONB
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
  INSERT INTO offers (listing_id, offerer_id, cash_amount, offerer_note)
  VALUES (p_listing_id, p_offerer_id, p_cash_amount, p_offerer_note)
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
