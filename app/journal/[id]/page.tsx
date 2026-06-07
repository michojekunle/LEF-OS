import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { formatDate } from '@/lib/utils';
import { EntryCard } from '@/components/EntryCard';
import type { DailyEntry, ReactionKind, JournalReactionCount } from '@/lib/database.types';

type Params = { id: string };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  if (!hasSupabaseConfig()) return { title: 'Insight — LEF' };

  const sb = await supabaseServer();
  const { data: entry } = await sb
    .from('daily_entries')
    .select(
      'share_insight, day_number, law_completed, economics_completed, finance_completed, user_id',
    )
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle();

  if (!entry) return { title: 'Insight — LEF' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = entry as any;
  const insight: string = e.share_insight ?? '';
  const day: number = e.day_number;
  const domain = e.law_completed ? 'law' : e.economics_completed ? 'economics' : 'finance';

  const { data: profileData } = await sb
    .from('profiles')
    .select('username')
    .eq('id', e.user_id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const username: string = (profileData as any)?.username ?? '';

  const ogUrl = `/api/og/journal?insight=${encodeURIComponent(insight)}&username=${encodeURIComponent(username)}&day=${day}&domain=${domain}&theme=dark`;

  return {
    title: `Day ${day} · ${insight.slice(0, 60)}… — LEF`,
    description: insight,
    openGraph: {
      title: `Day ${day} — Law · Economics · Finance`,
      description: insight,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `LEF Day ${day} insight` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Day ${day} — LEF OS`,
      description: insight,
      images: [ogUrl],
    },
  };
}

export default async function JournalEntryPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  if (!hasSupabaseConfig()) notFound();

  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  const viewerSignedIn = Boolean(u.user);

  const { data: entryData } = await sb
    .from('daily_entries')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle();

  if (!entryData) notFound();

  const entry = entryData as DailyEntry;

  // Fetch author profile
  const { data: profileData } = await sb
    .from('profiles')
    .select('display_name, username')
    .eq('id', entry.user_id)
    .maybeSingle();

  const authorName =
    (profileData as { display_name: string | null; username: string | null } | null)
      ?.display_name ?? null;
  const authorUsername =
    (profileData as { display_name: string | null; username: string | null } | null)?.username ??
    null;

  // Reactions
  const { data: countsData } = await sb
    .from('journal_reaction_counts')
    .select('*')
    .eq('entry_id', id);
  const reactionCounts: Partial<Record<ReactionKind, number>> = {};
  for (const c of (countsData as JournalReactionCount[] | null) ?? []) {
    reactionCounts[c.kind] = c.count;
  }

  let myReactions: ReactionKind[] = [];
  if (u.user) {
    const { data: mine } = await sb
      .from('journal_reactions')
      .select('kind')
      .eq('entry_id', id)
      .eq('user_id', u.user.id);
    myReactions = ((mine as { kind: ReactionKind }[] | null) ?? []).map((r) => r.kind);
  }

  return (
    <div className="mx-auto max-w-content px-5 py-10 md:px-6">
      <Link
        href="/journal"
        className="mb-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={11} /> Journal
      </Link>

      <header className="mb-6 space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-text-secondary">Public Insight</p>
        <h1 className="font-display text-2xl tracking-tight md:text-3xl">
          Day {entry.day_number}{' '}
          <span className="text-text-muted">· {formatDate(entry.entry_date)}</span>
        </h1>
      </header>

      <EntryCard
        entry={entry}
        authorName={authorName}
        authorUsername={authorUsername}
        reactionCounts={reactionCounts}
        myReactions={myReactions}
        viewerSignedIn={viewerSignedIn}
        isPermalink
      />
    </div>
  );
}
