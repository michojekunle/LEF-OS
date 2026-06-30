import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { WaitlistAdminClient } from './WaitlistAdminClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sankofa Waitlist Admin' };

const ADMIN_EMAIL = process.env.SANKOFA_ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';

export default async function SankofaAdminPage() {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();

  if (!u.user) redirect('/login?next=/sankofa/admin');

  // Gate by admin email env var — if not set, only the first registered user can access
  if (ADMIN_EMAIL && u.user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-[#F4F0EA]">
        <p className="font-mono text-sm tracking-widest opacity-50">ACCESS DENIED</p>
      </div>
    );
  }

  // Use admin client to bypass RLS (waitlist has select: false for regular users)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;
  const { data: rows, error } = await admin
    .from('sankofa_waitlist')
    .select('id, email, source, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[sankofa/admin]', error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-[#F4F0EA]">
        <p className="font-mono text-sm tracking-widest text-red-400">Failed to load waitlist.</p>
      </div>
    );
  }

  return <WaitlistAdminClient rows={rows ?? []} />;
}
