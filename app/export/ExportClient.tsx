'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Download, FileText, FileSpreadsheet, Lock, CheckSquare, Square } from 'lucide-react';

type DataCounts = {
  entries: number;
  notes: number;
  questions: number;
};

export function ExportClient({ counts }: { counts: DataCounts }) {
  const [include, setInclude] = useState({
    entries: true,
    journal: true,
    insights: true,
    notes: true,
    questions: true,
    answers: true,
  });
  const [format, setFormat] = useState<'markdown' | 'csv'>('markdown');

  function toggle(key: keyof typeof include) {
    setInclude((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const queryString = useMemo(() => {
    const selected = Object.entries(include)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(',');
    return selected ? `?include=${selected}` : '';
  }, [include]);

  const exportHref =
    format === 'markdown' ? `/export/markdown${queryString}` : `/export/csv${queryString}`;

  const anySelected = Object.values(include).some(Boolean);

  const DATA_TYPES = [
    {
      key: 'entries' as const,
      label: 'Daily Entries',
      desc: `${counts.entries} logged day${counts.entries !== 1 ? 's' : ''} — completion flags, star ratings, dates.`,
    },
    {
      key: 'journal' as const,
      label: 'Private Journal',
      desc: 'Your private journal_text — never shared publicly.',
    },
    {
      key: 'insights' as const,
      label: 'Public Insights',
      desc: 'Your share_insight text published to /journal.',
    },
    {
      key: 'notes' as const,
      label: 'Study Notes',
      desc: `${counts.notes} note${counts.notes !== 1 ? 's' : ''} — Law, Economics, Finance notes per day.`,
    },
    {
      key: 'questions' as const,
      label: 'Research Questions',
      desc: `${counts.questions} question${counts.questions !== 1 ? 's' : ''} captured during study, with any written answers.`,
    },
    {
      key: 'answers' as const,
      label: 'Review Question Answers',
      desc: 'Written answers to enriched content quiz questions.',
    },
  ] as const;

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-10 md:px-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-text-secondary">Your archive</p>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Export everything you&apos;ve written.
        </h1>
        <p className="max-w-2xl text-sm text-text-secondary md:text-base">
          Choose what to include, pick a format, and download a portable copy. Generated fresh —
          never cached, never shared.
        </p>
      </header>

      {/* Data type checklist */}
      <section className="card space-y-4 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
          What to include
        </h2>
        <ul className="space-y-3">
          {DATA_TYPES.map(({ key, label, desc }) => (
            <li key={key}>
              <label className="flex cursor-pointer items-start gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={include[key]}
                  onClick={() => toggle(key)}
                  className="mt-0.5 shrink-0 transition-colors"
                >
                  {include[key] ? (
                    <CheckSquare size={16} className="text-gold" />
                  ) : (
                    <Square size={16} className="text-text-muted" />
                  )}
                </button>
                <div>
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="text-xs text-text-secondary">{desc}</p>
                </div>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* Format picker */}
      <section className="card p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-primary">
          Format
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              key: 'markdown' as const,
              Icon: FileText,
              title: 'Markdown',
              desc: 'One .md file grouped by day. Works with Obsidian, Notion, and any journaling app.',
            },
            {
              key: 'csv' as const,
              Icon: FileSpreadsheet,
              title: 'CSV',
              desc: 'One row per entry. Great for spreadsheets, analytics, and data tools.',
            },
          ].map(({ key, Icon, title, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormat(key)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                format === key
                  ? 'border-gold/50 bg-gold/5'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border)]'
              }`}
            >
              <Icon size={18} className={format === key ? 'text-gold' : 'text-text-muted'} />
              <div>
                <p className="text-sm font-semibold text-text-primary">{title}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Download */}
      <div className="flex flex-wrap items-center gap-4">
        <a
          href={anySelected ? exportHref : undefined}
          download
          aria-disabled={!anySelected}
          className={`btn btn-primary inline-flex items-center gap-2 ${
            !anySelected ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          <Download size={14} />
          Download {format === 'markdown' ? 'Markdown' : 'CSV'}
        </a>
        {!anySelected && (
          <p className="text-xs text-text-muted">Select at least one data type to export.</p>
        )}
      </div>

      {/* Privacy note */}
      <div className="card flex items-start gap-3 p-5 text-xs text-text-secondary">
        <Lock size={14} className="mt-0.5 shrink-0 text-text-muted" />
        <p>
          Exports include private content (notes, journal text). Generated server-side using your
          session — never cached, never shared.
        </p>
      </div>

      <Link href="/dashboard" className="text-xs text-text-secondary hover:text-text-primary">
        ← Back to dashboard
      </Link>
    </div>
  );
}
