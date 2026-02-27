import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@tcg-trade-hub/database';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Returns a singleton Supabase browser client for the admin app.
 * Reads SUPABASE_URL and SUPABASE_ANON_KEY from meta tags injected in __root.tsx.
 */
export const getSupabaseBrowserClient = () => {
  if (client) return client;

  const url = getMetaContent('supabase-url');
  const anonKey = getMetaContent('supabase-anon-key');

  if (!url || !anonKey) {
    throw new Error('Missing Supabase config in meta tags');
  }

  client = createBrowserClient<Database>(url, anonKey);
  return client;
};

const getMetaContent = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta?.getAttribute('content') ?? null;
};
