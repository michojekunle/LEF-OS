import Link from 'next/link';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { SignOutButton } from './SignOutButton';
import { NavLinks, NavTrigger } from './NavLinks';

export async function Nav() {
  let isAuthed = false;
  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data } = await sb.auth.getUser();
      isAuthed = Boolean(data.user);
    } catch {
      isAuthed = false;
    }
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/75 border-b border-border/60">
      <nav className="mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center justify-between gap-2 md:gap-4">
        <Link href="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-display text-lg tracking-tight text-gold">LEF</span>
          <span className="hidden xl:inline text-[11px] uppercase tracking-[0.22em] text-text-secondary">
            Law · Economics · Finance
          </span>
        </Link>
        <NavLinks />
        <div className="flex items-center gap-1.5 md:gap-2">
          <NavTrigger />
          {isAuthed ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="btn btn-secondary text-xs p-1.5 md:p-2 lg:px-3 lg:py-1.5 shrink-0"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
