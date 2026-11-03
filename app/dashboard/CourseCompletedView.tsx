'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Flame,
  Calendar,
  ArrowRight,
  Download,
  BookOpen,
  Scale,
  BarChart,
  Landmark,
  Sparkles,
  CheckSquare,
  Square,
  Share2,
  Layers,
  ShieldCheck,
  Compass,
  FileText,
  Search,
  Check,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ProgressBar } from '@/components/ProgressBar';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { EntryCard } from '@/components/EntryCard';
import {
  TOTAL_CURRICULUM_DAYS,
  getAllThursdays,
  isEntryComplete,
  isoDate,
  type DailyEntry,
} from '@/lib/utils';
import type { CourseContextValue } from '@/components/CourseContext';

type Props = {
  course: CourseContextValue;
  entries: DailyEntry[];
  userId: string;
  email: string;
  displayName: string | null;
  completedDays: number;
  streak: number;
  longestStreak: number;
  lawDone: number;
  econDone: number;
  finDone: number;
};

const INITIAL_FOUNDER_CHECKLIST = [
  {
    id: 'c1',
    category: 'Law',
    title: 'Corporate Governance & CAC Compliance',
    desc: 'Verify CAC company registration status, file annual returns, and formalize shareholder agreements with reverse-vesting schedules.',
  },
  {
    id: 'c2',
    category: 'Law',
    title: 'Data Protection & Regulatory Filing',
    desc: 'Perform internal NDPR compliance audit, file data controller registration with NDPC, and implement standard employee IP assignments.',
  },
  {
    id: 'c3',
    category: 'Economics',
    title: 'FX & Supply Chain Risk Hedging',
    desc: 'Stress-test pricing against CBN monetary policy fluctuations, dual-currency billing options, and import tariff exposures.',
  },
  {
    id: 'c4',
    category: 'Economics',
    title: 'Regulatory & Sector Licensing Map',
    desc: 'Map state and federal industry regulators (e.g. CBN, SEC, NAFDAC, FCCPC) and document all compliance approvals required for scale.',
  },
  {
    id: 'c5',
    category: 'Finance',
    title: '3-Year Operating Model & Burn Analysis',
    desc: 'Finalize dynamic 3-statement financial model reflecting 18-month minimum runway, unit economics (CAC/LTV), and headcount forecasts.',
  },
  {
    id: 'c6',
    category: 'Finance',
    title: 'Treasury & Capital Stack Architecture',
    desc: 'Structure corporate bank accounts, optimize idle cash in short-term money market securities, and prepare institutional SAFE note data room.',
  },
];

