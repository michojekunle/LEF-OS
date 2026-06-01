import Link from 'next/link';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { SignOutButton } from './SignOutButton';

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
      <nav className="mx-auto max-w-content px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg tracking-tight text-gold">LEF</span>
          <span className="hidden md:inline text-[11px] uppercase tracking-[0.22em] text-text-secondary">
            Law · Economics · Finance
          </span>
        </Link>
        <ul className="hidden md:flex items-center gap-1 text-sm">
          <NavLink href="/roadmap">Roadmap</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/journal">Journal</NavLink>
        </ul>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <SignOutButton />
          ) : (
            <Link href="/login" className="btn btn-secondary text-xs py-1.5 px-3">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-2/60 transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
