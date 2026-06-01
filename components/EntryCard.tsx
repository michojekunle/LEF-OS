'use client';

import { Star, Share2 } from 'lucide-react';
import { useState } from 'react';
import type { DailyEntry } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { DomainBadge } from './DomainBadge';

type Props = {
  entry: DailyEntry;
  showJournal?: boolean;
  authorName?: string | null;
};

export function EntryCard({ entry, showJournal = false, authorName }: Props) {
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

  return (
    <article id={`day-${entry.day_number}`} className="card p-5 reveal">
      <header className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            Day {entry.day_number}
          </span>
          <span className="text-xs text-text-secondary">
            {formatDate(entry.entry_date)}
          </span>
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

      <div className="flex flex-wrap gap-2 mb-3">
        {entry.law_completed && <DomainBadge domain="law" size="sm" />}
        {entry.economics_completed && <DomainBadge domain="economics" size="sm" />}
        {entry.finance_completed && <DomainBadge domain="finance" size="sm" />}
      </div>

      {entry.share_insight && (
        <p className="font-display text-[17px] leading-snug text-text-primary mb-3">
          “{entry.share_insight}”
        </p>
      )}

      {showJournal && entry.journal_text && (
        <p className="text-sm text-text-secondary border-l-2 border-border pl-3 mb-3 whitespace-pre-wrap">
          {entry.journal_text}
        </p>
      )}

      <footer className="flex items-center justify-between text-xs text-text-secondary mt-3 pt-3 border-t border-border/60">
        <span>{authorName ?? 'Anonymous'}</span>
        {entry.share_insight && (
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 text-text-secondary hover:text-gold transition-colors"
          >
            <Share2 size={12} />
            {copied ? 'Copied' : 'Share'}
          </button>
        )}
      </footer>
    </article>
  );
}
