'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Github, GitFork } from 'lucide-react';
import {
  CURRICULUM,
  DOMAIN_META,
  RESOURCE_URLS,
  LEF_DOMAINS,
  type Domain,
} from '@/data/curriculum-data';
import { WeekAccordion } from '@/components/WeekAccordion';
import { LevelBadge } from '@/components/DomainBadge';
import { DOMAIN_ACCENT_TEXT } from '@/lib/domain';

type Props = {
  /** Domains the user selected during onboarding. All three shown if not provided. */
  preferredDomains?: Domain[];
  /** Per-phase date ranges computed from the user's actual course start date. */
  phaseDateRanges?: Record<number, string>;
};

export function RoadmapView({
  preferredDomains = ['law', 'economics', 'finance'],
  phaseDateRanges = {},
}: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Default to the user's first preferred domain (or URL param if explicitly set)
  const urlDomain = params.get('domain') as Domain | null;
  const defaultDomain: Domain =
    urlDomain && LEF_DOMAINS.includes(urlDomain) ? urlDomain : (preferredDomains[0] ?? 'law');

  const initialDomain = defaultDomain;
  const initialMonth = Number(params.get('month') ?? 1) as 1 | 2 | 3 | 4;

  const [domain, setDomain] = useState<Domain>(initialDomain);
  const [month, setMonth] = useState<1 | 2 | 3 | 4>(
    [1, 2, 3, 4].includes(initialMonth) ? initialMonth : 1,
  );
  const domainIndex = LEF_DOMAINS.indexOf(domain);

  const monthData = useMemo(() => CURRICULUM.find((m) => m.month === month)!, [month]);
  const track = monthData.tracks[domain];

  function update(next: { domain?: Domain; month?: 1 | 2 | 3 | 4 }) {
    const sp = new URLSearchParams(params.toString());
    if (next.domain) sp.set('domain', next.domain);
    if (next.month) sp.set('month', String(next.month));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-8">
      {/* Month tabs */}
      <div
        className="scrollbar-thin scrollbar-thumb-[var(--border-subtle)] scrollbar-track-transparent w-full overflow-x-auto pb-2"
        data-tour="month-tabs"
      >
        <div
          role="tablist"
          aria-label="Syllabus months"
          className="card grid min-w-[420px] grid-cols-4 gap-1 p-1.5"
        >
          {CURRICULUM.map((m) => (
            <button
              key={m.month}
              id={`month-tab-${m.month}`}
              role="tab"
              data-tour-action="month-tab"
              aria-selected={month === m.month}
              aria-controls="roadmap-panel"
              onClick={() => {
                setMonth(m.month);
                update({ month: m.month });
              }}
              className={`rounded-md px-2 py-2 text-center text-xs transition-all md:px-3 md:text-sm ${
                month === m.month
                  ? 'bg-surface-2 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="block font-semibold leading-tight">{m.name.split(' ')[0]}</span>
              <span className="mt-0.5 block text-xs uppercase tracking-[0.18em] text-text-muted">
                Phase {m.month}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Domain segmented control — mirrors the month switcher above */}
      <div
        role="tablist"
        aria-label="Syllabus domains"
        className="card relative grid grid-cols-3 gap-1 p-1.5"
      >
        {/* Sliding active pill */}
        <span
          aria-hidden
          style={{ transform: `translateX(${domainIndex * 100}%)` }}
          className="pointer-events-none absolute inset-y-1.5 left-1.5 w-[calc(33.333%-0.375rem)] rounded-md bg-surface-2 shadow-sm transition-transform duration-200 ease-out"
        />

        {LEF_DOMAINS.map((d) => {
          const meta = DOMAIN_META[d];
          const isActive = domain === d;
          const accentText = DOMAIN_ACCENT_TEXT[d];
          const isInTrack = preferredDomains.includes(d);

          return (
            <button
              key={d}
              id={`domain-tab-${d}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="roadmap-panel"
              onClick={() => {
                setDomain(d);
                update({ domain: d });
              }}
              className="relative z-10 flex cursor-pointer flex-col items-center gap-1 rounded-lg px-2 py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 md:flex-row md:justify-center md:gap-2.5 md:py-2.5"
            >
              <span
                className={`text-lg leading-none transition-transform duration-150 md:text-base ${isActive ? 'scale-110' : 'scale-100'} ${!isInTrack && preferredDomains.length < 3 ? 'opacity-40' : ''}`}
              >
                {meta.icon}
              </span>
              <span
                className={`text-xs font-semibold tracking-wide transition-colors duration-150 md:text-sm ${
                  isActive
                    ? accentText
                    : !isInTrack && preferredDomains.length < 3
                      ? 'text-text-muted opacity-50'
                      : 'text-text-muted'
                }`}
              >
                {meta.label}
              </span>
              {/* "Your track" dot — only shown when not all domains selected */}
              {isInTrack && preferredDomains.length < 3 && (
                <span
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold"
                  title="In your track"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Roadmap Tabpanel Content */}
      <div
        id="roadmap-panel"
        role="tabpanel"
        aria-labelledby={`month-tab-${month} domain-tab-${domain}`}
        className="space-y-8"
      >
        {/* Track header */}
        <div className="card reveal p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <LevelBadge level={track.level} />
            <span className="text-xs uppercase tracking-[0.22em] text-text-muted">
              {phaseDateRanges[month] ?? monthData.dateRange}
            </span>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
            {track.theme}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary md:text-base">{track.focus}</p>
        </div>

        {/* Weeks */}
        <div className="space-y-2" data-tour="week-accordions">
          {track.weeks.map((w, i) => (
            /* Wrapper gives the click listener a data-tour-action anchor */
            <div key={w.weekNumber} data-tour-action="week-accordion">
              <WeekAccordion week={w} defaultOpen={i === 0} />
            </div>
          ))}
        </div>

        {/* Resources + content ideas */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Resources</h3>
            <ul className="space-y-2.5 text-xs text-text-secondary">
              {track.resources.map((r) => {
                const url = RESOURCE_URLS[r];
                return (
                  <li key={r} className="flex items-baseline gap-2">
                    <span className="select-none text-text-muted">·</span>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gold/80 inline-flex items-center gap-0.5 leading-normal text-gold transition-colors hover:underline"
                      >
                        {r}
                        <span className="select-none text-xs opacity-75">↗</span>
                      </a>
                    ) : (
                      <span>{r}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Content & share ideas</h3>
            <ul className="space-y-1.5 text-xs text-text-secondary">
              {track.contentIdeas.map((c) => (
                <li key={c} className="flex items-baseline gap-2">
                  <span className="text-text-muted">·</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* GitHub Contribute Callout */}
      <section className="card reveal mt-12 flex flex-col items-start justify-between gap-6 rounded-lg border-[var(--border-subtle)] p-6 sm:flex-row sm:items-center">
        <div className="max-w-xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
            <GitFork size={14} className="text-gold" />
            <span>Contribute to this Syllabus</span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            Help improve this curriculum. Suggest new case studies, correct legal statutes, or share
            primary economics literature from the Nigerian and global contexts.
          </p>
        </div>
        <a
          href="https://github.com/michojekunle/lef-os"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary flex w-full shrink-0 items-center justify-center gap-2 px-4 py-2 text-xs transition-colors hover:border-gold hover:text-gold sm:w-auto"
          aria-label="Contribute to LEF OS on GitHub"
        >
          <Github size={14} />
          Contribute on GitHub
        </a>
      </section>
    </div>
  );
}
