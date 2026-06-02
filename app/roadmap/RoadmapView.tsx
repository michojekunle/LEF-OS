'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Github, GitFork } from 'lucide-react';
import { CURRICULUM, DOMAIN_META, RESOURCE_URLS, type Domain } from '@/components/curriculum-data';
import { WeekAccordion } from '@/components/WeekAccordion';
import { LevelBadge } from '@/components/DomainBadge';

const DOMAINS: Domain[] = ['law', 'economics', 'finance'];

export function RoadmapView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialDomain = (params.get('domain') as Domain) || 'law';
  const initialMonth = Number(params.get('month') ?? 1) as 1 | 2 | 3 | 4;

  const [domain, setDomain] = useState<Domain>(
    DOMAINS.includes(initialDomain) ? initialDomain : 'law',
  );
  const [month, setMonth] = useState<1 | 2 | 3 | 4>(
    [1, 2, 3, 4].includes(initialMonth) ? initialMonth : 1,
  );

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
        role="tablist"
        aria-label="Syllabus months"
        className="card p-1.5 flex gap-1 overflow-x-auto md:grid md:grid-cols-4 md:overflow-x-visible"
      >
        {CURRICULUM.map((m) => (
          <button
            key={m.month}
            id={`month-tab-${m.month}`}
            role="tab"
            aria-selected={month === m.month}
            aria-controls="roadmap-panel"
            onClick={() => {
              setMonth(m.month);
              update({ month: m.month });
            }}
            className={`shrink-0 md:shrink px-3 py-2 rounded-md text-xs md:text-sm text-center transition-all ${
              month === m.month
                ? 'bg-surface-2 text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="block font-display leading-tight">{m.monthName}</span>
            <span className="block text-[9px] uppercase tracking-[0.18em] text-text-muted mt-0.5">
              M{m.month}
            </span>
          </button>
        ))}
      </div>

      {/* Domain tabs */}
      <div
        role="tablist"
        aria-label="Syllabus domains"
        className="flex gap-2"
      >
        {DOMAINS.map((d) => {
          const meta = DOMAIN_META[d];
          const isActive = domain === d;
          const accentText =
            d === 'law' ? 'accent-law' : d === 'economics' ? 'accent-econ' : 'accent-finance';
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
              className={`flex-1 card px-3 py-3 flex items-center justify-center gap-2 transition-all ${
                isActive ? 'border-gold' : ''
              }`}
            >
              <span>{meta.icon}</span>
              <span className={`font-display text-sm ${isActive ? accentText : 'text-text-primary'}`}>
                {meta.label}
              </span>
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
        <div className="card p-6 reveal">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <LevelBadge level={track.level} />
            <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {monthData.dateRange}
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl tracking-tight">{track.theme}</h2>
          <p className="text-text-secondary mt-2 text-sm md:text-base max-w-2xl">{track.focus}</p>
        </div>

        {/* Weeks */}
        <div className="space-y-2">
          {track.weeks.map((w, i) => (
            <WeekAccordion key={w.weekNumber} week={w} defaultOpen={i === 0} />
          ))}
        </div>

        {/* Resources + content ideas */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-display text-lg mb-3">Resources</h3>
            <ul className="space-y-2.5 text-xs text-text-secondary">
              {track.resources.map((r) => {
                const url = RESOURCE_URLS[r];
                return (
                  <li key={r} className="flex items-baseline gap-2">
                    <span className="text-text-muted select-none">·</span>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline hover:text-gold/80 transition-colors inline-flex items-center gap-0.5 leading-normal"
                      >
                        {r}
                        <span className="text-[9px] opacity-75 select-none">↗</span>
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
            <h3 className="font-display text-lg mb-3">Content & share ideas</h3>
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
      <section className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-surface-2/10 border-border/80 rounded-lg reveal mt-12">
        <div className="space-y-2.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
            <GitFork size={14} className="text-gold" />
            <span>Contribute to this Syllabus</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Help improve this curriculum. Suggest new case studies, correct legal statutes, or share primary economics literature from the Nigerian and global contexts.
          </p>
        </div>
        <a
          href="https://github.com/michojekunle/LEF"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto btn btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-2 hover:border-gold hover:text-gold transition-colors shrink-0"
          aria-label="Contribute to LEF OS on GitHub"
        >
          <Github size={14} />
          Contribute on GitHub
        </a>
      </section>
    </div>
  );
}
