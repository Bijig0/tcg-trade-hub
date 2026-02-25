-- =============================================================================
-- Chat Enhancements: Negotiation Status, Read Tracking, Block Enforcement
-- =============================================================================

-- 1a. Negotiation Status
-- -----------------------------------------------------------------------------

CREATE TYPE public.negotiation_status AS ENUM (
  'chatting',
  'offer_pending',
  'offer_accepted',
  'meetup_proposed',
  'meetup_confirmed',
  'completed',
  'cancelled'
);

ALTER TABLE public.conversations
  ADD COLUMN negotiation_status public.negotiation_status NOT NULL DEFAULT 'chatting';

-- Auto-advance trigger: update negotiation_status on message INSERT
CREATE OR REPLACE FUNCTION public.advance_negotiation_status()
RETURNS TRIGGER AS $$
DECLARE
  _conv_id UUID;
  _current_status public.negotiation_status;
  _payload JSONB;
  _action TEXT;
BEGIN
  _conv_id := NEW.conversation_id;

  SELECT negotiation_status INTO _current_status
  FROM public.conversations
  WHERE id = _conv_id;

  -- card_offer → offer_pending
  IF NEW.type = 'card_offer' THEN
    UPDATE public.conversations
    SET negotiation_status = 'offer_pending', updated_at = now()
    WHERE id = _conv_id;
    RETURN NEW;
  END IF;

  -- card_offer_response → offer_accepted or chatting
  IF NEW.type = 'card_offer_response' THEN
    _payload := NEW.payload::JSONB;
    _action := _payload->>'action';
    IF _action = 'accepted' THEN
      UPDATE public.conversations
      SET negotiation_status = 'offer_accepted', updated_at = now()
      WHERE id = _conv_id;
    ELSIF _action = 'declined' THEN
      UPDATE public.conversations
      SET negotiation_status = 'chatting', updated_at = now()
      WHERE id = _conv_id;
    END IF;
    RETURN NEW;
  END IF;

  -- meetup_proposal → meetup_proposed
  IF NEW.type = 'meetup_proposal' THEN
    IF _current_status IN ('chatting', 'offer_accepted') THEN
      UPDATE public.conversations
      SET negotiation_status = 'meetup_proposed', updated_at = now()
      WHERE id = _conv_id;
    END IF;
    RETURN NEW;
  END IF;

  -- meetup_response → meetup_confirmed or revert
  IF NEW.type = 'meetup_response' THEN
    _payload := NEW.payload::JSONB;
    _action := _payload->>'action';
    IF _action = 'accepted' THEN
      UPDATE public.conversations
      SET negotiation_status = 'meetup_confirmed', updated_at = now()
      WHERE id = _conv_id;
    ELSIF _action = 'declined' THEN
      -- Revert to offer_accepted if applicable, otherwise chatting
      IF _current_status = 'meetup_proposed' THEN
        UPDATE public.conversations
        SET negotiation_status = 'offer_accepted', updated_at = now()
        WHERE id = _conv_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_advance_negotiation_status
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.advance_negotiation_status();

-- Sync trigger: match status → conversation status
CREATE OR REPLACE FUNCTION public.sync_match_to_conversation_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.conversations
    SET negotiation_status = 'completed', updated_at = now()
    WHERE match_id = NEW.id;
  ELSIF NEW.status = 'cancelled' THEN
    UPDATE public.conversations
    SET negotiation_status = 'cancelled', updated_at = now()
    WHERE match_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_match_conversation_status
  AFTER UPDATE OF status ON public.matches
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.sync_match_to_conversation_status();

-- Enable Realtime on conversations (for live status subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- 1b. Read Tracking
-- -----------------------------------------------------------------------------

CREATE TABLE public.conversation_reads (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  last_read_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  last_read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;

-- Both participants can see each other's read state (needed for "Seen" indicator)
CREATE POLICY "Participants can read conversation_reads"
  ON public.conversation_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.matches m ON m.id = c.match_id
      WHERE c.id = conversation_reads.conversation_id
        AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
    )
  );

-- Own-only INSERT
CREATE POLICY "Users can insert own read state"
  ON public.conversation_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Own-only UPDATE
CREATE POLICY "Users can update own read state"
  ON public.conversation_reads FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RPC: Get unread counts for a user's conversations
CREATE OR REPLACE FUNCTION public.get_unread_counts(p_user_id UUID)
RETURNS TABLE (conversation_id UUID, unread_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS conversation_id,
    COUNT(msg.id)::BIGINT AS unread_count
  FROM public.conversations c
  JOIN public.matches m ON m.id = c.match_id
  LEFT JOIN public.conversation_reads cr
    ON cr.conversation_id = c.id AND cr.user_id = p_user_id
  LEFT JOIN public.messages msg
    ON msg.conversation_id = c.id
    AND msg.sender_id != p_user_id
    AND msg.created_at > COALESCE(cr.last_read_at, '1970-01-01'::TIMESTAMPTZ)
  WHERE m.user_a_id = p_user_id OR m.user_b_id = p_user_id
  GROUP BY c.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1c. Block Enforcement
-- -----------------------------------------------------------------------------

-- RPC: Check if blocked between two users (SECURITY DEFINER since blocks RLS
-- only allows reading own blocks)
CREATE OR REPLACE FUNCTION public.is_blocked_between(p_other_user_id UUID)
RETURNS TABLE (blocked_by_me BOOLEAN, blocked_by_them BOOLEAN) AS $$
DECLARE
  _current_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    EXISTS (
      SELECT 1 FROM public.blocks
      WHERE blocker_id = _current_user_id AND blocked_id = p_other_user_id
    ) AS blocked_by_me,
    EXISTS (
      SELECT 1 FROM public.blocks
      WHERE blocker_id = p_other_user_id AND blocked_id = _current_user_id
    ) AS blocked_by_them;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1d. Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_conv_sender_created
  ON public.messages (conversation_id, sender_id, created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_negotiation_status
  ON public.conversations (negotiation_status);
