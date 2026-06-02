import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import {
  TOTAL_CALENDAR_DAYS,
  findDayMeta,
  getMonthByCurriculumDay,
  RESOURCE_URLS,
  type Domain,
} from '@/components/curriculum-data';
import { DomainBadge } from '@/components/DomainBadge';
import { dateFromDayNumber, formatDate, isThursday } from '@/lib/utils';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import type { DailyEntry, DayNote, Question } from '@/lib/database.types';
import { DayLogPanel } from './DayLogPanel';
import { LEFCounselPanel } from '@/components/LEFCounselPanel';

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

  let userId: string | null = null;
  let existing: DailyEntry | null = null;
  let notes: DayNote[] = [];
  let questions: Question[] = [];

  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data: u } = await sb.auth.getUser();
      if (u.user) {
        userId = u.user.id;
        const iso = date.toISOString().slice(0, 10);
        const [{ data: e }, { data: n }, { data: q }] = await Promise.all([
          sb
            .from('daily_entries')
            .select('*')
            .eq('user_id', u.user.id)
            .eq('entry_date', iso)
            .maybeSingle(),
          sb
            .from('day_notes')
            .select('*')
            .eq('user_id', u.user.id)
            .eq('day_number', day),
          sb
            .from('questions')
            .select('*')
            .eq('user_id', u.user.id)
            .eq('day_number', day)
            .order('created_at', { ascending: false }),
        ]);
        existing = (e as DailyEntry) ?? null;
        notes = (n as DayNote[]) ?? [];
        questions = (q as Question[]) ?? [];
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
    'name': `Day ${day} Curriculum Study Log`,
    'description': `Study details for Day ${day} curriculum covering: Law (${
      metas.law?.topic || 'Review'
    }), Economics (${metas.economics?.topic || 'Review'}), Finance (${metas.finance?.topic || 'Review'}).`,
    'courseMode': 'Online/Self-paced',
    'instructor': {
      '@type': 'Organization',
      'name': 'LEF OS'
    }
  };

  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-3">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={11} /> Roadmap
        </Link>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">
          Day {day}{' '}
          <span className="text-text-muted text-lg">of {TOTAL_CALENDAR_DAYS}</span>
        </h1>
        <div className="flex items-center gap-3 flex-wrap text-xs text-text-secondary">
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
            <span className="accent-law border border-accent-law bg-accent-law rounded-md px-2 py-0.5">
              Thursday · weekly video review
            </span>
          )}
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        {domains.map((d) => {
          const m = metas[d];
          return (
            <div key={d} className="card p-5 flex flex-col gap-3 min-h-[160px]">
              <DomainBadge domain={d} />
              {m ? (
                <p
                  className={`font-display text-lg leading-snug ${
                    m.isReview ? 'review-day' : 'text-text-primary'
                  }`}
                >
                  {m.topic}
                </p>
              ) : (
                <p className="text-sm text-text-secondary italic">
                  Buffer day · use today to review and ship.
                </p>
              )}
              {m && (
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mt-auto">
                  {m.weekTitle}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* RECOMMENDED RESOURCES */}
      {month && (
        <section className="card p-6 space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Recommended Reading & Resources
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Reference materials and primary literature for Month {month.month} ({month.name}) study tracks.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {domains.map((d) => {
              const track = month.tracks[d];
              const resList = track?.resources || [];
              if (resList.length === 0) return null;
              
              return (
                <div key={d} className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold block">
                    {d === 'law' ? '⚖️ Law' : d === 'economics' ? '📊 Economics' : '💰 Finance'} Resources
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
                              className="text-gold hover:underline hover:text-gold/80 transition-colors inline-flex items-center gap-1 leading-normal"
                            >
                              {res}
                              <span className="text-[9px] opacity-75">↗</span>
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
    <section className="card p-6 text-center space-y-3">
      <p className="text-sm text-text-secondary">
        Sign in to log Day {day}, save private notes, and capture questions.
      </p>
      <Link href={`/login?next=/day/${day}`} className="btn btn-primary inline-flex">
        Sign in
      </Link>
    </section>
  );
}
