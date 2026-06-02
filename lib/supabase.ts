import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getPublicEnv } from './env';

export { hasSupabaseConfig } from './env';

export function supabaseBrowser() {
  const env = getPublicEnv();
  if (!env) {
    throw new Error('Supabase env not configured.');
  }
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ) as unknown as SupabaseClient<Database>;
}
