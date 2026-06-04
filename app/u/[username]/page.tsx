import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { EntryCard } from '@/components/EntryCard';
import type {
  DailyEntry,
  JournalReactionCount,
  Profile,
  ReactionKind,
  UserStats,
} from '@/lib/database.types';

type Params = { username: string };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  return {
    title: `@${username} — LEF`,
    description: `Public learning journal of @${username}.`,
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  if (!hasSupabaseConfig()) notFound();

  const sb = await supabaseServer();

  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle();

  if (!profile) notFound();
  const p = profile as Profile;

  const [{ data: u }, { data: entriesData }, { data: statsData }] = await Promise.all([
    sb.auth.getUser(),
    sb
      .from('daily_entries')
      .select('*')
      .eq('user_id', p.id)
      .eq('is_public', true)
      .not('share_insight', 'is', null)
      .order('entry_date', { ascending: false })
      .limit(50),
    sb.rpc('user_stats', { uid: p.id }),
  ]);

  const viewerSignedIn = Boolean(u.user);
  const entries = (entriesData as DailyEntry[] | null) ?? [];
  const stats = (statsData as UserStats[] | null)?.[0] ?? null;

  const entryIds = entries.map((e) => e.id);
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

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-10 md:px-6">
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={11} /> Journal
      </Link>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-text-secondary">Public profile</p>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          {p.display_name ?? `@${p.username}`}
        </h1>
        {p.username && <p className="font-mono text-sm text-text-secondary">@{p.username}</p>}
        {p.bio && <p className="max-w-2xl leading-relaxed text-text-secondary">{p.bio}</p>}
      </header>

      {stats && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Days logged" value={stats.days_logged} />
          <StatTile
            label="Longest streak"
            value={stats.longest_streak}
            icon={<Flame size={12} className="text-gold" />}
          />
          <StatTile label="Public insights" value={stats.public_insights} />
          <StatTile label="Full-stack days" value={stats.full_days} hint="all 3 domains" />
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          Public insights · {entries.length}
        </h2>
        {entries.length === 0 ? (
          <div className="card p-8 text-center text-sm text-text-secondary">
            Nothing public yet.
          </div>
        ) : (
          <ul className="space-y-4">
            {entries.map((e) => (
              <li key={e.id}>
                <EntryCard
                  entry={e}
                  authorName={p.display_name ?? null}
                  authorUsername={p.username ?? null}
                  reactionCounts={countMap.get(e.id) ?? {}}
                  myReactions={mineMap.get(e.id) ?? []}
                  viewerSignedIn={viewerSignedIn}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-text-secondary">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">
        {value}
        {hint && <span className="ml-1 text-xs font-normal text-text-muted">{hint}</span>}
      </p>
    </div>
  );
}
