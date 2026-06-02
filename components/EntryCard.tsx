'use client';

import { Star, Share2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import type { DailyEntry, ReactionKind } from '@/lib/database.types';
import { formatDate } from '@/lib/utils';
import { DomainBadge } from './DomainBadge';
import { ReactionBar } from './ReactionBar';

type Props = {
  entry: DailyEntry;
  showJournal?: boolean;
  authorName?: string | null;
  authorUsername?: string | null;
  reactionCounts?: Partial<Record<ReactionKind, number>>;
  myReactions?: ReactionKind[];
  viewerSignedIn?: boolean;
};

export function EntryCard({
  entry,
  showJournal = false,
  authorName,
  authorUsername,
  reactionCounts,
  myReactions,
  viewerSignedIn,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = entry.share_insight ?? '';
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/journal#day-${entry.day_number}`
        : '';
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `Day ${entry.day_number} · Law · Economics · Finance`,
          text,
          url,
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const author = authorUsername ? (
    <Link href={`/u/${authorUsername}`} className="transition-colors hover:text-text-primary">
      {authorName ?? `@${authorUsername}`}
    </Link>
  ) : (
    <span>{authorName ?? 'Anonymous'}</span>
  );

  return (
    <article id={`day-${entry.day_number}`} className="card reveal p-5">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <Link
            href={`/day/${entry.day_number}`}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-gold"
          >
            Day {entry.day_number}
          </Link>
          <span className="text-xs text-text-secondary">{formatDate(entry.entry_date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={12}
              className={
                entry.study_rating && n <= entry.study_rating
                  ? 'fill-gold text-gold'
                  : 'text-text-muted'
              }
            />
          ))}
        </div>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {entry.law_completed && <DomainBadge domain="law" size="sm" />}
        {entry.economics_completed && <DomainBadge domain="economics" size="sm" />}
        {entry.finance_completed && <DomainBadge domain="finance" size="sm" />}
      </div>

      {entry.share_insight && (
        <p className="mb-3 font-display text-[17px] leading-snug text-text-primary">
          “{entry.share_insight}”
        </p>
      )}

      {showJournal && entry.journal_text && (
        <p className="mb-3 whitespace-pre-wrap border-l-2 border-border pl-3 text-sm text-text-secondary">
          {entry.journal_text}
        </p>
      )}

      <footer className="mt-3 flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          {author}
          {entry.share_insight && (
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1.5 text-text-secondary transition-colors hover:text-gold"
            >
              <Share2 size={12} />
              {copied ? 'Copied' : 'Share'}
            </button>
          )}
        </div>
        {reactionCounts && (
          <ReactionBar
            entryId={entry.id}
            initialCounts={reactionCounts}
            initialMine={myReactions ?? []}
            signedIn={Boolean(viewerSignedIn)}
          />
        )}
      </footer>
    </article>
  );
}
