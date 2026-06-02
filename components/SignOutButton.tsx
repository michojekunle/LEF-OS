'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const sb = supabaseBrowser();
    await sb.auth.signOut();
    router.push('/');
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={signOut}
      className="btn btn-secondary text-xs p-1.5 md:p-2 lg:px-3 lg:py-1.5 inline-flex items-center gap-1.5 shrink-0"
      aria-label="Sign out"
    >
      <LogOut size={14} className="lg:w-3 lg:h-3" />
      <span className="hidden lg:inline">Sign out</span>
    </button>
  );
}
