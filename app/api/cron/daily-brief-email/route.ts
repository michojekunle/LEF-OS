/**
 * /api/cron/daily-brief-email
 *
 * Triggered hourly by GitHub Actions (separate job from the reminder cron).
 * For each user with `daily_brief_email_enabled = true`, when the local hour
 * matches their preferred brief hour (default 07:00 in their timezone), sends
 * the 5-minute brief as an email containing one card per preferred domain.
 *
 * Per-user-aware: each user gets their own course window, their own
 * curriculum day, their own preferred domains. See `daily-reminder/route.ts`
 * for the same pattern applied to reminders.
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  clampDay,
  getDayNumber,
  getCourseWindow,
  toCurriculumDay,
  isInCourse,
  type CourseWindow,
} from '@/lib/utils';
import { findDayMeta, type Domain } from '@/data/curriculum-data';
import { hookFromEnriched } from '@/lib/enriched-content';
import { loadEnrichedForDay } from '@/lib/enriched-content-server';
import { readingTime, totalReadingTime } from '@/lib/reading-time';
import { buildBriefEmailHtml, sendEmail as dispatchEmail, type BriefDomainCard } from '@/lib/email';
import { calculateLocalHour } from '@/lib/reminders';
import { getSiteUrl } from '@/lib/env';

const VALID_DOMAINS: Domain[] = ['law', 'economics', 'finance'];

const DOMAIN_META: Record<Domain, { icon: string; label: string; colour: string }> = {
  law: { icon: '⚖️', label: 'Law', colour: '#c9ab70' },
  economics: { icon: '📊', label: 'Economics', colour: '#80a394' },
  finance: { icon: '💰', label: 'Finance', colour: '#8fa3d0' },
};

/** Default hour to send the brief if the user hasn't customised it. */
const DEFAULT_BRIEF_HOUR = 7;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[brief-cron] CRON_SECRET is not set — request blocked.');
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
  }
  const authHeader = request.headers.get('Authorization') ?? '';
  const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
  }

  const todayDate = new Date();
  const sb = supabaseAdmin();

  // Pull all users opted-in for the brief.
  // `daily_brief_email_enabled` was added in migration 0015 — generated types
  // aren't regenerated yet, so we cast via `as any` for the eq filter.
  const { data: settingsList, error: settingsError } = await sb
    .from('user_settings')
    .select(
      'user_id, email, timezone, daily_brief_email_enabled, course_start_date, course_duration_months, preferred_domains',
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq('daily_brief_email_enabled' as any, true);

  if (settingsError) {
    return NextResponse.json({ ok: false, error: settingsError.message }, { status: 500 });
  }
  if (!settingsList || settingsList.length === 0) {
    return NextResponse.json({ ok: true, message: 'No users opted into brief.' });
  }

  const results: Array<{ email: string; sent: boolean; reason?: string }> = [];

  for (const setting of settingsList) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = setting as any;
    const email = s.email as string;
    const timezone = (s.timezone as string) || 'Africa/Lagos';

    // Only send at the user's local 07:00 (one shot per day)
    const localHour = calculateLocalHour(todayDate, timezone);
    if (localHour !== DEFAULT_BRIEF_HOUR) {
      continue;
    }

    // Per-user course window
    const userCourseWindow: CourseWindow = getCourseWindow(
      s.course_start_date ?? null,
      s.course_duration_months ?? null,
    );
    if (!isInCourse(todayDate, userCourseWindow)) {
      results.push({ email, sent: false, reason: 'outside course window' });
      continue;
    }

    const calendarDay = clampDay(getDayNumber(todayDate, userCourseWindow));
    const curriculumDay = toCurriculumDay(calendarDay, userCourseWindow.totalDays);

    // Per-user preferred domains
    const rawDomains = s.preferred_domains;
    const userPreferredDomains: Domain[] = Array.isArray(rawDomains)
      ? (rawDomains as string[]).filter((d): d is Domain =>
          (VALID_DOMAINS as string[]).includes(d),
        )
      : VALID_DOMAINS;
    const effectiveDomains: Domain[] =
      userPreferredDomains.length > 0 ? userPreferredDomains : VALID_DOMAINS;

    // Load enriched content for the day
    const enriched = loadEnrichedForDay(curriculumDay);

    // Build cards (one per preferred domain)
    const cards: BriefDomainCard[] = effectiveDomains.map((d) => {
      const meta = DOMAIN_META[d];
      const topic = findDayMeta(d, curriculumDay)?.topic ?? null;
      const entry = enriched[d];
      const hook = hookFromEnriched(entry);
      const cardReadingTime = totalReadingTime([topic, hook, entry?.objectives?.[0] ?? null]);
      return {
        domain: d,
        icon: meta.icon,
        label: meta.label,
        colour: meta.colour,
        topic,
        hook,
        readingTimeLabel: cardReadingTime.label,
      };
    });

    // Find a reflection question across preferred domains
    const reflectionQuestion =
      effectiveDomains
        .map((d) => enriched[d]?.questions?.[0])
        .find((q): q is string => Boolean(q)) ?? null;

    const siteUrl = getSiteUrl(new URL(request.url).origin);
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?userId=${s.user_id}`;
    const html = buildBriefEmailHtml({
      greeting: `Good morning — Day ${curriculumDay} is ready.`,
      day: curriculumDay,
      totalDays: userCourseWindow.totalDays,
      cards,
      reflectionQuestion,
      siteUrl,
      unsubscribeUrl,
    });

    const sent = await dispatchEmail({
      to: email,
      subject: `LEF · Day ${curriculumDay} — Today's 5-minute brief`,
      html,
      from: 'LEF Brief <onboarding@resend.dev>',
    });

    results.push({ email, sent });
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}

// Suppress unused-import warnings for util imports kept for tree clarity
void readingTime;
