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
      className="btn btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
    >
      <LogOut size={12} /> Sign out
    </button>
  );
}
