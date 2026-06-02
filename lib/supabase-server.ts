import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';
import { requirePublicEnv } from './env';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function supabaseServer() {
  const env = requirePublicEnv();
  const store = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            store.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies — safe to ignore here.
        }
      },
    },
  }) as unknown as SupabaseClient<Database>;
}

/** Returns the current authenticated user or null. Use in server contexts. */
export async function getCurrentUser() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  return data.user;
}
