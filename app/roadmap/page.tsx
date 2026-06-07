import { Suspense } from 'react';
import { RoadmapView } from './RoadmapView';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { getCourseWindow, getPhaseCalendarRange } from '@/lib/utils';
import { CURRICULUM, type Domain } from '@/data/curriculum-data';

export const metadata = {
  title: 'Roadmap — LEF',
  description: 'The full 111-day curriculum across Law, Economics, and Finance.',
};

export const dynamic = 'force-dynamic';

const VALID_DOMAINS: Domain[] = ['law', 'economics', 'finance'];

export default async function RoadmapPage() {
  let preferredDomains: Domain[] = VALID_DOMAINS;
  let totalDays = 122; // default
  let courseStart: string = '2026-06-01'; // default cohort start

  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data: u } = await sb.auth.getUser();
      if (u.user) {
        const { data: s } = await sb
          .from('user_settings')
          .select('course_start_date, course_duration_months, preferred_domains')
          .eq('user_id', u.user.id)
          .maybeSingle();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings = s as any;
        const cw = getCourseWindow(
          settings?.course_start_date ?? null,
          settings?.course_duration_months ?? null,
        );
        totalDays = cw.totalDays;
        if (settings?.course_start_date) courseStart = settings.course_start_date;
        const raw = settings?.preferred_domains;
        if (Array.isArray(raw)) {
          const filtered = (raw as string[]).filter((d): d is Domain =>
            (VALID_DOMAINS as string[]).includes(d),
          );
          if (filtered.length > 0) preferredDomains = filtered;
        }
      }
    } catch {
      // anonymous fallback — show all
    }
  }

  // Pre-compute phase date ranges server-side so RoadmapView can show user-accurate dates
  const courseStartDate = new Date(courseStart + 'T00:00:00Z');
  const phaseDateRanges: Record<number, string> = {};
  for (const m of CURRICULUM) {
    phaseDateRanges[m.month] = getPhaseCalendarRange(
      m.startDay,
      m.endDay,
      courseStartDate,
      totalDays,
    );
  }

  const domainCount = preferredDomains.length;
  const headingDomains =
    domainCount === 3
      ? '3 domains'
      : `${domainCount} domain${domainCount === 1 ? '' : 's'} in your track`;

  return (
    <div className="mx-auto max-w-content px-5 py-10 md:px-6">
      <header className="mb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.32em] text-text-secondary">
          The Curriculum
        </p>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          {totalDays} days. {headingDomains}. One worldview.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
          Pick a phase. Pick a domain. Every week ends with a synthesis prompt. Review days are
          highlighted in gold italic.
        </p>
      </header>
      <Suspense fallback={<div className="card skeleton h-96 p-8" />}>
        <RoadmapView preferredDomains={preferredDomains} phaseDateRanges={phaseDateRanges} />
      </Suspense>
    </div>
  );
}
