import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';
import { getPublicEnv } from '@/lib/env';

const PROTECTED_PREFIXES = ['/dashboard', '/today', '/day', '/stats', '/settings', '/export'];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  const env = getPublicEnv();
  if (!env) return res;

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          res = NextResponse.next({ request: { headers: req.headers } });
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // This refreshes the session cookie if needed.
  const { data } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !data.user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    // Skip static files, images, and the service worker
    '/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.json|sw\\.js|workbox-.*\\.js).*)',
  ],
};
