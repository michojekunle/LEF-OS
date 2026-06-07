import { redirect } from 'next/navigation';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { ExportClient } from './ExportClient';

export const metadata = { title: 'Export — LEF' };
export const dynamic = 'force-dynamic';

export default async function ExportPage() {
  if (!hasSupabaseConfig()) redirect('/');

  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) redirect('/login?next=/export');

  // Fetch counts to show in the checklist descriptions
  const [{ count: entryCount }, { count: noteCount }, { count: questionCount }] = await Promise.all(
    [
      sb.from('daily_entries').select('*', { count: 'exact', head: true }).eq('user_id', u.user.id),
      sb.from('day_notes').select('*', { count: 'exact', head: true }).eq('user_id', u.user.id),
      sb.from('questions').select('*', { count: 'exact', head: true }).eq('user_id', u.user.id),
    ],
  );

  return (
    <ExportClient
      counts={{
        entries: entryCount ?? 0,
        notes: noteCount ?? 0,
        questions: questionCount ?? 0,
      }}
    />
  );
}
