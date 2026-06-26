'use client';

import { useMemo, useState, useEffect } from 'react';
import { Flame, CheckCircle2, Calendar, Bell, X, ArrowRight, BookOpen, Scale, BarChart, Landmark, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import {
  getDayNumber,
  getTodayTopics,
  getCurrentStreak,
  getOverallProgress,
  getDomainProgress,
  isBeforeCourse,
  isAfterCourse,
  isEntryComplete,
  isoDate,
  getAllThursdays,
  clampDay,
  isThursday,
  type DailyEntry,
} from '@/lib/utils';
import { DayCard } from '@/components/DayCard';
import { DailyLogForm } from '@/components/DailyLogForm';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { ProgressBar } from '@/components/ProgressBar';
import { EntryCard } from '@/components/EntryCard';
import { StatCard } from '@/components/StatCard';
import { useCourse } from '@/components/CourseContext';
import { checkDailyAchievements, checkStreakAchievement } from '@/lib/achievements';
import { toCurriculumDay } from '@/lib/utils';
import { TOTAL_CURRICULUM_DAYS } from '@/lib/utils';
import { TOTAL_CALENDAR_DAYS, getMonthByCurriculumDay, findDayMeta } from '@/data/curriculum-data';

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
  const [streakBannerDismissed, setStreakBannerDismissed] = useState(false);
  // Achievements are dispatched via window 'lef-achievement' event and handled
  // globally by AchievementProvider in layout.tsx — no local modal needed.
  const course = useCourse();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const dismissed = localStorage.getItem('dismissed-push-prompt');
        if (!dismissed) {
          setShowNotificationPrompt(true);
        }
      }
    }
    // Restore streak banner dismissal from session
    if (typeof window !== 'undefined') {
      setStreakBannerDismissed(Boolean(sessionStorage.getItem('lef_streak_banner_dismissed')));
    }
  }, []);

  // Stable today reference — new Date() at render level creates a new object
  // every render, making any useMemo with today in deps miss its cache always.
  const today = useMemo(() => new Date(), []);
  const before = isBeforeCourse(today, course);
  const after = isAfterCourse(today, course);
  const rawDay = getDayNumber(today, course);
  const day = clampDay(rawDay);

  const activeDay = clampDay(rawDay + selectedDayOffset);
  const activeDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + selectedDayOffset);
    return d;
  }, [today, selectedDayOffset]);

  // Map calendar day → curriculum topic day based on the user's timeline spread
  const activeCurriculumDay = useMemo(
    () => toCurriculumDay(activeDay, course.totalDays),
    [activeDay, course.totalDays],
  );

  const topics = useMemo(() => getTodayTopics(activeCurriculumDay), [activeCurriculumDay]);
  const monthData = getMonthByCurriculumDay(activeCurriculumDay);
  const streak = useMemo(() => getCurrentStreak(entries, today), [entries, today]);
  const completedDays = useMemo(() => getOverallProgress(entries), [entries]);
  const lawDone = useMemo(() => getDomainProgress(entries, 'law'), [entries]);
  const econDone = useMemo(() => getDomainProgress(entries, 'economics'), [entries]);
  const finDone = useMemo(() => getDomainProgress(entries, 'finance'), [entries]);

  const activeIso = isoDate(activeDate);
  const existing = entries.find((e) => e.entry_date === activeIso) ?? null;

  function onSaved(saved: DailyEntry) {
    setEntries((prev) => {
      const updated = [...prev.filter((e) => e.entry_date !== saved.entry_date), saved].sort(
        (a, b) => (a.entry_date < b.entry_date ? 1 : -1),
      );

      // Derive week day numbers for Perfect Week check
      const meta = findDayMeta('law', saved.day_number);
      const weekNum = meta?.weekNumber;
      let weekDays: number[] = [];
      if (weekNum !== undefined) {
        // Collect all days in the same week across the curriculum
        for (let d = 1; d <= TOTAL_CALENDAR_DAYS; d++) {
          const m =
            findDayMeta('law', d) ?? findDayMeta('economics', d) ?? findDayMeta('finance', d);
          if (m?.weekNumber === weekNum) weekDays.push(d);
        }
        weekDays = [...new Set(weekDays)].sort((a, b) => a - b);
      }

      const newStreak = getCurrentStreak(updated, today);
      const achieved = [
        ...checkDailyAchievements(saved, updated, weekDays),
        ...checkStreakAchievement(newStreak),
      ];
      // Dispatch via global event (caught by AchievementProvider in layout)
      for (const a of achieved) {
        window.dispatchEvent(new CustomEvent('lef-achievement', { detail: a }));
      }

      return updated;
    });
  }

  if (before) {
    const startStr = course.start.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return (
      <div className="mx-auto max-w-content px-5 py-16 text-center md:px-6">
        <h1 className="mb-3 font-display text-3xl">Course starts {startStr}.</h1>
        <p className="text-text-secondary">Hi {displayName ?? email}. See you on day one.</p>
      </div>
    );
  }

  if (after) {
    return (
      <div className="mx-auto max-w-content px-5 py-16 text-center md:px-6">
        <h1 className="mb-3 font-display text-3xl">Course completed.</h1>
        <p className="text-text-secondary">
          {course.totalDays} days. {course.preferredDomains.length} domain
          {course.preferredDomains.length !== 1 ? 's' : ''}. Now go build with it.
        </p>
      </div>
    );
  }

  // Streak-at-risk: after 4 PM local, today not yet logged
  const localHour = today.getHours();
  const todayIso = isoDate(today);
  const todayEntry = entries.find((e) => e.entry_date === todayIso);
  const todayLogged = todayEntry ? isEntryComplete(todayEntry) : false;
  const showStreakBanner = !streakBannerDismissed && localHour >= 16 && !todayLogged && streak > 0;

  // Thursday synthesis prompt
  const showThursdayPrompt = isThursday(today) && !todayLogged;

  return (
    <>
      <div className="mx-auto max-w-content space-y-8 px-5 py-8 md:px-6">
        {/* Streak-at-risk banner */}
        {showStreakBanner && (
          <div className="card-2 border-gold/20 bg-gold/5 reveal flex items-center justify-between gap-4 px-4 py-3 text-xs">
            <div className="flex items-center gap-2 text-text-primary">
              <Flame size={14} className="shrink-0 text-gold" />
              <span>
                Your <span className="font-semibold text-gold">{streak}-day streak</span> is waiting
                — log today before midnight.
              </span>
            </div>
            <button
              onClick={() => {
                sessionStorage.setItem('lef_streak_banner_dismissed', 'true');
                setStreakBannerDismissed(true);
              }}
              className="shrink-0 p-1 text-text-muted hover:text-text-primary"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Thursday synthesis prompt */}
        {showThursdayPrompt && (
          <div className="card-2 border-sage/20 bg-sage/5 reveal flex items-center gap-3 px-4 py-3 text-xs">
            <BookOpen size={14} className="shrink-0 text-sage" />
            <span className="text-text-primary">
              Weekly review day — what&apos;s one thing from this week worth writing down?{' '}
              <a href="#log-form" className="font-semibold text-sage hover:underline">
                Log it ↓
              </a>
            </span>
          </div>
        )}

        {showNotificationPrompt && (
          <div className="card-2 bg-gold/5 border-gold/20 reveal flex animate-fade-in items-center justify-between gap-4 px-4 py-3 text-xs">
            <div className="flex items-center gap-2 text-text-primary">
              <Bell size={14} className="shrink-0 animate-bounce text-gold" />
              <span>
                Stay on track: Enable device push notifications to receive study reminders.
              </span>
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
            <p className="mb-1 text-xs uppercase tracking-[0.32em] text-text-secondary">
              Hi {displayName ?? email.split('@')[0]}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-4">
              <h1 className="font-display text-3xl tracking-tight md:text-4xl">
                Day {activeDay}{' '}
                <span className="text-lg text-text-muted">of {course.totalDays}</span>
              </h1>

              {/* Today/Yesterday Toggle */}
              <div className="flex max-w-[200px] gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5">
                <button
                  onClick={() => setSelectedDayOffset(0)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-all duration-150 ${selectedDayOffset === 0 ? 'border border-[var(--border-dim)] bg-surface text-gold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedDayOffset(-1)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-all duration-150 ${selectedDayOffset === -1 ? 'border border-[var(--border-dim)] bg-surface text-gold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
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
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.18em] text-text-secondary">
              {selectedDayOffset === 0 ? "Today's study" : "Yesterday's study"}
            </h2>
            <Link
              href={`/day/${activeDay}`}
              className="inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-gold"
            >
              Full study content <ArrowRight size={11} />
            </Link>
          </div>
          <div
            className={`grid gap-3 ${course.preferredDomains.length === 1 ? '' : course.preferredDomains.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
          >
            {course.preferredDomains.includes('law') && (
              <DayCard domain="law" day={activeCurriculumDay} />
            )}
            {course.preferredDomains.includes('economics') && (
              <DayCard domain="economics" day={activeCurriculumDay} />
            )}
            {course.preferredDomains.includes('finance') && (
              <DayCard domain="finance" day={activeCurriculumDay} />
            )}
          </div>
          {!topics.law && !topics.economics && !topics.finance && (
            <p className="text-xs italic text-text-muted">
              Day {activeDay} is in the review & integration period. Reflect, write, ship.
            </p>
          )}
          {(topics.law || topics.economics || topics.finance) && (
            <Link
              href={`/day/${activeCurriculumDay}`}
              className="btn btn-primary inline-flex w-full items-center justify-center gap-2 md:w-auto"
            >
              Open Day {activeCurriculumDay} — Study Content <ArrowRight size={14} />
            </Link>
          )}
        </section>

        {/* LOG FORM */}
        <section className="space-y-3" data-tour="daily-log-form">
          <h2 className="text-xs uppercase tracking-[0.18em] text-text-secondary">
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
          <StatCard
            icon={<CheckCircle2 size={14} className="text-success" />}
            label="Days logged"
            value={`${completedDays}`}
            sub="/ 111 topics"
          />
          <StatCard
            icon={<Flame size={14} className="text-gold" />}
            label="Current streak"
            value={`${streak}`}
            sub="day(s)"
          />
          <StatCard
            icon={<Calendar size={14} className="text-slate-blue" />}
            label="Days remaining"
            value={`${Math.max(0, course.totalDays - day)}`}
            sub="to go"
          />
        </section>

        <section className="card space-y-4 p-5" data-tour="domain-progress">
          <h3 className="text-sm font-semibold text-text-primary">Per-domain progress</h3>
          {course.preferredDomains.includes('law') && (
            <ProgressBar
              value={lawDone}
              max={TOTAL_CURRICULUM_DAYS}
              label={
                <span className="inline-flex items-center gap-1">
                  <Scale className="h-3 w-3" /> Law
                </span>
              }
              accent="gold"
            />
          )}
          {course.preferredDomains.includes('economics') && (
            <ProgressBar
              value={econDone}
              max={TOTAL_CURRICULUM_DAYS}
              label={
                <span className="inline-flex items-center gap-1">
                  <BarChart className="h-3 w-3" /> Economics
                </span>
              }
              accent="sage"
            />
          )}
          {course.preferredDomains.includes('finance') && (
            <ProgressBar
              value={finDone}
              max={TOTAL_CURRICULUM_DAYS}
              label={
                <span className="inline-flex items-center gap-1">
                  <Landmark className="h-3 w-3" /> Finance
                </span>
              }
              accent="slate"
            />
          )}
        </section>

        <CalendarHeatmap entries={entries} currentDay={day} />

        <ThursdayTracker entries={entries} />

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.18em] text-text-secondary">Entry history</h2>
          {entries.length === 0 ? (
            <div className="card space-y-3 p-8 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-text-muted" />
              <p className="text-sm font-medium text-text-primary">No entries yet</p>
              <p className="mx-auto max-w-xs text-sm text-text-secondary">
                Log your first study session above and it will appear here. Your history, streak,
                and progress all build from these entries.
              </p>
              <a
                href="#log-form"
                className="btn btn-primary mx-auto mt-1 inline-flex items-center gap-2 text-sm"
              >
                Log today ↓
              </a>
            </div>
          ) : (
            <ul className="space-y-3">
              {entries.slice(0, 30).map((e) => (
                <li key={e.id}>
                  <EntryCard
                    entry={e}
                    showJournal
                    authorName={displayName ?? email.split('@')[0]}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="card-2 inline-flex items-center gap-3 px-4 py-3">
      <Flame size={18} className={streak > 0 ? 'text-gold' : 'text-text-muted'} />
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">Streak</p>
        <p className="text-xl font-bold tabular-nums leading-none">
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
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Weekly video review · Thursdays
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-2">
        {thursdays.map((t) => {
          const e = byDate.get(isoDate(t.date));
          const done = Boolean(e && isEntryComplete(e));
          return (
            <div
              key={t.day}
              className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-sm transition-colors ${
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
