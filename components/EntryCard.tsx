'use client';

import { Star, Share2, Link2, X, Download, Twitter, Linkedin } from 'lucide-react';
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
  /** When true the card is on its own permalink page — suppresses the "View" link */
  isPermalink?: boolean;
};

/** Detect the primary domain for OG card colour */
function primaryDomain(entry: DailyEntry): string {
  if (entry.law_completed) return 'law';
  if (entry.economics_completed) return 'economics';
  if (entry.finance_completed) return 'finance';
  return 'law';
}

export function EntryCard({
  entry,
  showJournal = false,
  authorName,
  authorUsername,
  reactionCounts,
  myReactions,
  viewerSignedIn,
  isPermalink = false,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const permalink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/journal/${entry.id}`
      : `/journal/${entry.id}`;

  const theme =
    typeof window !== 'undefined' ? (localStorage.getItem('lef-theme') ?? 'dark') : 'dark';

  const domain = primaryDomain(entry);
  const ogUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/og/journal?` +
        new URLSearchParams({
          insight: entry.share_insight ?? '',
          username: authorUsername ?? '',
          day: String(entry.day_number),
          domain,
          theme,
        })
      : '';

  const encodedInsight = encodeURIComponent(
    `${entry.share_insight ?? ''}\n\nDay ${entry.day_number} — Law · Economics · Finance`,
  );
  const encodedUrl = encodeURIComponent(permalink);

  const platformLinks = [
    {
      label: 'X',
      icon: <Twitter size={14} />,
      href: `https://twitter.com/intent/tweet?text=${encodedInsight}&url=${encodedUrl}`,
    },
    {
      label: 'LinkedIn',
      icon: <Linkedin size={14} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'WhatsApp',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      href: `https://wa.me/?text=${encodedInsight}%20${encodedUrl}`,
    },
    {
      label: 'Facebook',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  async function copyLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(permalink);
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
            className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-gold"
          >
            Day {entry.day_number}
          </Link>
          <span className="text-xs text-text-secondary">{formatDate(entry.entry_date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {entry.study_rating ? (
            <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              entry.study_rating >= 3 ? 'bg-gold/10 text-gold' :
              entry.study_rating === 2 ? 'bg-sage/10 text-sage' :
              'bg-slate-blue/10 text-slate-blue'
            }`}>
              {entry.study_rating >= 3 ? 'Tier A' : entry.study_rating === 2 ? 'Tier B' : 'Tier C'}
            </span>
          ) : null}
        </div>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {entry.law_completed && <DomainBadge domain="law" size="sm" />}
        {entry.economics_completed && <DomainBadge domain="economics" size="sm" />}
        {entry.finance_completed && <DomainBadge domain="finance" size="sm" />}
      </div>

      {entry.share_insight && (
        <p className="mb-3 text-base font-medium leading-snug text-text-primary">
          "{entry.share_insight}"
        </p>
      )}

      {showJournal && entry.journal_text && (
        <p className="mb-3 whitespace-pre-wrap border-l-2 border-border pl-3 text-sm text-text-secondary">
          {entry.journal_text}
        </p>
      )}

      <footer className="mt-3 flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-3">
            {author}
            {!isPermalink && (
              <Link
                href={`/journal/${entry.id}`}
                className="text-text-muted transition-colors hover:text-gold"
              >
                View →
              </Link>
            )}
          </div>

          {entry.share_insight && (
            <button
              type="button"
              onClick={() => setShareOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 text-text-secondary transition-colors hover:text-gold"
            >
              {shareOpen ? <X size={12} /> : <Share2 size={12} />}
              {shareOpen ? 'Close' : 'Share'}
            </button>
          )}
        </div>

        {/* Share panel */}
        {shareOpen && entry.share_insight && (
          <div className="bg-surface-2/40 space-y-3 rounded-xl border border-[var(--border-subtle)] p-4">
            {/* Image preview */}
            {ogUrl && (
              <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ogUrl}
                  alt="Share card preview"
                  className="w-full object-cover"
                  style={{ aspectRatio: '1200/630' }}
                />
              </div>
            )}

            {/* Platform buttons */}
            <div className="flex flex-wrap gap-2">
              {platformLinks.map((p) => (
                <a
                  key={p.label}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-xs text-text-secondary transition-colors hover:border-[var(--border)] hover:text-text-primary"
                >
                  {p.icon}
                  {p.label}
                </a>
              ))}

              {/* Instagram — save only */}
              <a
                href={ogUrl}
                download={`lef-day-${entry.day_number}.png`}
                title="Save image and post to Instagram"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-xs text-text-secondary transition-colors hover:border-[var(--border)] hover:text-text-primary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>

              {/* Save image */}
              <a
                href={ogUrl}
                download={`lef-day-${entry.day_number}.png`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-xs text-text-secondary transition-colors hover:border-[var(--border)] hover:text-gold"
              >
                <Download size={13} />
                Save image
              </a>

              {/* Copy link */}
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-xs text-text-secondary transition-colors hover:border-[var(--border)] hover:text-text-primary"
              >
                <Link2 size={13} />
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        )}

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
