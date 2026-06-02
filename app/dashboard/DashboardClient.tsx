'use client';

import { useMemo, useState, useEffect } from 'react';
import { Flame, CheckCircle2, Calendar, Bell, X } from 'lucide-react';
import Link from 'next/link';
import {
  getDayNumber,
  getTodayTopics,
  getCurrentStreak,
  getOverallProgress,
  getDomainProgress,
  isBeforeCourse,
  isAfterCourse,
  isoDate,
  getAllThursdays,
  clampDay,
  type DailyEntry,
} from '@/lib/utils';
import { DayCard } from '@/components/DayCard';
import { DailyLogForm } from '@/components/DailyLogForm';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { ProgressBar } from '@/components/ProgressBar';
import { EntryCard } from '@/components/EntryCard';
import { TOTAL_CALENDAR_DAYS, getMonthByCurriculumDay } from '@/data/curriculum-data';

type Props = {
  userId: string;
  email: string;
  displayName: string | null;
  initialEntries: DailyEntry[];
};

export function DashboardClient({ userId, email, displayName, initialEntries }: Props) {
  const [selectedDayOffset, setSelectedDayOffset] = useState<0 | -1>(0);
  const [entries, setEntries] = useState<DailyEntry[]>(initialEntries);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const dismissed = localStorage.getItem('dismissed-push-prompt');
        if (!dismissed) {
          setShowNotificationPrompt(true);
        }
      }
    }
  }, []);

  // Stable today reference — new Date() at render level creates a new object
  // every render, making any useMemo with today in deps miss its cache always.
  const today = useMemo(() => new Date(), []);
  const before = isBeforeCourse(today);
  const after = isAfterCourse(today);
  const rawDay = getDayNumber(today);
  const day = clampDay(rawDay);

  const activeDay = clampDay(rawDay + selectedDayOffset);
  const activeDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + selectedDayOffset);
    return d;
  }, [today, selectedDayOffset]);

  const topics = useMemo(() => getTodayTopics(activeDay), [activeDay]);
  const monthData = getMonthByCurriculumDay(activeDay);
  const streak = useMemo(() => getCurrentStreak(entries, today), [entries, today]);
  const completedDays = useMemo(() => getOverallProgress(entries), [entries]);
  const lawDone = useMemo(() => getDomainProgress(entries, 'law'), [entries]);
  const econDone = useMemo(() => getDomainProgress(entries, 'economics'), [entries]);
  const finDone = useMemo(() => getDomainProgress(entries, 'finance'), [entries]);

  const activeIso = isoDate(activeDate);
  const existing = entries.find((e) => e.entry_date === activeIso) ?? null;

  function onSaved(saved: DailyEntry) {
    setEntries((prev) => {
      const next = prev.filter((e) => e.entry_date !== saved.entry_date);
      next.unshift(saved);
      return next.sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));
    });
  }

  if (before) {
    return (
      <div className="mx-auto max-w-content px-5 py-16 text-center md:px-6">
        <h1 className="mb-3 font-display text-3xl">Course starts June 1, 2026.</h1>
        <p className="text-text-secondary">Hi {displayName ?? email}. See you on day one.</p>
      </div>
    );
  }

  if (after) {
    return (
      <div className="mx-auto max-w-content px-5 py-16 text-center md:px-6">
        <h1 className="mb-3 font-display text-3xl">Course completed.</h1>
        <p className="text-text-secondary">122 days. 3 domains. Now go build with it.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-8 md:px-6">
      {showNotificationPrompt && (
        <div className="card-2 bg-gold/5 border-gold/20 reveal flex animate-fade-in items-center justify-between gap-4 px-4 py-3 text-xs">
          <div className="flex items-center gap-2 text-text-primary">
            <Bell size={14} className="shrink-0 animate-bounce text-gold" />
            <span>Stay on track: Enable device push notifications to receive study reminders.</span>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/settings" className="font-semibold text-gold hover:underline">
              Configure Alerts
            </Link>
            <button
              onClick={() => {
                localStorage.setItem('dismissed-push-prompt', 'true');
                setShowNotificationPrompt(false);
              }}
              className="p-0.5 text-text-muted hover:text-text-primary"
              aria-label="Dismiss notification prompt"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      {/* HEADER */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.32em] text-text-secondary">
            Hi {displayName ?? email.split('@')[0]}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-4">
            <h1 className="font-display text-3xl tracking-tight md:text-4xl">
              Day {activeDay}{' '}
              <span className="text-lg text-text-muted">of {TOTAL_CALENDAR_DAYS}</span>
            </h1>

            {/* Today/Yesterday Toggle */}
            <div className="flex max-w-[200px] gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5">
              <button
                onClick={() => setSelectedDayOffset(0)}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all duration-150 ${selectedDayOffset === 0 ? 'border border-[var(--border-dim)] bg-surface text-gold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDayOffset(-1)}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all duration-150 ${selectedDayOffset === -1 ? 'border border-[var(--border-dim)] bg-surface text-gold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Yesterday
              </button>
            </div>
          </div>
          {monthData && (
            <p className="mt-1 text-sm text-text-secondary">
              {monthData.monthName} · {monthData.theme}
            </p>
          )}
        </div>
        <StreakBadge streak={streak} />
      </header>

      {/* TODAY TOPICS */}
      <section className="space-y-3" data-tour="today-topics">
        <h2 className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
          {selectedDayOffset === 0 ? "Today's study" : "Yesterday's study"}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <DayCard domain="law" day={activeDay} />
          <DayCard domain="economics" day={activeDay} />
          <DayCard domain="finance" day={activeDay} />
        </div>
        {!topics.law && !topics.economics && !topics.finance && (
          <p className="text-xs italic text-text-muted">
            Day {activeDay} is in the integration & sharing buffer. Review, write, ship.
          </p>
        )}
      </section>

      {/* LOG FORM */}
      <section className="space-y-3" data-tour="daily-log-form">
        <h2 className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
          {existing
            ? `Edit ${selectedDayOffset === 0 ? "today's" : "yesterday's"} log`
            : `Day ${activeDay} is waiting. What did you study?`}
        </h2>
        <DailyLogForm
          userId={userId}
          day={activeDay}
          date={activeDate}
          existing={existing}
          onSaved={onSaved}
        />
      </section>

      {/* PROGRESS */}
      <section className="grid gap-3 md:grid-cols-3" data-tour="streak-stats">
        <Stat
          icon={<CheckCircle2 size={14} className="text-success" />}
          label="Days completed"
          value={`${completedDays}`}
          sub={`/ ${TOTAL_CALENDAR_DAYS}`}
        />
        <Stat
          icon={<Flame size={14} className="text-gold" />}
          label="Current streak"
          value={`${streak}`}
          sub="day(s)"
        />
        <Stat
          icon={<Calendar size={14} className="text-slate-blue" />}
          label="Days remaining"
          value={`${Math.max(0, TOTAL_CALENDAR_DAYS - day)}`}
          sub="to go"
        />
      </section>

      <section className="card space-y-4 p-5" data-tour="domain-progress">
        <h3 className="font-display text-base">Per-domain progress</h3>
        <ProgressBar value={lawDone} max={TOTAL_CALENDAR_DAYS} label="⚖️ Law" accent="gold" />
        <ProgressBar
          value={econDone}
          max={TOTAL_CALENDAR_DAYS}
          label="📊 Economics"
          accent="sage"
        />
        <ProgressBar value={finDone} max={TOTAL_CALENDAR_DAYS} label="💰 Finance" accent="slate" />
      </section>

      <CalendarHeatmap entries={entries} currentDay={day} />

      <ThursdayTracker entries={entries} />

      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
          Entry history
        </h2>
        {entries.length === 0 ? (
          <div className="card p-6 text-center text-sm text-text-secondary">
            No entries yet. Start your streak today.
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.slice(0, 30).map((e) => (
              <li key={e.id}>
                <EntryCard entry={e} showJournal authorName={displayName ?? email.split('@')[0]} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-text-secondary">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-display text-3xl">
        {value}
        {sub && <span className="text-base text-text-muted"> {sub}</span>}
      </p>
    </div>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="card-2 inline-flex items-center gap-3 px-4 py-3">
      <Flame size={18} className={streak > 0 ? 'text-gold' : 'text-text-muted'} />
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Streak</p>
        <p className="font-display text-xl leading-none">
          {streak > 0 ? `${streak} days` : 'Start today'}
        </p>
      </div>
    </div>
  );
}

function ThursdayTracker({ entries }: { entries: DailyEntry[] }) {
  const thursdays = getAllThursdays();
  const byDate = new Map(entries.map((e) => [e.entry_date, e]));
  return (
    <section className="card p-5">
      <h3 className="mb-3 font-display text-base">Weekly video review · Thursdays</h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-2">
        {thursdays.map((t) => {
          const e = byDate.get(isoDate(t.date));
          const done = Boolean(
            e && (e.law_completed || e.economics_completed || e.finance_completed),
          );
          return (
            <div
              key={t.day}
              className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-[11px] transition-colors ${
                done ? 'border-gold/40 bg-accent-law' : 'border-border bg-surface'
              }`}
            >
              <span className="font-mono text-text-muted">D{t.day}</span>
              <span className={done ? 'text-gold' : 'text-text-muted'}>{done ? '✓' : '○'}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
