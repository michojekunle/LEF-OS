'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';

export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
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
      className={
        className ||
        'btn btn-secondary inline-flex shrink-0 items-center gap-1.5 p-1.5 text-xs md:p-2 lg:px-3 lg:py-1.5'
      }
      aria-label="Sign out"
    >
      {children || (
        <>
          <LogOut size={14} className="lg:h-3 lg:w-3" />
          <span className="hidden lg:inline">Sign out</span>
        </>
      )}
    </button>
  );
}
