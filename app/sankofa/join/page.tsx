import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { JoinClient } from './JoinClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Join Sankofa Archive' };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SankofaJoinPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token.trim() : '';

  if (!token) redirect('/sankofa');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const { data: row, error } = await admin
    .from('sankofa_waitlist')
    .select('id, email, invited_at, invite_used_at')
    .eq('invite_token', token)
    .single();

  // Invalid token
  if (error || !row) {
    return <JoinClient status="invalid" email={null} />;
  }

  // Already used
  if (row.invite_used_at) {
    return <JoinClient status="used" email={row.email} />;
  }

  // Mark token as used
  await admin
    .from('sankofa_waitlist')
    .update({ invite_used_at: new Date().toISOString() })
    .eq('id', row.id);

  // Hand off to client for Supabase magic link / sign-up flow
  return <JoinClient status="valid" email={row.email} />;
}
