-- Allow users to delete their own swipes (enables feed refresh in dev)
CREATE POLICY "swipes_delete_own"
  ON public.swipes FOR DELETE
  USING (user_id = auth.uid());
