import { Suspense } from 'react';
import Link from 'next/link';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { EntryCard } from '@/components/EntryCard';
import { JournalSearch } from '@/components/JournalSearch';
import type {
  DailyEntry,
  JournalReactionCount,
  ReactionKind,
} from '@/lib/database.types';

export const metadata = {
  title: 'Journal — LEF',
  description: 'Public insights, one day at a time.',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

type ProfileSlim = {
  id: string;
  display_name: string | null;
  username: string | null;
};

type SearchParams = { q?: string; p?: string };

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(0, Number(sp.p ?? 0) || 0);
  const offset = page * PAGE_SIZE;

  let entries: (DailyEntry & {
    author?: string | null;
    username?: string | null;
    reactionCounts?: Partial<Record<ReactionKind, number>>;
    myReactions?: ReactionKind[];
  })[] = [];
  let viewerSignedIn = false;
  let total = 0;
  let configured = false;

  if (hasSupabaseConfig()) {
    configured = true;
    try {
      const sb = await supabaseServer();
      const { data: u } = await sb.auth.getUser();
      viewerSignedIn = Boolean(u.user);

      // Fetch entries
      let rows: DailyEntry[] = [];
      if (q) {
        const { data } = await sb.rpc('search_journal', {
          q,
          result_limit: PAGE_SIZE,
          result_offset: offset,
        });
        const hits = (data ?? []) as { id: string }[];
        if (hits.length > 0) {
          const ids = hits.map((h) => h.id);
          const { data: full } = await sb
            .from('daily_entries')
            .select('*')
            .in('id', ids)
            .eq('is_public', true);
          // preserve search rank order
          const idx = new Map(ids.map((id, i) => [id, i]));
          rows = ((full as DailyEntry[] | null) ?? []).sort(
            (a, b) => (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0),
          );
        }
        total = rows.length === PAGE_SIZE ? offset + PAGE_SIZE + 1 : offset + rows.length;
      } else {
        const { data, count } = await sb
          .from('daily_entries')
          .select('*', { count: 'exact' })
          .eq('is_public', true)
          .not('share_insight', 'is', null)
          .order('entry_date', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);
        rows = ((data as DailyEntry[] | null) ?? []);
        total = count ?? rows.length;
      }

      // Authors
      const userIds = Array.from(new Set(rows.map((e) => e.user_id)));
      let profiles: ProfileSlim[] = [];
      if (userIds.length > 0) {
        const { data: ps } = await sb
          .from('profiles')
          .select('id, display_name, username')
          .in('id', userIds);
        profiles = (ps ?? []) as ProfileSlim[];
      }
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      // Reactions (counts + viewer's own)
      const entryIds = rows.map((r) => r.id);
      const countMap = new Map<string, Partial<Record<ReactionKind, number>>>();
      const mineMap = new Map<string, ReactionKind[]>();
      if (entryIds.length > 0) {
        const { data: cs } = await sb
          .from('journal_reaction_counts')
          .select('*')
          .in('entry_id', entryIds);
        for (const c of (cs as JournalReactionCount[] | null) ?? []) {
          const m = countMap.get(c.entry_id) ?? {};
          m[c.kind] = c.count;
          countMap.set(c.entry_id, m);
        }
        if (u.user) {
          const { data: mine } = await sb
            .from('journal_reactions')
            .select('entry_id, kind')
            .in('entry_id', entryIds)
            .eq('user_id', u.user.id);
          for (const row of (mine as { entry_id: string; kind: ReactionKind }[] | null) ?? []) {
            const arr = mineMap.get(row.entry_id) ?? [];
            arr.push(row.kind);
            mineMap.set(row.entry_id, arr);
          }
        }
      }

      entries = rows.map((e) => {
        const p = profileMap.get(e.user_id);
        return {
          ...e,
          author: p?.display_name ?? p?.username ?? null,
          username: p?.username ?? null,
          reactionCounts: countMap.get(e.id) ?? {},
          myReactions: mineMap.get(e.id) ?? [],
        };
      });
    } catch {
      // ignore — show empty state
    }
  }

  const hasNext = entries.length === PAGE_SIZE;
  const hasPrev = page > 0;

  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-10">
      <header className="mb-8 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.32em] text-text-secondary">
          The Journal
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Public insights, one day at a time.
        </h1>
        <p className="text-text-secondary max-w-2xl text-sm md:text-base">
          Every entry below was logged by a learner who chose to share it. The full journal
          stays private; only the daily insight is published.
        </p>
        {configured && (
          <Suspense fallback={<div className="card-2 h-10 skeleton" />}>
            <JournalSearch />
          </Suspense>
        )}
        {q && (
          <p className="text-xs text-text-secondary">
            Showing matches for <em className="text-text-primary not-italic">“{q}”</em>
            {entries.length > 0 && ` · ${total} result${total === 1 ? '' : 's'}`}
          </p>
        )}
      </header>

      {entries.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-text-secondary text-sm">
            {q
              ? 'No matching insights yet. Try a different word.'
              : 'No public entries yet. Be the first to log a day.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {entries.map((e) => (
            <li key={e.id}>
              <EntryCard
                entry={e}
                authorName={e.author ?? null}
                authorUsername={e.username ?? null}
                reactionCounts={e.reactionCounts}
                myReactions={e.myReactions}
                viewerSignedIn={viewerSignedIn}
              />
            </li>
          ))}
        </ul>
      )}

      {(hasPrev || hasNext) && (
        <nav className="mt-8 flex items-center justify-between">
          {hasPrev ? (
            <Link
              href={`/journal?${pageParams(q, page - 1)}`}
              className="btn btn-secondary text-xs"
            >
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
            Page {page + 1}
          </span>
          {hasNext ? (
            <Link
              href={`/journal?${pageParams(q, page + 1)}`}
              className="btn btn-secondary text-xs"
            >
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

function pageParams(q: string, p: number): string {
  const sp = new URLSearchParams();
  if (q) sp.set('q', q);
  if (p > 0) sp.set('p', String(p));
  return sp.toString();
}
