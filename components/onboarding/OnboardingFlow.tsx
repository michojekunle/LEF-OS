'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  Scale,
  TrendingUp,
  Bell,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { completeOnboardingAction } from '@/app/actions/onboarding';
import { useToast } from '@/components/Toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAINS = [
  {
    id: 'law',
    label: 'Law',
    icon: <Scale size={28} />,
    colour: 'text-gold',
    bg: 'bg-gold/10',
    border: 'border-gold/40',
    description: 'Nigerian & global legal systems, contracts, regulation, and jurisprudence.',
  },
  {
    id: 'economics',
    label: 'Economics',
    icon: <TrendingUp size={28} />,
    colour: 'text-sage',
    bg: 'bg-sage/10',
    border: 'border-sage/40',
    description: 'Macro & micro foundations, Nigerian economic policy, and global markets.',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: <BookOpen size={28} />,
    colour: 'text-slate-blue',
    bg: 'bg-slate-blue/10',
    border: 'border-slate-blue/40',
    description: 'Valuation, capital markets, corporate finance, and investment frameworks.',
  },
] as const;

const DURATION_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const TIMEZONES = [
  { value: 'Africa/Lagos', label: 'Lagos (WAT — UTC+1)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST — UTC+4)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT — UTC+8)' },
];

const TOTAL_STEPS = 4; // Welcome doesn't count as a numbered step

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`block rounded-full transition-all duration-300 ${
            i < current
              ? 'h-1.5 w-4 bg-gold'
              : i === current
                ? 'h-1.5 w-6 bg-gold'
                : 'h-1.5 w-1.5 bg-surface-2'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = { userId: string; onDone: () => void };

export function OnboardingFlow({ userId: _userId, onDone }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  // Step 0 = welcome, 1 = domains, 2 = timeline, 3 = notifications, 4 = done
  const [step, setStep] = useState(0);

  // Onboarding state
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
    new Set(['law', 'economics', 'finance']),
  );
  const [courseStartDate, setCourseStartDate] = useState(() => {
    // Default to today
    return new Date().toISOString().slice(0, 10);
  });
  const [courseDurationMonths, setCourseDurationMonths] = useState(4);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
  const [timezone, setTimezone] = useState('Africa/Lagos');

  // Live computed end date
  const courseEnd = useMemo(() => {
    if (!courseStartDate) return null;
    try {
      const d = new Date(courseStartDate + 'T00:00:00Z');
      d.setUTCMonth(d.getUTCMonth() + courseDurationMonths);
      d.setUTCDate(d.getUTCDate() - 1);
      return d;
    } catch {
      return null;
    }
  }, [courseStartDate, courseDurationMonths]);

  const totalDays = useMemo(() => {
    if (!courseEnd || !courseStartDate) return null;
    const start = new Date(courseStartDate + 'T00:00:00Z');
    return Math.round((courseEnd.getTime() - start.getTime()) / 86_400_000) + 1;
  }, [courseEnd, courseStartDate]);

  function toggleDomain(id: string) {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(id) && next.size === 1) return prev; // keep at least one
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function finish() {
    startTransition(async () => {
      const res = await completeOnboardingAction({
        preferredDomains: Array.from(selectedDomains),
        courseStartDate,
        courseDurationMonths,
        dailyReminderEnabled,
        timezone,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      // Refresh server components so CourseProvider gets the new timeline,
      // then tell the shell we're done so it hides the overlay and starts the tour
      router.refresh();
      onDone();
    });
  }

  return (
    // Outer div is the scrollable viewport — on small screens the card can taller
    // than the screen, so we allow vertical scroll within the overlay rather than
    // clipping buttons below the fold.
    <div className="bg-bg/95 fixed inset-0 z-[60] overflow-y-auto backdrop-blur-md">
      <div className="flex min-h-full items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-lg">
          {/* Card — overflow visible so nothing inside gets clipped */}
          <div className="card shadow-2xl">
            {/* Progress bar — thin line at top */}
            {step > 0 && step < TOTAL_STEPS && (
              <div className="h-0.5 w-full bg-surface-2">
                <div
                  className="h-full bg-gold transition-all duration-500"
                  style={{ width: `${((step - 1) / (TOTAL_STEPS - 2)) * 100}%` }}
                />
              </div>
            )}

            <div className="p-8 md:p-10">
              {/* ── Step 0: Welcome ─────────────────────────────────────── */}
              {step === 0 && (
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-gold" />
                    <span className="text-xs uppercase tracking-[0.32em] text-text-secondary">
                      Founder&apos;s Learning OS
                    </span>
                  </div>

                  <div>
                    <h1 className="font-display text-5xl font-bold leading-none tracking-tight text-text-primary md:text-6xl">
                      <span className="text-gold">L</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-sage">E</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-slate-blue">F</span>
                    </h1>
                    <div className="mt-3 flex justify-center gap-4 text-[10px] font-semibold uppercase tracking-[0.3em]">
                      <span className="text-gold">Law</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-sage">Economics</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-slate-blue">Finance</span>
                    </div>
                  </div>

                  <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
                    A daily curriculum for founders who want to understand how power, money, and
                    rules actually work — in Nigeria and across the world.
                  </p>

                  <div className="bg-surface-2/50 w-full space-y-2.5 rounded-xl border border-[var(--border-subtle)] p-4 text-left text-xs text-text-secondary">
                    {[
                      '111 study days across Law, Economics & Finance',
                      'One topic per domain per day — never overwhelming',
                      'Built-in logging, notes, streaks, and AI guidance',
                      'Your timeline, your pace — 4 to 12 months',
                    ].map((line) => (
                      <div key={line} className="flex items-start gap-2">
                        <Check size={12} className="mt-0.5 shrink-0 text-gold" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={next}
                    className="btn btn-primary w-full justify-center gap-2 py-3 text-sm"
                  >
                    Set up my curriculum <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* ── Step 1: Domain focus ─────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <StepDots current={0} total={3} />
                    <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-text-primary">
                      What will you study?
                    </h2>
                    <p className="mt-1.5 text-sm text-text-secondary">
                      Pick one, two, or all three domains. Each one you select will appear in your
                      daily study view. You can change this at any time in Settings.
                    </p>
                  </div>

                  {/* Tip card */}
                  <div className="bg-surface-2/40 rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-xs text-text-secondary">
                    <span className="font-semibold text-gold">Tip — </span>
                    Most people start with all three. The domains reinforce each other: Law shapes
                    the rules, Economics explains the incentives, Finance shows the numbers.
                    Together they give you a complete founder&apos;s worldview.
                  </div>

                  <div className="space-y-2.5">
                    {DOMAINS.map((d) => {
                      const active = selectedDomains.has(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDomain(d.id)}
                          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-150 ${
                            active
                              ? `${d.bg} ${d.border}`
                              : 'border-[var(--border-subtle)] bg-surface hover:border-[var(--border)]'
                          }`}
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${active ? d.bg : 'bg-surface-2'} ${active ? d.colour : 'text-text-muted'} transition-colors`}
                          >
                            {d.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-sm font-semibold ${active ? d.colour : 'text-text-primary'}`}
                              >
                                {d.label}
                              </span>
                              {active && (
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${d.bg} ${d.colour}`}
                                >
                                  <Check size={11} />
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-text-secondary">{d.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-text-muted">
                    {selectedDomains.size === 1
                      ? 'At least one domain required.'
                      : `${selectedDomains.size} of 3 selected.`}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button onClick={back} className="btn btn-secondary gap-1.5 text-xs">
                      <ArrowLeft size={13} /> Back
                    </button>
                    <button onClick={next} className="btn btn-primary gap-1.5 text-sm">
                      Continue <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Timeline ─────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <StepDots current={1} total={3} />
                    <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-text-primary">
                      When do you start?
                    </h2>
                    <p className="mt-1.5 text-sm text-text-secondary">
                      Choose your start date and how long you want the curriculum to run.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Start date */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="ob-start"
                        className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-text-secondary"
                      >
                        <CalendarDays size={12} /> Start date
                      </label>
                      <input
                        id="ob-start"
                        type="date"
                        value={courseStartDate}
                        onChange={(e) => setCourseStartDate(e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                        Duration
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {DURATION_OPTIONS.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setCourseDurationMonths(m)}
                            className={`rounded-lg border py-2.5 text-sm font-medium transition-all ${
                              courseDurationMonths === m
                                ? 'border-gold/50 bg-gold/10 text-gold'
                                : 'border-[var(--border-subtle)] text-text-secondary hover:border-[var(--border)] hover:text-text-primary'
                            }`}
                          >
                            {m}mo
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tip */}
                    <div className="bg-surface-2/40 rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-xs text-text-secondary">
                      <span className="font-semibold text-gold">What does duration mean? — </span>
                      The duration sets how long your course window runs. The 111 curriculum topics
                      spread evenly across your chosen duration — so 4 months means one topic per
                      day, 8 months means one new topic every ~2 days. Extra time at the end is your
                      buffer for review and reflection.
                    </div>

                    {/* Live summary */}
                    {courseEnd && totalDays && (
                      <div className="bg-surface-2/50 rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-xs text-text-secondary">
                        <div className="flex items-baseline justify-between">
                          <span className="font-medium text-text-primary">
                            {totalDays} calendar days
                          </span>
                          <span className="text-text-muted">
                            ~{Math.round((totalDays / 111) * 10) / 10} days per topic
                          </span>
                        </div>
                        <p className="mt-1">
                          {new Date(courseStartDate + 'T00:00:00Z').toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {' → '}
                          {courseEnd.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button onClick={back} className="btn btn-secondary gap-1.5 text-xs">
                      <ArrowLeft size={13} /> Back
                    </button>
                    <button onClick={next} className="btn btn-primary gap-1.5 text-sm">
                      Continue <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Notifications ────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <StepDots current={2} total={3} />
                    <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-text-primary">
                      Stay on track.
                    </h2>
                    <p className="mt-1.5 text-sm text-text-secondary">
                      The single biggest predictor of finishing is showing up daily. Reminders exist
                      to protect your streak — not to pressure you.
                    </p>
                  </div>

                  <div className="bg-surface-2/40 rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-xs text-text-secondary">
                    <span className="font-semibold text-gold">What are reminders? — </span>
                    LEF OS sends you a daily nudge by email and/or in-app notification at the times
                    you configure in Settings. It also watches for streak risk — if it&apos;s late
                    in the day and you haven&apos;t logged yet, it reminds you before midnight.
                  </div>

                  <div className="space-y-4">
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => setDailyReminderEnabled((v) => !v)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        dailyReminderEnabled
                          ? 'border-gold/40 bg-gold/5'
                          : 'border-[var(--border-subtle)] bg-surface hover:border-[var(--border)]'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          dailyReminderEnabled
                            ? 'bg-gold/15 text-gold'
                            : 'bg-surface-2 text-text-muted'
                        }`}
                      >
                        <Bell size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">Daily reminders</p>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          Email + in-app nudges at your scheduled times.
                        </p>
                      </div>
                      <div
                        className={`h-5 w-9 shrink-0 rounded-full transition-colors ${
                          dailyReminderEnabled ? 'bg-gold' : 'bg-surface-2'
                        } relative`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            dailyReminderEnabled ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Timezone */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="ob-tz"
                        className="text-xs uppercase tracking-[0.18em] text-text-secondary"
                      >
                        Your timezone{' '}
                        <span className="normal-case tracking-normal text-text-muted">
                          — used to schedule reminders at the right local time
                        </span>
                      </label>
                      <select
                        id="ob-tz"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="select w-full"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button onClick={back} className="btn btn-secondary gap-1.5 text-xs">
                      <ArrowLeft size={13} /> Back
                    </button>
                    <button onClick={next} className="btn btn-primary gap-1.5 text-sm">
                      Continue <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 4: Done ─────────────────────────────────────── */}
              {step === 4 && (
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="bg-gold/15 flex h-16 w-16 items-center justify-center rounded-full">
                    <Check size={32} className="text-gold" />
                  </div>

                  <div>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary">
                      You&apos;re ready.
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      Here&apos;s your setup summary.
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="bg-surface-2/50 w-full space-y-2 rounded-xl border border-[var(--border-subtle)] p-4 text-left">
                    <SummaryRow label="Domains">
                      {Array.from(selectedDomains)
                        .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
                        .join(' · ')}
                    </SummaryRow>
                    <SummaryRow label="Starts">
                      {new Date(courseStartDate + 'T00:00:00Z').toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </SummaryRow>
                    <SummaryRow label="Duration">
                      {courseDurationMonths} month{courseDurationMonths > 1 ? 's' : ''}{' '}
                      {totalDays ? `· ${totalDays} days` : ''}
                    </SummaryRow>
                    <SummaryRow label="Reminders">
                      {dailyReminderEnabled ? `On · ${timezone}` : 'Off'}
                    </SummaryRow>
                  </div>

                  <p className="text-xs text-text-muted">
                    A guided tour of the app will start after this.
                  </p>

                  <button
                    onClick={finish}
                    disabled={pending}
                    className="btn btn-primary w-full justify-center gap-2 py-3 text-sm"
                  >
                    {pending ? (
                      <>
                        <span className="border-bg/30 h-4 w-4 animate-spin rounded-full border-2 border-t-bg" />
                        Saving…
                      </>
                    ) : (
                      <>
                        Open LEF OS <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Skip hint — only on steps 1-3 */}
          {step > 0 && step < 4 && (
            <p className="mt-4 text-center text-xs text-text-muted">
              You can change all of this later in{' '}
              <button
                className="underline underline-offset-2 hover:text-text-primary"
                onClick={finish}
              >
                Settings
              </button>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="shrink-0 uppercase tracking-[0.18em] text-text-muted">{label}</span>
      <span className="text-right text-text-primary">{children}</span>
    </div>
  );
}
