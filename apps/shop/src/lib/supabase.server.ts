import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@tcg-trade-hub/database';
import { getServerEnv } from '@/env';

/**
 * Creates a Supabase client with the service role key.
 * Bypasses RLS — only use on the server for admin operations.
 */
export const createSupabaseServiceClient = () => {
  const env = getServerEnv();
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

/**
 * Creates a Supabase client scoped to the current user's session.
 * Reads auth cookies from the request for SSR.
 */
export const createSupabaseServerClient = (request: Request) => {
  const env = getServerEnv();
  const cookies = parseCookies(request.headers.get('cookie') ?? '');

  return createServerClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () =>
        Object.entries(cookies).map(([name, value]) => ({ name, value })),
      setAll: () => {
        // Cookies will be set on the response in the handler
      },
    },
  });
};

const parseCookies = (cookieHeader: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(';')) {
    const [key, ...rest] = pair.trim().split('=');
    if (key) {
      cookies[key] = rest.join('=');
    }
  }
  return cookies;
};
