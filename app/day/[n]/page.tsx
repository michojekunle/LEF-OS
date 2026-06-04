import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import {
  TOTAL_CALENDAR_DAYS,
  findDayMeta,
  getMonthByCurriculumDay,
  RESOURCE_URLS,
  type Domain,
} from '@/data/curriculum-data';
import { DomainBadge } from '@/components/DomainBadge';
import { dateFromDayNumber, formatDate, isThursday } from '@/lib/utils';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import type { DailyEntry, DayNote, Question } from '@/lib/database.types';
import { DayLogPanel } from './DayLogPanel';
import { LEFCounselPanel } from '@/components/LEFCounselPanel';
import { EnrichedContentPanel } from '@/components/EnrichedContentPanel';
import { CommunityResources } from '@/components/CommunityResources';
import { ResourceSubmitForm } from '@/components/ResourceSubmitForm';
import type { ResourceSubmission } from '@/lib/database.types';
import fs from 'fs';
import path from 'path';

type Params = { n: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { n } = await params;
  const day = Number(n);
  if (!Number.isFinite(day) || day < 1 || day > TOTAL_CALENDAR_DAYS) {
    return { title: 'Day — LEF' };
  }
  const meta =
    findDayMeta('law', day) ?? findDayMeta('economics', day) ?? findDayMeta('finance', day);
  const subj = meta?.topic ? ` · ${meta.topic.slice(0, 60)}` : '';
  return { title: `Day ${day}${subj} — LEF` };
}

export const dynamic = 'force-dynamic';

