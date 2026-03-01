-- Auto-create a meetup record when a meetup_response message with action='accepted'
-- is inserted. Extracts location/time data from the original meetup_proposal message.

CREATE OR REPLACE FUNCTION public.create_meetup_on_accept()
RETURNS TRIGGER AS $$
DECLARE
  _payload JSONB;
  _action TEXT;
  _proposal_message_id UUID;
  _proposal_msg RECORD;
  _proposal_payload JSONB;
  _match_id UUID;
  _shop_id UUID;
  _location_name TEXT;
  _proposed_time TIMESTAMPTZ;
BEGIN
  -- Only handle meetup_response messages
  IF NEW.type != 'meetup_response' THEN
    RETURN NEW;
  END IF;

  _payload := NEW.payload::JSONB;
  _action := _payload->>'action';

  -- Only create meetup on acceptance
  IF _action != 'accepted' THEN
    RETURN NEW;
  END IF;

  _proposal_message_id := (_payload->>'proposal_message_id')::UUID;

  -- Fetch the original meetup_proposal message
  SELECT id, conversation_id, payload INTO _proposal_msg
  FROM public.messages
  WHERE id = _proposal_message_id;

  IF _proposal_msg.id IS NULL THEN
    RAISE WARNING 'Proposal message % not found, skipping meetup creation', _proposal_message_id;
    RETURN NEW;
  END IF;

  _proposal_payload := _proposal_msg.payload::JSONB;

  -- Extract proposal data
  _shop_id := (_proposal_payload->>'shop_id')::UUID;
  _location_name := _proposal_payload->>'location_name';
  _proposed_time := (_proposal_payload->>'proposed_time')::TIMESTAMPTZ;

  -- Get match_id from the conversation
  SELECT match_id INTO _match_id
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF _match_id IS NULL THEN
    RAISE WARNING 'Conversation % has no match_id, skipping meetup creation', NEW.conversation_id;
    RETURN NEW;
  END IF;

  -- Check if a meetup already exists for this proposal (idempotency)
  IF EXISTS (
    SELECT 1 FROM public.meetups
    WHERE proposal_message_id = _proposal_message_id
  ) THEN
    RETURN NEW;
  END IF;

  -- Insert the meetup record
  INSERT INTO public.meetups (
    match_id,
    proposal_message_id,
    shop_id,
    location_name,
    proposed_time,
    status
  ) VALUES (
    _match_id,
    _proposal_message_id,
    _shop_id,
    _location_name,
    _proposed_time,
    'confirmed'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_meetup_on_accept
  AFTER INSERT ON public.messages
  FOR EACH ROW
  WHEN (NEW.type = 'meetup_response')
  EXECUTE FUNCTION public.create_meetup_on_accept();
