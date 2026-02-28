-- send_message_v1: Atomically inserts a message and returns the recipient ID.
-- Used by the sendMessage pipeline so postEffects can fire push notifications
-- without a separate lookup.
CREATE OR REPLACE FUNCTION send_message_v1(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_type TEXT,
  p_body TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS TABLE(
  message_id UUID,
  conversation_id UUID,
  sender_id UUID,
  recipient_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
  v_match_id UUID;
  v_user_a_id UUID;
  v_user_b_id UUID;
  v_recipient_id UUID;
BEGIN
  -- Validate sender is a participant in this conversation
  SELECT c.match_id INTO v_match_id
  FROM conversations c
  WHERE c.id = p_conversation_id;

  IF v_match_id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found: %', p_conversation_id;
  END IF;

  SELECT m.user_a_id, m.user_b_id INTO v_user_a_id, v_user_b_id
  FROM matches m
  WHERE m.id = v_match_id;

  IF v_user_a_id IS NULL THEN
    RAISE EXCEPTION 'Match not found for conversation: %', p_conversation_id;
  END IF;

  IF p_sender_id NOT IN (v_user_a_id, v_user_b_id) THEN
    RAISE EXCEPTION 'User % is not a participant in conversation %', p_sender_id, p_conversation_id;
  END IF;

  -- Determine recipient
  IF p_sender_id = v_user_a_id THEN
    v_recipient_id := v_user_b_id;
  ELSE
    v_recipient_id := v_user_a_id;
  END IF;

  -- Insert message
  INSERT INTO messages (conversation_id, sender_id, type, body, payload)
  VALUES (p_conversation_id, p_sender_id, p_type::message_type, p_body, p_payload)
  RETURNING id INTO v_message_id;

  RETURN QUERY SELECT
    v_message_id AS message_id,
    p_conversation_id AS conversation_id,
    p_sender_id AS sender_id,
    v_recipient_id AS recipient_id;
END;
$$;