export default async function DayDetailPage({ params }: { params: Promise<Params> }) {
  const { n } = await params;
  const day = Number(n);
  if (!Number.isFinite(day) || day < 1 || day > TOTAL_CALENDAR_DAYS) notFound();

  const date = dateFromDayNumber(day);
  const month = getMonthByCurriculumDay(day);
  const domains: Domain[] = ['law', 'economics', 'finance'];
  const metas = Object.fromEntries(domains.map((d) => [d, findDayMeta(d, day)])) as Record<
    Domain,
    ReturnType<typeof findDayMeta>
  >;

  let enrichedData = { law: null, economics: null, finance: null };
  try {
    const p = path.join(process.cwd(), 'data', 'enriched-content.json');
    if (fs.existsSync(p)) {
      const allData = JSON.parse(fs.readFileSync(p, 'utf-8'));
      enrichedData = {
        law: allData[`day_${day}_law`] || null,
        economics: allData[`day_${day}_economics`] || null,
        finance: allData[`day_${day}_finance`] || null,
      };
    }
  } catch {
    // ignore
  }

  let userId: string | null = null;
  let existing: DailyEntry | null = null;
  let notes: DayNote[] = [];
  let questions: Question[] = [];
  let communityResources: ResourceSubmission[] = [];
  let savedAnswers: Record<string, string> = {};

  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data: u } = await sb.auth.getUser();

      // Community resources visible to everyone (anon-safe via RLS)
      const { data: cr } = await sb
        .from('resource_submissions')
        .select('*')
        .eq('day_number', day)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });
      communityResources = (cr as ResourceSubmission[]) ?? [];

      if (u.user) {
        userId = u.user.id;
        const iso = date.toISOString().slice(0, 10);
        const [{ data: e }, { data: n }, { data: q }, { data: qa }] = await Promise.all([
          sb
            .from('daily_entries')
            .select('*')
            .eq('user_id', u.user.id)
            .eq('entry_date', iso)
            .maybeSingle(),
          sb.from('day_notes').select('*').eq('user_id', u.user.id).eq('day_number', day),
          sb
            .from('questions')
            .select('*')
            .eq('user_id', u.user.id)
            .eq('day_number', day)
            .order('created_at', { ascending: false }),
          sb
            .from('question_answers')
            .select('domain, question_index, answer')
            .eq('user_id', u.user.id)
            .eq('day_number', day),
        ]);
        existing = (e as DailyEntry) ?? null;
        notes = (n as DayNote[]) ?? [];
        questions = (q as Question[]) ?? [];
        // Build lookup map: `${domain}_${index}` → answer
        savedAnswers = Object.fromEntries(
          ((qa ?? []) as { domain: string; question_index: number; answer: string }[]).map(
            (row) => [`${row.domain}_${row.question_index}`, row.answer],
          ),
        );
      }
    } catch {
      // anonymous view still works
    }
  }

  const prev = day > 1 ? day - 1 : null;
  const next = day < TOTAL_CALENDAR_DAYS ? day + 1 : null;
  const isThu = isThursday(date);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CourseInstance',
    name: `Day ${day} Curriculum Study Log`,
    description: `Study details for Day ${day} curriculum covering: Law (${
      metas.law?.topic || 'Review'
    }), Economics (${metas.economics?.topic || 'Review'}), Finance (${metas.finance?.topic || 'Review'}).`,
    courseMode: 'Online/Self-paced',
    instructor: {
      '@type': 'Organization',
      name: 'LEF OS',
    },
  };

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-8 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-3">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={11} /> Roadmap
        </Link>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          Day {day} <span className="text-lg text-text-muted">of {TOTAL_CALENDAR_DAYS}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={12} className="text-text-muted" />
            {formatDate(date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          {month && (
            <span>
              · Month {month.month} — {month.theme}
            </span>
          )}
          {isThu && (
            <span className="accent-law border-accent-law bg-accent-law rounded-md border px-2 py-0.5">
              Thursday · weekly video review
            </span>
          )}
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        {domains.map((d) => {
          const m = metas[d];
          return (
            <div key={d} className="card flex min-h-[160px] flex-col gap-3 p-5">
              <DomainBadge domain={d} />
              {m ? (
                <p
                  className={`text-base font-medium leading-snug ${
                    m.isReview ? 'review-day' : 'text-text-primary'
                  }`}
                >
                  {m.topic}
                </p>
              ) : (
                <p className="text-sm italic text-text-secondary">
                  Buffer day · use today to review and ship.
                </p>
              )}
              {m && (
                <p className="mt-auto text-xs uppercase tracking-[0.18em] text-text-muted">
                  {m.weekTitle}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* ENRICHED CONTENT (Study Targets & Review) */}
      <EnrichedContentPanel
        day={day}
        data={enrichedData}
        userId={userId ?? undefined}
        savedAnswers={savedAnswers}
      />

      {/* RECOMMENDED RESOURCES */}
      {month && (
        <section className="card space-y-4 p-6">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Recommended Reading & Resources
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Reference materials and primary literature for Month {month.month} ({month.name})
              study tracks.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {domains.map((d) => {
              const track = month.tracks[d];
              const resList = track?.resources || [];
              if (resList.length === 0) return null;

              return (
                <div key={d} className="space-y-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {d === 'law' ? '⚖️ Law' : d === 'economics' ? '📊 Economics' : '💰 Finance'}{' '}
                    Resources
                  </span>
                  <ul className="space-y-1.5">
                    {resList.map((res) => {
                      const url = RESOURCE_URLS[res];
                      return (
                        <li key={res} className="text-xs">
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-gold/80 inline-flex items-center gap-1 leading-normal text-gold transition-colors hover:underline"
                            >
                              {res}
                              <span className="text-xs opacity-75">↗</span>
                            </a>
                          ) : (
                            <span className="text-text-secondary">{res}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Community-submitted resources */}
      <CommunityResources resources={communityResources} userId={userId ?? undefined} />

      {/* Submit a resource */}
      {hasSupabaseConfig() && (
        <section className="flex items-center justify-between rounded-lg border border-dashed border-[var(--border-subtle)] px-5 py-4">
          <p className="text-xs text-text-secondary">
            Know a better resource for today's topics?
          </p>
          <ResourceSubmitForm day={day} userId={userId ?? undefined} />
        </section>
      )}

      {userId ? (
        <DayLogPanel
          userId={userId}
          day={day}
          date={date}
          existing={existing}
          initialNotes={notes}
          initialQuestions={questions}
        />
      ) : (
        <SignInPrompt day={day} />
      )}

      <LEFCounselPanel
        day={day}
        userId={userId || undefined}
        topics={{
          law: metas.law?.topic,
          economics: metas.economics?.topic,
          finance: metas.finance?.topic,
        }}
      />

      <nav className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-6">
        {prev ? (
          <Link
            href={`/day/${prev}`}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft size={14} /> Day {prev}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/day/${next}`}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
          >
            Day {next} <ArrowRight size={14} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

function SignInPrompt({ day }: { day: number }) {
  return (
    <section className="card space-y-3 p-6 text-center">
      <p className="text-sm text-text-secondary">
        Sign in to log Day {day}, save private notes, and capture questions.
      </p>
      <Link href={`/login?next=/day/${day}`} className="btn btn-primary inline-flex">
        Sign in
      </Link>
    </section>
  );
}
