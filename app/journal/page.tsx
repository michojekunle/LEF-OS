import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { EntryCard } from '@/components/EntryCard';
import type { DailyEntry } from '@/lib/utils';

export const metadata = {
  title: 'Journal — LEF',
  description: 'Public insights, one day at a time.',
};

export const dynamic = 'force-dynamic';

type ProfileSlim = { id: string; display_name: string | null; username: string | null };

export default async function JournalPage() {
  let entries: (DailyEntry & { author?: string | null })[] = [];

  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data } = await sb
        .from('daily_entries')
        .select('*')
        .eq('is_public', true)
        .not('share_insight', 'is', null)
        .order('entry_date', { ascending: false })
        .limit(200);

      const raws = (data ?? []) as DailyEntry[];
      const userIds = Array.from(new Set(raws.map((e) => e.user_id)));
      let profiles: ProfileSlim[] = [];
      if (userIds.length > 0) {
        const { data: ps } = await sb
          .from('profiles')
          .select('id, display_name, username')
          .in('id', userIds);
        profiles = (ps ?? []) as ProfileSlim[];
      }
      const profileMap = new Map(profiles.map((p) => [p.id, p]));
      entries = raws.map((e) => {
        const p = profileMap.get(e.user_id);
        return { ...e, author: p?.display_name ?? p?.username ?? null };
      });
    } catch {
      // ignore — show empty state
    }
  }

  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-10">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-text-secondary mb-3">
          The Journal
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Public insights, one day at a time.
        </h1>
        <p className="text-text-secondary mt-3 max-w-2xl text-sm md:text-base">
          Every entry below was logged by a learner who chose to share it. The full journal
          stays private; only the daily insight is published.
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-text-secondary text-sm">
            No public entries yet. Be the first to log a day.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {entries.map((e) => (
            <li key={e.id}>
              <EntryCard entry={e} authorName={e.author ?? null} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
