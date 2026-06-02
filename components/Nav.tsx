import Link from 'next/link';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { SignOutButton } from './SignOutButton';
import { NavLinks, NavTrigger } from './NavLinks';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';
import { Settings } from 'lucide-react';

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
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-nav)] backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-content items-center justify-between gap-2 px-4 md:h-[4.5rem] md:gap-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="font-display text-xl tracking-tight text-gold transition-opacity group-hover:opacity-80 md:text-2xl">
            LEF
          </span>
          <span className="hidden text-[11px] uppercase tracking-[0.22em] text-text-secondary xl:inline">
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
          {isAuthed && (
            <Link
              href="/settings"
              className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary md:p-2"
              aria-label="Settings"
            >
              <Settings size={20} strokeWidth={1.75} />
            </Link>
          )}
          {isAuthed && <NotificationCenter userId={userId} />}
          {isAuthed ? (
            <SignOutButton />
          ) : (
            <Link href="/login" className="btn btn-secondary shrink-0 px-3 py-2 text-xs">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
