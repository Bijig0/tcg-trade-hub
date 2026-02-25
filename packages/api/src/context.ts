import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@tcg-trade-hub/database';

export type Context = {
  supabase: SupabaseClient<Database>;
  userId?: string;
};
