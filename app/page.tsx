import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CURRICULUM, DOMAIN_META } from '@/data/curriculum-data';
import { DOMAIN_ACCENT_TEXT } from '@/lib/domain';
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
      <section className="pb-12 pt-12 md:pb-16 md:pt-20">
        <div className="reveal mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-text-secondary">
          <Sparkles size={12} className="text-gold" />
          <span>Founder's Learning OS</span>
        </div>
        <h1 className="reveal font-display text-[clamp(2.8rem,10vw,5rem)] leading-[0.95] tracking-tight text-text-primary">
          Law
          <span className="text-text-muted"> · </span>
          <span className="accent-econ">Economics</span>
          <span className="text-text-muted"> · </span>
          <span className="accent-finance">Finance</span>
        </h1>
        <p className="reveal mt-6 max-w-xl text-base text-text-secondary md:text-lg">
          A 4-month founder's curriculum in Nigerian and global Law, Economics & Finance. One day,
          three domains, in public.
        </p>
        <p className="mt-3 font-mono text-xs tracking-wider text-text-muted">
          June 1 – September 30, 2026 · 122 days · 3 domains
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/roadmap" className="btn btn-primary" data-tour="explore-cta">
            Explore the Curriculum <ArrowRight size={14} />
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Track My Journey
          </Link>
        </div>

        {/* PROGRESS */}
        <div className="mt-12 max-w-md" data-tour="hero-progress-bar">
          <ProgressBar
            value={dayShown}
            max={122}
            label={
              before ? 'Starts June 1, 2026' : after ? 'Course completed' : `Day ${dayShown} of 122`
            }
          />
        </div>
      </section>

      <div className="divider" />

      {/* DOMAINS */}
      <section className="py-12 md:py-16">
        <h2 className="mb-2 font-display text-2xl md:text-3xl">Three domains. Four months.</h2>
        <p className="mb-8 max-w-xl text-sm text-text-secondary">
          Each month deepens. Each domain reinforces the others. By Day 111, the three stop being
          separate and start being a single way of thinking.
        </p>
        <div className="grid gap-4 md:grid-cols-3" data-tour="domain-cards-row">
          {(['law', 'economics', 'finance'] as const).map((d) => {
            const meta = DOMAIN_META[d];
            const accent =
              DOMAIN_ACCENT_TEXT[d];
            return (
              <div
                key={d}
                className="card flex min-h-[200px] flex-col gap-4 p-6"
                data-tour-action="domain-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{meta.icon}</span>
                  <span className={`text-base font-semibold ${accent}`}>{meta.label}</span>
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">{meta.description}</p>
                <Link
                  href={`/roadmap?domain=${d}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-gold"
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
        <h2 className="mb-8 font-display text-2xl md:text-3xl">Four months, four shifts.</h2>
        <ol className="space-y-3">
          {CURRICULUM.map((m) => (
            <li key={m.month} className="card flex items-baseline gap-4 p-5">
              <span className="w-20 shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
                Month {m.month}
              </span>
              <div className="flex-1">
                <p className="text-base font-semibold leading-snug text-text-primary">{m.name}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{m.dateRange}</p>
              </div>
              <span className="text-xs text-text-muted">
                D{m.startDay}–D{m.endDay}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="divider" />

      {/* ABOUT */}
      <section className="py-12 md:py-16">
        <h2 className="mb-4 font-display text-2xl md:text-3xl">About this project</h2>
        <div className="max-w-2xl space-y-4 leading-relaxed text-text-secondary">
          <p>
            This is a personal operating system for one founder's 4-month deep dive across three
            fields that decide how power, money, and rules actually work in Nigeria, Africa, and the
            world.
          </p>
          <p>
            It's built around one belief:{' '}
            <em className="not-italic text-text-primary">
              if it's worth learning, it's worth learning in public.
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
          {[
            { n: '111', l: 'study days' },
            { n: '3', l: 'domains' },
            { n: '16', l: 'weekly reviews' },
          ].map((s) => (
            <div key={s.l} className="card-2 p-6">
              <p className="text-3xl font-bold text-gold">{s.n}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-secondary">{s.l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
