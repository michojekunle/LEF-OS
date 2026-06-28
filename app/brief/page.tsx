/**
 * /brief — the public 5-minute daily lesson.
 *
 * Anonymous-readable. Resolves "today" per-user (their course window if
 * authenticated, default cohort window otherwise), loads enriched content,
 * and hands off to <BriefDeck/> for the card UI.
 *
 * This is the cheapest path into the curriculum — no signup, no commitment,
 * ~5 minutes total reading time across the three domain cards.
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  clampDay,
  getDayNumber,
  isBeforeCourse,
  isAfterCourse,
  getCourseWindow,
  toCurriculumDay,
} from '@/lib/utils';
import { findDayMeta, type Domain } from '@/data/curriculum-data';
import { loadEnrichedForDay } from '@/lib/enriched-content-server';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { BriefDeck } from '@/components/brief/BriefDeck';

export const metadata: Metadata = {
  title: "Today's Lesson — 5 Minutes — LEF",
  description:
    'A bite-sized daily lesson on Law, Economics, and Finance. No signup required.',
};

export const dynamic = 'force-dynamic';

const VALID_DOMAINS: Domain[] = ['law', 'economics', 'finance'];

export default async function BriefPage() {
  // ── Resolve user course window + preferred domains ────────────────────────
  let startDate: string | null = null;
  let durationMonths: number | null = null;
  let preferredDomains: Domain[] = VALID_DOMAINS;
  let isAuthed = false;
  let username: string | null = null;

  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data: u } = await sb.auth.getUser();
      if (u.user) {
        isAuthed = true;
        const [{ data: settings }, { data: profile }] = await Promise.all([
          sb
            .from('user_settings')
            .select('course_start_date, course_duration_months, preferred_domains')
            .eq('user_id', u.user.id)
            .maybeSingle(),
          sb.from('profiles').select('username').eq('id', u.user.id).maybeSingle(),
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = settings as any;
        startDate = s?.course_start_date ?? null;
        durationMonths = s?.course_duration_months ?? null;
        if (Array.isArray(s?.preferred_domains)) {
          const filtered = (s.preferred_domains as string[]).filter(
            (d): d is Domain => (VALID_DOMAINS as string[]).includes(d),
          );
          if (filtered.length > 0) preferredDomains = filtered;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        username = (profile as any)?.username ?? null;
      }
    } catch {
      // anonymous fall-through is fine
    }
  }

  const window = getCourseWindow(startDate, durationMonths);
  const today = new Date();
  const before = isBeforeCourse(today, window);
  const after = isAfterCourse(today, window);
  const calendarDay = clampDay(getDayNumber(today, window));
  const curriculumDay = toCurriculumDay(calendarDay, window.totalDays);

  // Resolve topics + enriched content for the day
  const enriched = loadEnrichedForDay(curriculumDay);
  const topics: Record<Domain, string | null> = {
    law: findDayMeta('law', curriculumDay)?.topic ?? null,
    economics: findDayMeta('economics', curriculumDay)?.topic ?? null,
    finance: findDayMeta('finance', curriculumDay)?.topic ?? null,
  };

  return (
    <div className="mx-auto max-w-content px-5 py-10 md:px-6">
      <header className="mb-6 space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-text-secondary">
          Today&apos;s 5-minute brief
        </p>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Day {curriculumDay}{' '}
          <span className="text-lg text-text-muted">of {window.totalDays}</span>
        </h1>
        <p className="max-w-xl text-sm text-text-secondary">
          {before
            ? `Your course starts ${window.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Here's a preview of Day 1.`
            : after
              ? 'Your course window has closed — but the archive is still open. Browse any day on the roadmap.'
              : 'Swipe or scroll through the three cards. No signup required to read.'}
        </p>
      </header>

      <BriefDeck
        day={curriculumDay}
        topics={topics}
        enriched={enriched}
        preferredDomains={preferredDomains}
        isAuthed={isAuthed}
        username={username}
      />

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-6 text-xs text-text-secondary">
        <Link
          href={`/day/${curriculumDay}`}
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-gold"
        >
          Full lesson (deep dive) →
        </Link>
        <Link href="/roadmap" className="text-text-muted hover:text-text-primary">
          Browse all 111 days
        </Link>
      </div>
    </div>
  );
}
