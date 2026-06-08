'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import type { Week } from '../data/curriculum-data';
import { getDayNumber, isInCourse, toCurriculumDay } from '@/lib/utils';
import { useCourse } from './CourseContext';

type Props = {
  week: Week;
  defaultOpen?: boolean;
};

export function WeekAccordion({ week, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  // Compute the current curriculum day using the user's personal course window
  // so the "Today" highlight is accurate for custom timelines.
  const course = useCourse();
  const todayCalendarDay = isInCourse(new Date(), course) ? getDayNumber(new Date(), course) : -1;
  const today = todayCalendarDay > 0 ? toCurriculumDay(todayCalendarDay, course.totalDays) : -1;

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hover:bg-surface-2/50 flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
            W{week.weekNumber}
          </span>
          <span className="text-sm font-semibold text-text-primary">{week.title}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-text-secondary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ol className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
          {week.days.map((d) => {
            const isToday = d.day === today;
            const isPast = d.day < today;

            return (
              <li key={d.day}>
                <Link
                  href={`/day/${d.day}`}
                  className={`group flex items-start gap-4 px-4 py-3 transition-colors max-[320px]:flex-col max-[320px]:gap-2 ${
                    isToday ? 'bg-gold/8 hover:bg-gold/12' : 'hover:bg-surface-2/50'
                  } `}
                >
                  {/* Day badge */}
                  <span
                    className={`inline-flex shrink-0 items-center justify-center rounded-md px-2 py-1 font-mono text-xs font-bold uppercase tracking-wider shadow-sm max-[320px]:justify-start ${
                      isToday
                        ? 'bg-gold text-bg'
                        : isPast
                          ? 'bg-surface-2 text-text-muted'
                          : 'bg-surface-2 text-text-primary'
                    } `}
                  >
                    {isToday ? '→ ' : ''}Day {d.day}
                  </span>

                  {/* Topic */}
                  <span
                    className={`flex-1 pt-0.5 text-sm leading-snug ${
                      d.isReview
                        ? 'review-day font-medium'
                        : isToday
                          ? 'font-medium text-text-primary'
                          : isPast
                            ? 'text-text-muted'
                            : 'text-text-secondary'
                    } `}
                  >
                    {d.topic}
                    {isToday && (
                      <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-gold">
                        Today
                      </span>
                    )}
                  </span>

                  {/* Arrow — visible on hover */}
                  <ArrowRight
                    size={14}
                    className="mt-0.5 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100 max-[320px]:hidden"
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
