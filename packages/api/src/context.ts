import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, UserRole } from '@tcg-trade-hub/database';

export type Context = {
  supabase: SupabaseClient<Database>;
  userId?: string;
  roles?: UserRole[];
  adminSupabase?: SupabaseClient<Database>;
};
