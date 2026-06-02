import Link from 'next/link';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { SignOutButton } from './SignOutButton';
import { NavLinks, NavTrigger } from './NavLinks';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';

export async function Nav() {
  let isAuthed = false;
  let userId = '';
  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data } = await sb.auth.getUser();
      isAuthed = Boolean(data.user);
      if (data.user) {
        userId = data.user.id;
      }
    } catch {
      isAuthed = false;
    }
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg-nav)] border-b border-[var(--border-subtle)]">
      <nav className="mx-auto max-w-6xl px-4 md:px-6 h-16 md:h-[4.5rem] flex items-center justify-between gap-2 md:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-2 shrink-0 group">
          <span className="font-display text-xl md:text-2xl tracking-tight text-gold transition-opacity group-hover:opacity-80">
            LEF
          </span>
          <span className="hidden xl:inline text-[11px] uppercase tracking-[0.22em] text-text-secondary">
            Law · Economics · Finance
          </span>
        </Link>

        {/* Desktop nav links */}
        <NavLinks />

        {/* Right-side actions */}
        <div className="flex items-center gap-1.5 md:gap-2.5">
          <ThemeToggle />
          {/* Command palette trigger — hidden on mobile, tab bar Search covers it */}
          <span className="hidden md:flex">
            <NavTrigger />
          </span>
          {isAuthed && <NotificationCenter userId={userId} />}
          {isAuthed ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="btn btn-secondary text-xs px-3 py-2 shrink-0"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
