import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(URL, ANON, {
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
          // Setting cookies from a Server Component is a no-op; safe to ignore.
        }
      },
    },
  });
}
