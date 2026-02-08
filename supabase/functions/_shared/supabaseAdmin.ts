/**
 * Supabase admin client using the service role key.
 * Used by Edge Functions for operations that bypass RLS.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables',
  );
}

/**
 * Admin client -- uses the service role key so it bypasses Row Level Security.
 * Only use this in Edge Functions for trusted server-side operations.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Creates a Supabase client scoped to the requesting user's JWT.
 * This client respects RLS policies.
 */
export function supabaseForUser(authHeader: string) {
  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    global: {
      headers: { Authorization: authHeader },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Extracts the authenticated user from the Authorization header.
 * Returns the user object or null if unauthenticated.
 */
export async function getUser(authHeader: string | null) {
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return null;
  return user;
}