export function CourseCompletedView({
  course,
  entries,
  userId: _userId,
  email,
  displayName,
  completedDays,
  streak,
  longestStreak,
  lawDone,
  econDone,
  finDone,
}: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  // Restore checklist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lef_founder_checklist');
      if (saved) {
        setCompletedTasks(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('lef_founder_checklist', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const preferredDomains = course.preferredDomains ?? ['law', 'economics', 'finance'];
  const completionPercentage = Math.round((completedDays / TOTAL_CURRICULUM_DAYS) * 100) || 0;

  const thursdays = useMemo(() => getAllThursdays(course), [course]);
  const thursdaysDone = useMemo(() => {
    const byDate = new Map(entries.map((e) => [e.entry_date, e]));
    return thursdays.filter((t) => {
      const dateStr = t.date.toISOString().slice(0, 10);
      const e = byDate.get(dateStr);
      return Boolean(e && isEntryComplete(e));
    }).length;
  }, [entries, thursdays]);

  const startDate = course.start instanceof Date ? course.start : new Date(course.start);
  const endDate = course.end instanceof Date ? course.end : new Date(course.end);

  const startStr = startDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const endStr = endDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        (e.journal_text && e.journal_text.toLowerCase().includes(q)) ||
        (e.share_insight && e.share_insight.toLowerCase().includes(q)) ||
        (e.entry_date && e.entry_date.includes(q)) ||
        String(e.day_number).includes(q),
    );
  }, [entries, searchQuery]);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="mx-auto max-w-content space-y-10 px-5 py-8 md:px-6">
      {/* 1. HERO CELEBRATION CARD */}
      <section className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 via-surface to-surface p-6 shadow-2xl md:p-10">
        {/* Ambient subtle glow background */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sage/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
              <Sparkles size={12} className="text-gold" />
              <span>LEF Fellow · Curriculum Completed</span>
            </div>

            <h1 className="font-display text-3xl tracking-tight text-text-primary md:text-5xl">
              Course Completed. <span className="text-gold">111 Days Mastered.</span>
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
              Congratulations, <span className="font-medium text-text-primary">{displayName ?? email?.split('@')[0] ?? 'Fellow'}</span>. 
              You have completed the full {course.totalDays}-day calendar journey across Law, Economics, and Finance. 
              You now command the foundational operating frameworks of Nigerian and global enterprise.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-text-muted">
              <span>📅 {startStr} – {endStr}</span>
              <span>·</span>
              <span>📚 111 Curriculum Topics</span>
              <span>·</span>
              <span>⚡ {preferredDomains.length} Specialized Tracks</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row md:flex-col">
            <Link
              href="/export"
              className="btn btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
            >
              <Download size={14} /> Export Knowledge Vault
            </Link>
            <button
              onClick={handleShare}
              className="btn btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2 text-xs uppercase tracking-wider"
            >
              <Share2 size={13} /> {copiedLink ? 'Link Copied!' : 'Share Portfolio'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. EXECUTIVE COMPLETION METRICS */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CheckCircle2 size={16} className="text-success" />}
          label="Topics Mastered"
          value={`${completedDays}`}
          sub={`/ 111 total (${completionPercentage}%)`}
        />
        <StatCard
          icon={<Flame size={16} className="text-gold" />}
          label="Peak Consistency"
          value={`${longestStreak > 0 ? longestStreak : streak}`}
          sub="day record streak"
        />
        <StatCard
          icon={<BookOpen size={16} className="text-sage" />}
          label="Weekly Synthesis"
          value={`${thursdaysDone}`}
          sub={`/ ${thursdays.length} reviews logged`}
        />
        <StatCard
          icon={<Calendar size={16} className="text-slate-blue" />}
          label="Window Completed"
          value={`${course.totalDays}`}
          sub="calendar days"
        />
      </section>

      {/* 3. PER-DOMAIN MASTERY MATRIX */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-text-secondary">
              Curriculum Tracks
            </h2>
            <h3 className="font-display text-xl text-text-primary">Per-Domain Mastery Matrix</h3>
          </div>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-gold"
          >
            Full 111-Day Roadmap <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* LAW */}
          {preferredDomains.includes('law') && (
            <div className="card flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
                    <Scale size={14} /> Law
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    {lawDone} / {TOTAL_CURRICULUM_DAYS} ({Math.round((lawDone / TOTAL_CURRICULUM_DAYS) * 100)}%)
                  </span>
                </div>
                <ProgressBar
                  value={lawDone}
                  max={TOTAL_CURRICULUM_DAYS}
                  accent="gold"
                />
                <div className="space-y-2 pt-2 text-xs text-text-secondary">
                  <p className="font-medium text-text-primary">Key Frameworks Mastered:</p>
                  <ul className="space-y-1 text-text-muted">
                    <li>• CAMA 2020 Corporate Formations & Articles</li>
                    <li>• Founder Equity Vesting & Shareholder Agreements</li>
                    <li>• NDPR & Data Protection Compliance Audits</li>
                    <li>• Commercial Contracts, IP Rights & Dispute Resolution</li>
                  </ul>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  href="/roadmap?domain=law"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold transition-colors hover:underline"
                >
                  Review Law Modules <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {/* ECONOMICS */}
          {preferredDomains.includes('economics') && (
            <div className="card flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-sage">
                    <BarChart size={14} /> Economics
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    {econDone} / {TOTAL_CURRICULUM_DAYS} ({Math.round((econDone / TOTAL_CURRICULUM_DAYS) * 100)}%)
                  </span>
                </div>
                <ProgressBar
                  value={econDone}
                  max={TOTAL_CURRICULUM_DAYS}
                  accent="sage"
                />
                <div className="space-y-2 pt-2 text-xs text-text-secondary">
                  <p className="font-medium text-text-primary">Key Frameworks Mastered:</p>
                  <ul className="space-y-1 text-text-muted">
                    <li>• African Economic History & Trans-Saharan Trade</li>
                    <li>• CBN Monetary Dynamics, FX Regimes & Liquidity</li>
                    <li>• Fiscal Deficits, Inflation & Subsidy Reform</li>
                    <li>• Trade Policy, Tariffs & Market Infrastructure</li>
                  </ul>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  href="/roadmap?domain=economics"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage transition-colors hover:underline"
                >
                  Review Economics Modules <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {/* FINANCE */}
          {preferredDomains.includes('finance') && (
            <div className="card flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-blue">
                    <Landmark size={14} /> Finance
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    {finDone} / {TOTAL_CURRICULUM_DAYS} ({Math.round((finDone / TOTAL_CURRICULUM_DAYS) * 100)}%)
                  </span>
                </div>
                <ProgressBar
                  value={finDone}
                  max={TOTAL_CURRICULUM_DAYS}
                  accent="slate"
                />
                <div className="space-y-2 pt-2 text-xs text-text-secondary">
                  <p className="font-medium text-text-primary">Key Frameworks Mastered:</p>
                  <ul className="space-y-1 text-text-muted">
                    <li>• 3-Statement Financial Modeling & Cash Burn</li>
                    <li>• Cap Table Dilution, SAFEs & Priced Rounds</li>
                    <li>• Unit Economics (CAC, LTV, Payback Dynamics)</li>
                    <li>• Valuation Methodologies & Venture Debt Covenants</li>
                  </ul>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  href="/roadmap?domain=finance"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-blue transition-colors hover:underline"
                >
                  Review Finance Modules <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. FOUNDER ACTION MATRIX: "NOW GO BUILD WITH IT" */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-gold" />
            <h2 className="text-xs uppercase tracking-[0.2em] text-text-secondary">
              Founder Implementation Matrix
            </h2>
          </div>
          <h3 className="font-display text-xl text-text-primary">Now Go Build With It</h3>
          <p className="mt-1 text-xs text-text-secondary">
            Translate your academic knowledge into operational reality. Check off critical commercial milestones as you execute.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {INITIAL_FOUNDER_CHECKLIST.map((item) => {
            const isDone = Boolean(completedTasks[item.id]);
            return (
              <div
                key={item.id}
                onClick={() => toggleTask(item.id)}
                className={`card flex cursor-pointer items-start gap-3 p-4 transition-all duration-200 hover:border-gold/30 ${
                  isDone ? 'border-success/30 bg-success/5 opacity-80' : 'bg-surface'
                }`}
              >
                <button
                  type="button"
                  aria-label={isDone ? 'Mark task incomplete' : 'Mark task complete'}
                  className="mt-0.5 text-text-muted transition-colors hover:text-gold"
                >
                  {isDone ? (
                    <CheckSquare size={18} className="text-success" />
                  ) : (
                    <Square size={18} className="text-text-muted" />
                  )}
                </button>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      [{item.category}]
                    </span>
                    <h4
                      className={`text-sm font-semibold transition-colors ${
                        isDone ? 'text-text-muted line-through' : 'text-text-primary'
                      }`}
                    >
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. POST-GRADUATION EXPLORATION BAR */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/sankofa"
          className="card group flex flex-col justify-between border-gold/20 p-5 transition-colors hover:border-gold/40"
        >
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold">
              <Compass size={14} /> Sankofa Archive
            </span>
            <h4 className="font-display text-lg text-text-primary group-hover:text-gold">
              World & African History
            </h4>
            <p className="text-xs text-text-secondary">
              Deepen your context. Explore the 7 historical sectors: Africa, World, Economies, Politics, People, Ideas & Heritage.
            </p>
          </div>
          <span className="pt-4 text-xs font-semibold text-gold">Explore Archive →</span>
        </Link>

        <Link
          href="/export"
          className="card group flex flex-col justify-between border-sage/20 p-5 transition-colors hover:border-sage/40"
        >
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-sage">
              <FileText size={14} /> Export Vault
            </span>
            <h4 className="font-display text-lg text-text-primary group-hover:text-sage">
              Download All Notes
            </h4>
            <p className="text-xs text-text-secondary">
              Export your entire learning ledger, study notes, and reflection history into Markdown or structured CSV files.
            </p>
          </div>
          <span className="pt-4 text-xs font-semibold text-sage">Download Files →</span>
        </Link>

        <Link
          href="/journal"
          className="card group flex flex-col justify-between border-slate-blue/20 p-5 transition-colors hover:border-slate-blue/40"
        >
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-blue">
              <Layers size={14} /> Personal Journal
            </span>
            <h4 className="font-display text-lg text-text-primary group-hover:text-slate-blue">
              Search Past Entries
            </h4>
            <p className="text-xs text-text-secondary">
              Revisit your day-by-day notes, reflections, and insights written across the entire 122-day calendar span.
            </p>
          </div>
          <span className="pt-4 text-xs font-semibold text-slate-blue">Open Journal →</span>
        </Link>
      </section>

      {/* 6. HEATMAP & THURSDAY REVIEWS */}
      <CalendarHeatmap entries={entries} currentDay={course.totalDays} />

      <ThursdayReviewTracker entries={entries} course={course} />

      {/* 7. COMPLETE ENTRY HISTORY */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xs uppercase tracking-[0.18em] text-text-secondary">
              Learning Ledger
            </h2>
            <h3 className="font-display text-xl text-text-primary">
              All Completed Entries ({entries.length})
            </h3>
          </div>
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past logs..."
              className="w-full rounded-md border border-border bg-surface-2 py-1.5 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="card p-8 text-center text-text-muted">
            <p className="text-xs">No entries match your search query.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredEntries.slice(0, 30).map((e) => (
              <li key={e.id}>
                <EntryCard
                  entry={e}
                  showJournal
                  authorName={displayName ?? email.split('@')[0]}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ThursdayReviewTracker({
  entries,
  course,
}: {
  entries: DailyEntry[];
  course: CourseContextValue;
}) {
  const thursdays = getAllThursdays(course);
  const byDate = new Map(entries.map((e) => [e.entry_date, e]));
  return (
    <section className="card p-5">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Weekly Video Review Archive · Thursdays ({thursdays.length} Sessions)
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-2">
        {thursdays.map((t) => {
          const e = byDate.get(isoDate(t.date));
          const done = Boolean(e && isEntryComplete(e));
          return (
            <div
              key={t.day}
              className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-sm transition-colors ${
                done ? 'border-gold/40 bg-accent-law' : 'border-border bg-surface'
              }`}
            >
              <span className="font-mono text-text-muted">Day {t.day}</span>
              <span className={done ? 'text-gold' : 'text-text-muted'}>
                {done ? <Check size={14} className="text-gold" /> : '○'}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
