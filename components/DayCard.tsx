'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { DomainBadge } from './DomainBadge';
import { findDayMeta, type Domain } from '../data/curriculum-data';

type Props = {
  domain: Domain;
  day: number;
  completed?: boolean;
  onToggle?: () => void;
  /** When true the card is a clickable link to /day/[day]. Default true. */
  linkable?: boolean;
};

export function DayCard({ domain, day, completed, onToggle, linkable = true }: Props) {
  const [justCompleted, setJustCompleted] = useState(false);
  const meta = findDayMeta(domain, day);

  function handleToggle() {
    if (!onToggle) return;
    if (!completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 1200);
    }
    onToggle();
  }

  if (!meta) {
    return (
      <div className="card p-5">
        <DomainBadge domain={domain} />
        <p className="mt-3 text-sm text-text-secondary">
          Integration & sharing day — no curriculum topic. Use today to review, write, or publish.
        </p>
      </div>
    );
  }

  const inner = (
    <div className="card reveal hover:bg-surface-2/30 group flex h-full flex-col justify-between p-5 transition-colors hover:border-[var(--border)]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DomainBadge domain={domain} size="md" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
            W{meta.weekNumber}
          </span>
        </div>

        <div>
          <p
            className={`text-sm font-medium leading-snug ${
              meta.isReview ? 'review-day text-gold' : 'text-text-primary'
            }`}
          >
            {meta.topic}
          </p>
          <p className="mt-1.5 text-xs text-text-secondary">{meta.weekTitle}</p>
        </div>
      </div>

      {onToggle ? (
        <button
          type="button"
          onClick={handleToggle}
          className={`btn mt-6 w-full justify-center text-xs transition-all duration-300 ${
            completed ? 'btn-primary bg-gold text-bg' : 'btn-secondary'
          } ${justCompleted ? 'scale-95' : 'scale-100'}`}
        >
          {justCompleted ? (
            <span className="flex items-center gap-1.5">
              <Check size={13} className="animate-bounce" /> Done!
            </span>
          ) : completed ? (
            <span className="flex items-center gap-1.5">
              <Check size={13} /> Completed
            </span>
          ) : (
            'Mark complete'
          )}
        </button>
      ) : linkable ? (
        <div className="mt-4 flex items-center gap-1 text-xs text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
          Open study content <ArrowRight size={11} />
        </div>
      ) : null}
    </div>
  );

  if (linkable && !onToggle) {
    return (
      <Link href={`/day/${day}`} className="block h-full">
        {inner}
      </Link>
    );
  }

  return inner;
}
