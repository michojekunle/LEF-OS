'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CalendarDays, Info, BookMarked, Check, Scale, BarChart, Landmark } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

const DOMAIN_OPTIONS = [
  {
    id: 'law',
    label: 'Law',
    icon: <Scale className="h-5 w-5" />,
    colour: 'text-gold',
    border: 'border-gold/40',
    bg: 'bg-gold/10',
  },
  {
    id: 'economics',
    label: 'Economics',
    icon: <BarChart className="h-5 w-5" />,
    colour: 'text-sage',
    border: 'border-sage/40',
    bg: 'bg-sage/10',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: <Landmark className="h-5 w-5" />,
    colour: 'text-slate-blue',
    border: 'border-slate-blue/40',
    bg: 'bg-slate-blue/10',
  },
] as const;

type Props = {
  userId: string;
  initialReminderEnabled: boolean;
  initialBriefEmailEnabled?: boolean;
  initialTimezone: string;
  initialCourseStartDate?: string | null;
  initialCourseDurationMonths?: number | null;
  initialPreferredDomains?: string[] | null;
};

const TIMEZONES = [
  { value: 'Africa/Lagos', label: 'Lagos (West Africa Time - UTC+1)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'London (GMT/BST - UTC+0/+1)' },
  { value: 'America/New_York', label: 'New York (EST/EDT - UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT - UTC-8/-7)' },
  { value: 'Asia/Dubai', label: 'Dubai (Gulf Standard Time - UTC+4)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT - UTC+8)' },
];

const DURATION_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export function PreferencesForm({
  userId,
  initialReminderEnabled,
  initialBriefEmailEnabled = false,
  initialTimezone,
  initialCourseStartDate,
  initialCourseDurationMonths,
  initialPreferredDomains,
}: Props) {
  const toast = useToast();
  const router = useRouter();
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(initialReminderEnabled);
  const [briefEmailEnabled, setBriefEmailEnabled] = useState(initialBriefEmailEnabled);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [preferredDomains, setPreferredDomains] = useState<Set<string>>(
    new Set(
      initialPreferredDomains && initialPreferredDomains.length > 0
        ? initialPreferredDomains
        : ['law', 'economics', 'finance'],
    ),
  );

  function toggleDomain(id: string) {
    setPreferredDomains((prev) => {
      const next = new Set(prev);
      if (next.has(id) && next.size === 1) return prev; // keep at least one
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  const [courseStartDate, setCourseStartDate] = useState(initialCourseStartDate ?? '2026-06-01');
  const [courseDurationMonths, setCourseDurationMonths] = useState(
    initialCourseDurationMonths ?? 4,
  );

  /** Compute end date and total calendar days live as user adjusts sliders */
  const courseEnd = useMemo(() => {
    if (!courseStartDate) return null;
    try {
      const d = new Date(courseStartDate);
      d.setUTCMonth(d.getUTCMonth() + courseDurationMonths);
      d.setUTCDate(d.getUTCDate() - 1);
      return d;
    } catch {
      return null;
    }
  }, [courseStartDate, courseDurationMonths]);

  const totalDays = useMemo(() => {
    if (!courseEnd || !courseStartDate) return null;
    const start = new Date(courseStartDate);
    return Math.round((courseEnd.getTime() - start.getTime()) / 86_400_000) + 1;
  }, [courseEnd, courseStartDate]);

  async function handleSaveSettings() {
    try {
      const sb = supabaseBrowser();
      const { error } = await sb
        .from('user_settings')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({
          daily_reminder_enabled: dailyReminderEnabled,
          daily_brief_email_enabled: briefEmailEnabled,
          timezone,
          course_start_date: courseStartDate || null,
          course_duration_months: courseDurationMonths,
          preferred_domains: Array.from(preferredDomains),
        } as any)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Preferences saved.');
      // Re-run server components so CourseProvider picks up the new timeline
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings.');
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Course Timeline ──────────────────────────────────────────────── */}
      <section className="card space-y-5 p-6">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
          <CalendarDays size={14} className="text-gold" />
          Course Timeline
        </h2>

        <p className="text-xs text-text-secondary">
          Set your personal start date. Day numbers and progress are calculated relative to it. The
          curriculum has 111 study topics — the duration sets your course window end date and how
          much buffer time you have for review after the last topic.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Start date */}
          <div className="space-y-1.5">
            <label
              htmlFor="course-start"
              className="block text-xs uppercase tracking-[0.18em] text-text-secondary"
            >
              Start date
            </label>
            <input
              id="course-start"
              type="date"
              value={courseStartDate}
              onChange={(e) => setCourseStartDate(e.target.value)}
              className="input max-w-xs"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label
              htmlFor="course-duration"
              className="block text-xs uppercase tracking-[0.18em] text-text-secondary"
            >
              Duration
            </label>
            <select
              id="course-duration"
              value={courseDurationMonths}
              onChange={(e) => setCourseDurationMonths(Number(e.target.value))}
              className="select max-w-xs"
            >
              {DURATION_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} month{m > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live computed summary */}
        {courseEnd && totalDays && (
          <div className="bg-surface-2/50 flex items-start gap-2 rounded-lg border border-[var(--border-subtle)] px-4 py-3 text-xs text-text-secondary">
            <Info size={13} className="mt-0.5 shrink-0 text-text-muted" />
            <div className="space-y-1">
              <span>
                Window:{' '}
                <span className="text-text-primary">
                  {new Date(courseStartDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                {' → '}
                <span className="text-text-primary">
                  {courseEnd.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                {' · '}
                <span className="font-medium text-gold">{totalDays} days</span>
              </span>
              <p className="text-text-muted">
                The 111 study topics run from Day 1 to Day 111 at one per day. Days 112–{totalDays}{' '}
                are your review and integration buffer.
              </p>
            </div>
          </div>
        )}

        <button onClick={handleSaveSettings} className="btn btn-primary px-4 py-2 text-xs">
          Save Timeline
        </button>
      </section>

      {/* ── Study Domains ───────────────────────────────────────────────── */}
      <section className="card space-y-5 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
            <BookMarked size={14} className="text-gold" />
            Study Domains
          </h2>
          <p className="mt-1.5 text-xs text-text-secondary">
            Choose which domains appear in your daily study view. You can change this at any time —
            your logs and notes for hidden domains are always preserved.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {DOMAIN_OPTIONS.map((d) => {
            const active = preferredDomains.has(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDomain(d.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  active
                    ? `${d.bg} ${d.border}`
                    : 'border-[var(--border-subtle)] hover:border-[var(--border)]'
                }`}
              >
                <span className="text-lg">{d.icon}</span>
                <span
                  className={`flex-1 text-sm font-medium ${active ? d.colour : 'text-text-secondary'}`}
                >
                  {d.label}
                </span>
                {active && <Check size={13} className={d.colour} />}
              </button>
            );
          })}
        </div>

        <button onClick={handleSaveSettings} className="btn btn-primary px-4 py-2 text-xs">
          Save Domains
        </button>
      </section>

      {/* ── General Preferences ─────────────────────────────────────────── */}
      <section className="card space-y-5 p-6">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
          <Bell size={14} className="text-gold" />
          General Preferences
        </h2>

        <div className="space-y-4">
          <label className="flex cursor-pointer select-none items-start gap-3">
            <input
              type="checkbox"
              checked={dailyReminderEnabled}
              onChange={(e) => setDailyReminderEnabled(e.target.checked)}
              className="mt-1 rounded border-border accent-gold"
            />
            <div>
              <span className="text-sm font-medium text-text-primary">Enable daily reminders</span>
              <p className="mt-0.5 text-xs text-text-secondary">
                Receive accountability emails and logs reminders matching your curriculum track.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer select-none items-start gap-3">
            <input
              type="checkbox"
              checked={briefEmailEnabled}
              onChange={(e) => setBriefEmailEnabled(e.target.checked)}
              className="mt-1 rounded border-border accent-gold"
            />
            <div>
              <span className="text-sm font-medium text-text-primary">
                Send me the 5-min brief by email
              </span>
              <p className="mt-0.5 text-xs text-text-secondary">
                One bite-sized lesson — topic, hook, and reflection — delivered at 7am your local
                time each day.
              </p>
            </div>
          </label>

          <div className="space-y-1.5">
            <label
              htmlFor="timezone"
              className="block text-xs uppercase tracking-[0.18em] text-text-secondary"
            >
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="select max-w-md"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={handleSaveSettings} className="btn btn-primary px-4 py-2 text-xs">
          Save Preferences
        </button>
      </section>
    </div>
  );
}
