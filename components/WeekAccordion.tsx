'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Week } from '../data/curriculum-data';

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
            <li
              key={d.day}
              className="flex items-start gap-4 text-base leading-snug max-[320px]:mb-6 max-[320px]:flex-col max-[320px]:gap-2"
            >
              <span className="inline-flex shrink-0 items-center justify-center rounded-md bg-surface-2 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-text-primary shadow-sm max-[320px]:justify-start">
                Day {d.day}
              </span>
              <span
                className={`pt-0.5 ${d.isReview ? 'review-day font-medium text-text-primary' : 'text-text-secondary'}`}
              >
                {d.topic}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
