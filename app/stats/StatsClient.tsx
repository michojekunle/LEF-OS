'use client';

import { useMemo } from 'react';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Award,
  Video,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import {
  getOverallProgress,
  getDomainProgress,
  getCurrentStreak,
  getAllThursdays,
  getDayNumber,
  type DailyEntry,
} from '@/lib/utils';
import { TOTAL_CALENDAR_DAYS } from '@/components/curriculum-data';
import { ProgressBar } from '@/components/ProgressBar';

type Props = {
  userId: string;
  email: string;
  initialEntries: DailyEntry[];
};

export function StatsClient({ email, initialEntries }: Props) {
  const entries = useMemo(() => initialEntries, [initialEntries]);

  // Overall calculations
  const totalCompleted = useMemo(() => getOverallProgress(entries), [entries]);
  const currentStreak = useMemo(() => getCurrentStreak(entries), [entries]);

  const longestStreak = useMemo(() => {
    if (entries.length === 0) return 0;
    const loggedDates = new Set(
      entries
        .filter((e) => e.law_completed || e.economics_completed || e.finance_completed)
        .map((e) => e.entry_date)
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
    <div className="mx-auto max-w-content px-5 md:px-6 py-8 space-y-8 animate-fade-in">
      {/* HEADER */}
      <header>
        <p className="text-[10px] uppercase tracking-[0.32em] text-text-secondary mb-1">
          Academic Progress
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">Curriculum Statistics</h1>
        <p className="text-sm text-text-secondary mt-1 max-w-md">
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
        <section className="card p-5 space-y-5 md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} className="text-gold" />
              Per-Domain Syllabus Progress
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Check your level of progress across the specific course domains.
            </p>
          </div>

          <div className="space-y-4 py-2">
            <ProgressBar value={lawDone} max={TOTAL_CALENDAR_DAYS} label="⚖️ Law Domain" accent="gold" />
            <ProgressBar value={econDone} max={TOTAL_CALENDAR_DAYS} label="📊 Economics Domain" accent="sage" />
            <ProgressBar value={finDone} max={TOTAL_CALENDAR_DAYS} label="💰 Finance Domain" accent="slate" />
          </div>

          <div className="border-t border-border/40 pt-4 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Minimum domain target: 122 completions</span>
            <span className="font-semibold text-gold">Learning in public</span>
          </div>
        </section>

        {/* THURSDAYS STATS */}
        <section className="card p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Video size={14} className="text-slate-blue animate-pulse" />
              Video Review Syncs
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Thursdays logged for weekly interactive summary reviews.
            </p>
          </div>

          <div className="py-6 text-center space-y-2">
            <p className="font-display text-5xl font-bold text-text-primary">
              {thursdaysDone} <span className="text-lg text-text-muted">/ {thursdayCount}</span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-text-muted">
              Weekly Reviews Completed
            </p>
          </div>

          <div className="w-full bg-surface-2/40 rounded-full h-1.5 border border-border">
            <div
              className="bg-slate-blue h-full rounded-full transition-all duration-300"
              style={{ width: `${(thursdaysDone / (thursdayCount || 1)) * 100}%` }}
            />
          </div>
        </section>
      </div>

      {/* MONTHLY BREAKDOWN */}
      <section className="card p-5 space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} className="text-gold" />
            Monthly Milestone Progress
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Visual breakdown of study logs recorded in each month of the 4-month curriculum.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MonthMetric title="Month 1: Foundation" days={28} logged={monthStats[1]} color="border-accent-law" bg="bg-accent-law" />
          <MonthMetric title="Month 2: Deepening" days={28} logged={monthStats[2]} color="border-accent-econ" bg="bg-accent-econ" />
          <MonthMetric title="Month 3: Synthesis" days={28} logged={monthStats[3]} color="border-accent-finance" bg="bg-accent-finance" />
          <MonthMetric title="Month 4: Application" days={38} logged={monthStats[4]} color="border-accent-synthesis" bg="bg-accent-synthesis" />
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
    <div className="card p-5 space-y-2.5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-text-secondary">
        {icon}
        {label}
      </div>
      <div>
        <p className="font-display text-3xl font-semibold text-text-primary">{value}</p>
        <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>
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
    <div className={`p-4 rounded-lg border bg-surface-2/20 flex flex-col justify-between gap-3 ${color}`}>
      <div>
        <p className="text-xs font-semibold text-text-primary font-display">{title}</p>
        <p className="text-[10px] text-text-muted mt-0.5">{days} syllabus days</p>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] tracking-wide text-text-secondary">
          <span>Logged: {logged} / {days}</span>
          <span className="font-mono">{percentage}%</span>
        </div>
        <div className="w-full bg-border/20 rounded-full h-1">
          <div
            className={`h-full rounded-full transition-all duration-300 ${bg}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
