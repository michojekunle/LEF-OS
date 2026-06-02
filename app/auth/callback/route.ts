import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, redirect there after sign in
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const sb = await supabaseServer();
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error('Error exchanging code for session:', err);
    }
  }

  // return the user to an error page or some default
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
