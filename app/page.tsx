import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CURRICULUM, DOMAIN_META, type Domain } from '@/data/curriculum-data';
import { DOMAIN_ACCENT_TEXT } from '@/lib/domain';
import { ProgressBar } from '@/components/ProgressBar';
import {
  getDayNumber,
  isBeforeCourse,
  isAfterCourse,
  getCourseWindow,
  toCurriculumDay,
  getPhaseCalendarRange,
  TOTAL_CURRICULUM_DAYS,
  type CourseWindow,
} from '@/lib/utils';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Validate raw DB domain strings → known Domain values
const VALID_DOMAINS: Domain[] = ['law', 'economics', 'finance'];
function validateDomains(raw: unknown): Domain[] {
  if (!Array.isArray(raw)) return VALID_DOMAINS;
  const filtered = (raw as string[]).filter((d): d is Domain =>
    (VALID_DOMAINS as string[]).includes(d),
  );
  return filtered.length > 0 ? filtered : VALID_DOMAINS;
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function LandingPage() {
  // ── Fetch authenticated user's settings ──────────────────────────────────
  let courseWindow: CourseWindow = getCourseWindow(); // default 4-month cohort
  let preferredDomains: Domain[] = VALID_DOMAINS;
  let isAuthed = false;
  let durationMonths = 4;

  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data: u } = await sb.auth.getUser();
      if (u.user) {
        isAuthed = true;
        const { data: s } = await sb
          .from('user_settings')
          .select('course_start_date, course_duration_months, preferred_domains')
          .eq('user_id', u.user.id)
          .maybeSingle();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings = s as any;
        durationMonths = settings?.course_duration_months ?? 4;
        courseWindow = getCourseWindow(
          settings?.course_start_date ?? null,
          settings?.course_duration_months ?? null,
        );
        preferredDomains = validateDomains(settings?.preferred_domains);
      }
    } catch {
      // anonymous fallback
    }
  }

  const today = new Date();
  const before = isBeforeCourse(today, courseWindow);
  const after = isAfterCourse(today, courseWindow);
  const calendarDay = getDayNumber(today, courseWindow);
  const curriculumDay = toCurriculumDay(Math.max(1, calendarDay), courseWindow.totalDays);
  const dayShown = before ? 0 : after ? TOTAL_CURRICULUM_DAYS : curriculumDay;

  // ── Hero copy ─────────────────────────────────────────────────────────────
  const metaLine = isAuthed
    ? `${formatDateShort(courseWindow.start)} – ${formatDateShort(courseWindow.end)} · ${courseWindow.totalDays} days · ${preferredDomains.length} domain${preferredDomains.length === 1 ? '' : 's'}`
    : 'Default: 4 months · 111 study days · your pace, your domains';

  const subheadLine = isAuthed
    ? `Your ${durationMonths}-month curriculum in Nigerian and global ${preferredDomains.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}. One topic per day, in public.`
    : "A flexible founder's curriculum in Nigerian and global Law, Economics & Finance. 4 months by default — you choose your pace and your domains.";

  const progressLabel = before
    ? `Starts ${formatDateShort(courseWindow.start)}`
    : after
      ? 'Course complete'
      : `Day ${dayShown} of ${courseWindow.totalDays}`;

  return (
    <div className="mx-auto max-w-content px-5 md:px-6">
      {/* HERO */}
      <section className="pb-12 pt-12 md:pb-16 md:pt-20">
        <div className="reveal mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-text-secondary">
          <Sparkles size={12} className="text-gold" />
          <span>Founder&apos;s Learning OS</span>
        </div>
        <h1 className="reveal font-display text-[clamp(2.8rem,10vw,5rem)] leading-[0.95] tracking-tight text-text-primary">
          Law
          <span className="text-text-muted"> · </span>
          <span className="accent-econ">Economics</span>
          <span className="text-text-muted"> · </span>
          <span className="accent-finance">Finance</span>
        </h1>
        <p className="reveal mt-6 max-w-xl text-base text-text-secondary md:text-lg">
          {subheadLine}
        </p>
        <p className="mt-3 font-mono text-xs tracking-wider text-text-muted">{metaLine}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/roadmap" className="btn btn-primary" data-tour="explore-cta">
            Explore the Curriculum <ArrowRight size={14} />
          </Link>
          {!isAuthed && (
            <Link href="/login" className="btn btn-secondary">
              Track My Journey
            </Link>
          )}
          {isAuthed && (
            <Link href="/dashboard" className="btn btn-secondary">
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* PROGRESS */}
        <div className="mt-12 max-w-md" data-tour="hero-progress-bar">
          <ProgressBar value={dayShown} max={courseWindow.totalDays} label={progressLabel} />
        </div>

        {/* Personalisation hint for unauthenticated users */}
        {!isAuthed && (
          <p className="mt-4 text-xs text-text-muted">
            <Link href="/login" className="text-gold hover:underline">
              Sign in
            </Link>{' '}
            to set your own start date, duration (4–12 months), and which domains you want to study.
          </p>
        )}
      </section>

      <div className="divider" />

      {/* DOMAINS */}
      <section className="py-12 md:py-16">
        <h2 className="mb-2 font-display text-2xl md:text-3xl">
          {preferredDomains.length === 3
            ? 'Three domains.'
            : preferredDomains.length === 2
              ? 'Two domains.'
              : 'One domain.'}{' '}
          {durationMonths === 4 ? 'Four months.' : `${durationMonths} months.`}
        </h2>
        <p className="mb-8 max-w-xl text-sm text-text-secondary">
          Each phase deepens the last. Each domain reinforces the others. By the final phase, the
          three stop being separate and start being a single way of thinking.
        </p>
        <div className="grid gap-4 md:grid-cols-3" data-tour="domain-cards-row">
          {VALID_DOMAINS.map((d) => {
            const meta = DOMAIN_META[d];
            const accent = DOMAIN_ACCENT_TEXT[d];
            const isInTrack = preferredDomains.includes(d);
            return (
              <Link
                key={d}
                href={`/roadmap?domain=${d}`}
                className={`card hover:bg-surface-2/40 group flex min-h-[200px] flex-col gap-4 p-6 transition-colors hover:border-[var(--border)] ${
                  isAuthed && !isInTrack ? 'opacity-40 grayscale' : ''
                }`}
                data-tour-action="domain-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{meta.icon}</span>
                  <div className="flex items-center gap-2">
                    {isAuthed && isInTrack && (
                      <span className="bg-gold/15 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold">
                        Your track
                      </span>
                    )}
                    <span className={`text-base font-semibold ${accent}`}>{meta.label}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">{meta.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className={`text-sm font-bold ${accent}`}>See all 111 topics</span>
                  <ArrowRight
                    size={14}
                    className="text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {isAuthed && preferredDomains.length < 3 && (
          <p className="mt-4 text-xs text-text-muted">
            Dimmed domains are not in your current track. You can{' '}
            <Link href="/settings" className="text-gold hover:underline">
              update your domains in Settings
            </Link>
            .
          </p>
        )}
      </section>

      <div className="divider" />

      {/* MONTHS PREVIEW */}
      <section className="py-12 md:py-16">
        <h2 className="mb-8 font-display text-2xl md:text-3xl">
          {durationMonths === 4
            ? 'Four months, four shifts.'
            : `${durationMonths} months, four phases.`}
        </h2>
        <ol className="space-y-3">
          {CURRICULUM.map((m) => {
            const phaseRange = getPhaseCalendarRange(
              m.startDay,
              m.endDay,
              courseWindow.start,
              courseWindow.totalDays,
            );
            return (
              <li key={m.month}>
                <Link
                  href={`/roadmap?month=${m.month}`}
                  className="card hover:bg-surface-2/40 group flex items-center gap-4 p-5 transition-colors hover:border-[var(--border)]"
                >
                  <span className="w-20 shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
                    Phase {m.month}
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-semibold leading-snug text-text-primary">
                      {m.name}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">{phaseRange}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      Topics {m.startDay}–{m.endDay}
                    </span>
                    <ArrowRight
                      size={13}
                      className="text-text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-gold group-hover:opacity-100"
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="divider" />

      {/* ABOUT */}
      <section className="py-12 md:py-16">
        <h2 className="mb-4 font-display text-2xl md:text-3xl">About this project</h2>
        <div className="max-w-2xl space-y-4 leading-relaxed text-text-secondary">
          <p>
            This is a personal operating system for a founder's deep dive across three fields that
            decide how power, money, and rules actually work in Nigeria, Africa, and the world.
          </p>
          <p>
            It&apos;s built around one belief:{' '}
            <em className="not-italic text-text-primary">
              if it&apos;s worth learning, it&apos;s worth learning in public.
            </em>{' '}
            Every day a topic. Every day a log. Every week a synthesis. Every shipped insight
            returns to the community that made the learning possible.
          </p>
          <p className="text-sm text-text-muted">
            The curriculum is opinionated — it leans into Nigerian context first, then global
            frameworks, then back to Nigerian application. It assumes the reader is building
            something real.
          </p>
        </div>

        <div className="mt-10 grid gap-3 text-center sm:grid-cols-3">
          <div className="card-2 p-6">
            <p className="text-3xl font-bold text-gold">111</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-secondary">
              topics per domain
            </p>
          </div>
          <div className="card-2 p-6">
            <p className="text-3xl font-bold text-gold">{isAuthed ? preferredDomains.length : 3}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-secondary">
              {isAuthed && preferredDomains.length < 3
                ? 'selected domain' + (preferredDomains.length > 1 ? 's' : '')
                : 'domains'}
            </p>
          </div>
          <div className="card-2 p-6">
            <p className="text-3xl font-bold text-gold">{courseWindow.totalDays}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-secondary">
              calendar days
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
