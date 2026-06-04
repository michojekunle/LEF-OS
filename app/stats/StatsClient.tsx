'use client';

import { useMemo } from 'react';
import { Flame, CheckCircle2, Calendar, Award, Video, BookOpen, TrendingUp } from 'lucide-react';
import {
  getOverallProgress,
  getDomainProgress,
  getCurrentStreak,
  getAllThursdays,
  getDayNumber,
  type DailyEntry,
} from '@/lib/utils';
import { TOTAL_CALENDAR_DAYS } from '@/data/curriculum-data';
import { ProgressBar } from '@/components/ProgressBar';

type Props = {
  userId: string;
  email: string;
  initialEntries: DailyEntry[];
};

export function StatsClient({ initialEntries }: Props) {
  const entries = useMemo(() => initialEntries, [initialEntries]);

  // Overall calculations
  const totalCompleted = useMemo(() => getOverallProgress(entries), [entries]);
  const currentStreak = useMemo(() => getCurrentStreak(entries), [entries]);

  const longestStreak = useMemo(() => {
    if (entries.length === 0) return 0;
    const loggedDates = new Set(
      entries
        .filter((e) => e.law_completed || e.economics_completed || e.finance_completed)
        .map((e) => e.entry_date),
    );

    if (loggedDates.size === 0) return 0;

    const dates = Array.from(loggedDates).sort();
    let longest = 0;
    let current = 0;
    let prevDate: Date | null = null;

    for (const dateStr of dates) {
      const currentDate = new Date(dateStr + 'T00:00:00Z');
      if (!prevDate) {
        current = 1;
      } else {
        const diffMs = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          current++;
        } else if (diffDays > 1) {
          longest = Math.max(longest, current);
          current = 1;
        }
      }
      prevDate = currentDate;
    }
    return Math.max(longest, current);
  }, [entries]);

  // Per-domain progress
  const lawDone = useMemo(() => getDomainProgress(entries, 'law'), [entries]);
  const econDone = useMemo(() => getDomainProgress(entries, 'economics'), [entries]);
  const finDone = useMemo(() => getDomainProgress(entries, 'finance'), [entries]);

  // Thursday video reviews completions
  const thursdays = useMemo(() => getAllThursdays(), []);
  const thursdayCount = thursdays.length;
  const thursdaysDone = useMemo(() => {
    const byDate = new Map(entries.map((e) => [e.entry_date, e]));
    return thursdays.filter((t) => {
      const dateStr = t.date.toISOString().slice(0, 10);
      const e = byDate.get(dateStr);
      return Boolean(e && (e.law_completed || e.economics_completed || e.finance_completed));
    }).length;
  }, [entries, thursdays]);

  // Month-by-month completions
  const monthStats = useMemo(() => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0 };
    entries.forEach((e) => {
      if (e.law_completed || e.economics_completed || e.finance_completed) {
        const d = new Date(e.entry_date + 'T00:00:00Z');
        const dayNum = getDayNumber(d);
        if (dayNum >= 1 && dayNum <= 28) stats[1]++;
        else if (dayNum >= 29 && dayNum <= 56) stats[2]++;
        else if (dayNum >= 57 && dayNum <= 84) stats[3]++;
        else if (dayNum >= 85 && dayNum <= 122) stats[4]++;
      }
    });
    return stats;
  }, [entries]);

  // Percentage completions
  const completionPercentage = useMemo(() => {
    return Math.round((totalCompleted / TOTAL_CALENDAR_DAYS) * 100) || 0;
  }, [totalCompleted]);

  return (
    <div className="mx-auto max-w-content animate-fade-in space-y-8 px-5 py-8 md:px-6">
      {/* HEADER */}
      <header>
        <p className="mb-1 text-xs uppercase tracking-[0.32em] text-text-secondary">
          Academic Progress
        </p>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">Curriculum Statistics</h1>
        <p className="mt-1 max-w-md text-sm text-text-secondary">
          A breakdown of your learning journey across law, economics, and finance tracks.
        </p>
      </header>

      {/* METRIC CARDS */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CheckCircle2 size={16} className="text-success" />}
          label="Total Logged Days"
          value={`${totalCompleted}`}
          sub={`/ ${TOTAL_CALENDAR_DAYS} days`}
        />
        <StatCard
          icon={<Flame size={16} className="text-gold" />}
          label="Current Streak"
          value={`${currentStreak}`}
          sub="active days"
        />
        <StatCard
          icon={<Award size={16} className="text-sage" />}
          label="Longest Streak"
          value={`${longestStreak}`}
          sub="best record"
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-slate-blue" />}
          label="Completion Rate"
          value={`${completionPercentage}%`}
          sub="syllabus covered"
        />
      </section>

      {/* MAIN PLOTS */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* DOMAIN PROGRESS PANEL */}
        <section className="card flex flex-col justify-between space-y-5 p-5 md:col-span-2">
          <div>
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
              <BookOpen size={14} className="text-gold" />
              Per-Domain Syllabus Progress
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Check your level of progress across the specific course domains.
            </p>
          </div>

          <div className="space-y-4 py-2">
            <ProgressBar
              value={lawDone}
              max={TOTAL_CALENDAR_DAYS}
              label="⚖️ Law Domain"
              accent="gold"
            />
            <ProgressBar
              value={econDone}
              max={TOTAL_CALENDAR_DAYS}
              label="📊 Economics Domain"
              accent="sage"
            />
            <ProgressBar
              value={finDone}
              max={TOTAL_CALENDAR_DAYS}
              label="💰 Finance Domain"
              accent="slate"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border-dim)] pt-4 text-sm text-text-secondary">
            <span>Minimum domain target: 122 completions</span>
            <span className="font-semibold text-gold">Learning in public</span>
          </div>
        </section>

        {/* THURSDAYS STATS */}
        <section className="card flex flex-col justify-between p-5">
          <div>
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
              <Video size={14} className="animate-pulse text-slate-blue" />
              Video Review Syncs
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Thursdays logged for weekly interactive summary reviews.
            </p>
          </div>

          <div className="space-y-2 py-6 text-center">
            <p className="text-5xl font-bold tabular-nums text-text-primary">
              {thursdaysDone} <span className="text-lg font-normal text-text-muted">/ {thursdayCount}</span>
            </p>
            <p className="text-xs uppercase tracking-wider text-text-muted">
              Weekly Reviews Completed
            </p>
          </div>

          <div className="bg-surface-2/40 h-1.5 w-full rounded-full border border-border">
            <div
              className="h-full rounded-full bg-slate-blue transition-all duration-300"
              style={{ width: `${(thursdaysDone / (thursdayCount || 1)) * 100}%` }}
            />
          </div>
        </section>
      </div>

      {/* MONTHLY BREAKDOWN */}
      <section className="card space-y-4 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
            <Calendar size={14} className="text-gold" />
            Monthly Milestone Progress
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            Visual breakdown of study logs recorded in each month of the 4-month curriculum.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MonthMetric
            title="Month 1: Foundation"
            days={28}
            logged={monthStats[1]}
            color="border-accent-law"
            bg="bg-accent-law"
          />
          <MonthMetric
            title="Month 2: Deepening"
            days={28}
            logged={monthStats[2]}
            color="border-accent-econ"
            bg="bg-accent-econ"
          />
          <MonthMetric
            title="Month 3: Synthesis"
            days={28}
            logged={monthStats[3]}
            color="border-accent-finance"
            bg="bg-accent-finance"
          />
          <MonthMetric
            title="Month 4: Application"
            days={38}
            logged={monthStats[4]}
            color="border-accent-synthesis"
            bg="bg-accent-synthesis"
          />
        </div>
      </section>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card space-y-2.5 p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-secondary">
        {icon}
        {label}
      </div>
      <div>
        <p className="text-3xl font-bold tabular-nums text-text-primary">{value}</p>
        <p className="mt-0.5 text-xs text-text-muted">{sub}</p>
      </div>
    </div>
  );
}

function MonthMetric({
  title,
  days,
  logged,
  color,
  bg,
}: {
  title: string;
  days: number;
  logged: number;
  color: string;
  bg: string;
}) {
  const percentage = Math.round((logged / days) * 100) || 0;
  return (
    <div
      className={`bg-surface-2/20 flex flex-col justify-between gap-3 rounded-lg border p-4 ${color}`}
    >
      <div>
        <p className="text-xs font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs text-text-muted">{days} syllabus days</p>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs tracking-wide text-text-secondary">
          <span>
            Logged: {logged} / {days}
          </span>
          <span className="font-mono">{percentage}%</span>
        </div>
        <div className="bg-border/20 h-1 w-full rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-300 ${bg}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
