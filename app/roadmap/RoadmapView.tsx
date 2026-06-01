'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CURRICULUM, DOMAIN_META, type Domain } from '@/components/curriculum-data';
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
      <div role="tablist" className="card p-1.5 flex gap-1 overflow-x-auto">
        {CURRICULUM.map((m) => (
          <button
            key={m.month}
            role="tab"
            aria-selected={month === m.month}
            onClick={() => {
              setMonth(m.month);
              update({ month: m.month });
            }}
            className={`shrink-0 px-3 py-2 rounded-md text-xs md:text-sm transition-all ${
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
      <div role="tablist" className="flex gap-2">
        {DOMAINS.map((d) => {
          const meta = DOMAIN_META[d];
          const isActive = domain === d;
          const accentText =
            d === 'law' ? 'accent-law' : d === 'economics' ? 'accent-econ' : 'accent-finance';
          return (
            <button
              key={d}
              role="tab"
              aria-selected={isActive}
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
          <ul className="space-y-1.5 text-sm text-text-secondary">
            {track.resources.map((r) => (
              <li key={r} className="flex items-baseline gap-2">
                <span className="text-text-muted">·</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="font-display text-lg mb-3">Content & share ideas</h3>
          <ul className="space-y-1.5 text-sm text-text-secondary">
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
  );
}
