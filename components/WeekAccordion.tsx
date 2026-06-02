'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Week } from './curriculum-data';

type Props = {
  week: Week;
  defaultOpen?: boolean;
};

export function WeekAccordion({ week, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hover:bg-surface-2/50 flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            W{week.weekNumber}
          </span>
          <span className="font-display text-base text-text-primary">{week.title}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-text-secondary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ol className="space-y-3 border-t border-[var(--border-subtle)] px-4 pb-5 pt-3">
          {week.days.map((d) => (
            <li key={d.day} className="flex items-baseline gap-4 text-base leading-snug max-[320px]:mb-4 max-[320px]:flex-col max-[320px]:items-start max-[320px]:gap-1">
              <span className="w-14 shrink-0 font-mono text-xs tabular-nums text-text-muted">
                Day {d.day}
              </span>
              <span className={d.isReview ? 'review-day' : 'text-text-secondary'}>{d.topic}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
