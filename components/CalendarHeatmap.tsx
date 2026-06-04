'use client';

import { dateFromDayNumber, isoDate, type DailyEntry, statusForEntry } from '@/lib/utils';
import { TOTAL_CALENDAR_DAYS } from '../data/curriculum-data';

type Props = {
  entries: DailyEntry[];
  currentDay: number;
};

const dot: Record<string, string> = {
  none: 'bg-surface-2 border-border',
  partial: 'bg-[rgba(200,169,110,0.35)] border-[rgba(200,169,110,0.55)]',
  full: 'bg-gold border-gold',
};

export function CalendarHeatmap({ entries, currentDay }: Props) {
  const byDate = new Map<string, DailyEntry>();
  for (const e of entries) byDate.set(e.entry_date, e);

  const days = Array.from({ length: TOTAL_CALENDAR_DAYS }, (_, i) => i + 1);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-text-primary">122-Day Map</h3>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <Legend dotClass={dot.none} label="None" />
          <Legend dotClass={dot.partial} label="Partial" />
          <Legend dotClass={dot.full} label="Full" />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-[3px]">
        {days.map((d) => {
          const date = dateFromDayNumber(d);
          const entry = byDate.get(isoDate(date));
          const s = statusForEntry(entry);
          const isToday = d === currentDay;
          const isPast = d < currentDay;
          const opacity = isPast || isToday ? '' : 'opacity-50';
          return (
            <div
              key={d}
              title={`Day ${d} · ${date.toDateString()} · ${s}`}
              className={`aspect-square rounded-[2px] border ${dot[s]} ${opacity} ${isToday ? 'ring-1 ring-text-primary ring-offset-1 ring-offset-bg' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-sm border ${dotClass}`} />
      <span>{label}</span>
    </span>
  );
}
