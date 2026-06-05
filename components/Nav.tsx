import Link from 'next/link';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { NavLinks } from './NavLinks';
import { NotificationCenter } from './NotificationCenter';
import { UserMenu } from './UserMenu';

export async function Nav() {
  let isAuthed = false;
  let userId = '';
  let username: string | null = null;
  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data } = await sb.auth.getUser();
      isAuthed = Boolean(data.user);
      if (data.user) {
        userId = data.user.id;
        const { data: profile } = await sb
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .single();
        username = profile?.username || null;
      }
    } catch {
      isAuthed = false;
    }
  }

  return (
    <header className="header-safe sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-nav)]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-2 px-4 md:h-[4.5rem] md:gap-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="font-display text-2xl leading-none tracking-tight text-gold transition-opacity group-hover:opacity-80 md:text-3xl">
            LEF
          </span>
          <div className="flex flex-col justify-center gap-1 xl:gap-[3px]">
            <span className="font-display text-[8px] leading-none tracking-[0.2em] text-gold md:text-[10px]">
              LAW
            </span>
            <span className="font-sans text-[8px] font-bold leading-none tracking-[0.2em] text-sage md:text-[10px]">
              ECONOMICS
            </span>
            <span className="font-mono text-[8px] leading-none tracking-[0.2em] text-slate-blue md:text-[10px]">
              FINANCE
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <NavLinks />

        {/* Right-side actions */}
        <div className="flex items-center gap-1.5 md:gap-2.5">
          {isAuthed && <NotificationCenter userId={userId} />}
          <UserMenu isAuthed={isAuthed} username={username} />
        </div>
      </nav>
    </header>
  );
}
