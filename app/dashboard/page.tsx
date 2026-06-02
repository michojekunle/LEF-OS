import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { DashboardClient } from './DashboardClient';
import type { DailyEntry } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard — LEF',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!hasSupabaseConfig()) {
    return <NotConfigured />;
  }

  const sb = await supabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) redirect('/login');

  const [{ data: profile }, { data: entriesData }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', userData.user.id).maybeSingle(),
    sb
      .from('daily_entries')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('entry_date', { ascending: false }),
  ]);

  const entries = (entriesData ?? []) as DailyEntry[];

  return (
    <DashboardClient
      userId={userData.user.id}
      email={userData.user.email ?? ''}
      displayName={profile?.display_name ?? null}
      initialEntries={entries}
    />
  );
}

function NotConfigured() {
  return (
    <div className="mx-auto max-w-content px-5 py-16 text-center md:px-6">
      <h1 className="mb-3 font-display text-3xl">Supabase not configured</h1>
      <p className="mx-auto max-w-md text-sm text-text-secondary">
        Add <code className="text-gold">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code className="text-gold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{' '}
        <code>.env.local</code>, then restart the dev server. See README.
      </p>
      <Link href="/" className="btn btn-secondary mt-6 inline-flex">
        Back home
      </Link>
    </div>
  );
}
