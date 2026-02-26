-- =============================================================================
-- Conversation Nicknames: Per-user editable chat names
-- =============================================================================

CREATE TABLE public.conversation_nicknames (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  nickname        TEXT NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.conversation_nicknames ENABLE ROW LEVEL SECURITY;

-- Users can only read their own nicknames
CREATE POLICY "Users can read own nicknames"
  ON public.conversation_nicknames FOR SELECT
  USING (user_id = auth.uid());

-- Users can only insert their own nicknames
CREATE POLICY "Users can insert own nicknames"
  ON public.conversation_nicknames FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own nicknames
CREATE POLICY "Users can update own nicknames"
  ON public.conversation_nicknames FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own nicknames (reset to default)
CREATE POLICY "Users can delete own nicknames"
  ON public.conversation_nicknames FOR DELETE
  USING (user_id = auth.uid());

-- Auto-update updated_at (reuse existing trigger function from 00001)
CREATE TRIGGER set_conversation_nicknames_updated_at
  BEFORE UPDATE ON public.conversation_nicknames
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
