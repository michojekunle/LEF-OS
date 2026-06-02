import { redirect } from 'next/navigation';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { StatsClient } from './StatsClient';
import type { DailyEntry } from '@/lib/utils';

export const metadata = {
  title: 'Stats — LEF',
};

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  if (!hasSupabaseConfig()) {
    redirect('/');
  }

  const sb = await supabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) redirect('/login');

  const { data: entriesData } = await sb
    .from('daily_entries')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('entry_date', { ascending: false });

  const entries = (entriesData ?? []) as DailyEntry[];

  return (
    <StatsClient
      userId={userData.user.id}
      email={userData.user.email ?? ''}
      initialEntries={entries}
    />
  );
}
