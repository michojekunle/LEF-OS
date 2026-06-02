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
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-2/50 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-baseline gap-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-mono">
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
        <ol className="px-4 pb-4 pt-1 space-y-1.5 border-t border-[var(--border-subtle)]">
          {week.days.map((d) => (
            <li
              key={d.day}
              className="flex items-baseline gap-3 text-sm leading-snug"
            >
              <span className="font-mono text-[10px] text-text-muted w-12 shrink-0 tabular-nums">
                Day {d.day}
              </span>
              <span className={d.isReview ? 'review-day' : 'text-text-secondary'}>
                {d.topic}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
