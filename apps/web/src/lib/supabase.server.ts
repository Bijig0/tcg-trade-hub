import { createClient } from '@supabase/supabase-js';
import type { Database } from '@tcg-trade-hub/database';
import { getServerEnv } from '@/env';

/**
 * Creates a Supabase client with the service role key.
 * This bypasses RLS — only use on the server.
 */
export const createSupabaseServiceClient = () => {
  const env = getServerEnv();
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};
