import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CURRICULUM, DOMAIN_META } from '@/components/curriculum-data';
import { ProgressBar } from '@/components/ProgressBar';
import { getDayNumber, isBeforeCourse, isAfterCourse } from '@/lib/utils';

export default function LandingPage() {
  const today = new Date();
  const before = isBeforeCourse(today);
  const after = isAfterCourse(today);
  const rawDay = getDayNumber(today);
  const dayShown = before ? 0 : Math.min(rawDay, 122);

  return (
    <div className="mx-auto max-w-content px-5 md:px-6">
      {/* HERO */}
      <section className="pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-text-secondary mb-6 reveal">
          <Sparkles size={12} className="text-gold" />
          <span>Founder's Learning OS</span>
        </div>
        <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.95] tracking-tight text-text-primary reveal">
          Law
          <span className="text-text-muted"> · </span>
          <span className="accent-econ">Economics</span>
          <span className="text-text-muted"> · </span>
          <span className="accent-finance">Finance</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-text-secondary max-w-xl reveal">
          A 4-month founder's curriculum in Nigerian and global Law, Economics & Finance.
          One day, three domains, in public.
        </p>
        <p className="mt-3 text-xs text-text-muted font-mono tracking-wider">
          June 1 – September 30, 2026 · 122 days · 3 domains
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/roadmap" className="btn btn-primary">
            Explore the Curriculum <ArrowRight size={14} />
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Track My Journey
          </Link>
        </div>

        {/* PROGRESS */}
        <div className="mt-12 max-w-md">
          <ProgressBar
            value={dayShown}
            max={122}
            label={
              before
                ? 'Starts June 1, 2026'
                : after
                  ? 'Course completed'
                  : `Day ${dayShown} of 122`
            }
          />
        </div>
      </section>

      <div className="divider" />

      {/* DOMAINS */}
      <section className="py-12 md:py-16">
        <h2 className="font-display text-2xl md:text-3xl mb-2">Three domains. Four months.</h2>
        <p className="text-sm text-text-secondary mb-8 max-w-xl">
          Each month deepens. Each domain reinforces the others. By Day 111, the three
          stop being separate and start being a single way of thinking.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {(['law', 'economics', 'finance'] as const).map((d) => {
            const meta = DOMAIN_META[d];
            const accent = d === 'law' ? 'accent-law' : d === 'economics' ? 'accent-econ' : 'accent-finance';
            return (
              <div key={d} className="card p-6 flex flex-col gap-4 min-h-[200px]">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{meta.icon}</span>
                  <span className={`font-display text-xl ${accent}`}>{meta.label}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {meta.description}
                </p>
                <Link
                  href={`/roadmap?domain=${d}`}
                  className="mt-auto text-xs inline-flex items-center gap-1.5 text-text-secondary hover:text-gold transition-colors"
                >
                  See the 111 days <ArrowRight size={11} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <div className="divider" />

      {/* MONTHS PREVIEW */}
      <section className="py-12 md:py-16">
        <h2 className="font-display text-2xl md:text-3xl mb-8">Four months, four shifts.</h2>
        <ol className="space-y-3">
          {CURRICULUM.map((m) => (
            <li key={m.month} className="card p-5 flex items-baseline gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted w-20 shrink-0">
                Month {m.month}
              </span>
              <div className="flex-1">
                <p className="font-display text-lg leading-snug">{m.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{m.dateRange}</p>
              </div>
              <span className="text-[10px] text-text-muted">
                D{m.startDay}–D{m.endDay}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="divider" />

      {/* ABOUT */}
      <section className="py-12 md:py-16">
        <h2 className="font-display text-2xl md:text-3xl mb-4">About this project</h2>
        <div className="space-y-4 text-text-secondary leading-relaxed max-w-2xl">
          <p>
            This is a personal operating system for one founder's 4-month deep dive across three
            fields that decide how power, money, and rules actually work in Nigeria, Africa,
            and the world.
          </p>
          <p>
            It's built around one belief: <em className="text-text-primary not-italic">if it's
            worth learning, it's worth learning in public.</em> Every day a topic. Every day a
            log. Every week a synthesis. Every shipped insight returns to the community that
            made the learning possible.
          </p>
          <p className="text-text-muted text-sm">
            The curriculum is opinionated — it leans into Nigerian context first, then
            global frameworks, then back to Nigerian application. It assumes the reader is
            building something real.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-3 text-center">
          {[
            { n: '111', l: 'study days' },
            { n: '3', l: 'domains' },
            { n: '16', l: 'weekly reviews' },
          ].map((s) => (
            <div key={s.l} className="card-2 p-6">
              <p className="font-display text-3xl text-gold">{s.n}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary mt-1">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
