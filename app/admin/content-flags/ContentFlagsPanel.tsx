'use client';

import { useState, useTransition } from 'react';
import { ExternalLink, CheckCircle2, Flag, PlayCircle } from 'lucide-react';
import type { ContentFlag } from '@/lib/database.types';

type Props = {
  open: ContentFlag[];
  resolved: ContentFlag[];
};

const DOMAIN_LABEL: Record<string, string> = {
  law: '⚖️ Law',
  economics: '📊 Econ',
  finance: '💰 Finance',
};

function FlagRow({
  flag,
  onResolve,
  disabled,
}: {
  flag: ContentFlag;
  onResolve?: (id: string) => void;
  disabled?: boolean;
}) {
  const isVideo = flag.content_type === 'video';
  return (
    <li className="flex flex-col gap-2.5 py-4 sm:flex-row sm:items-start sm:gap-4">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              isVideo
                ? 'bg-slate-blue/10 text-slate-blue'
                : 'bg-sage/10 text-sage'
            }`}
          >
            {isVideo ? <PlayCircle size={10} /> : <ExternalLink size={10} />}
            {flag.content_type}
          </span>
          {flag.day_number && (
            <span className="text-xs text-text-muted">
              Day {flag.day_number}
              {flag.domain ? ` · ${DOMAIN_LABEL[flag.domain] ?? flag.domain}` : ''}
            </span>
          )}
          <span className="text-xs text-text-muted">
            {new Date(flag.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <p className="text-sm font-medium text-text-primary">{flag.title}</p>

        <a
          href={flag.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
        >
          {flag.url.length > 72 ? `${flag.url.slice(0, 72)}…` : flag.url}
          <ExternalLink size={10} />
        </a>

        {flag.reason && (
          <blockquote className="border-l-2 border-[var(--border-subtle)] pl-3 text-xs italic text-text-secondary">
            "{flag.reason}"
          </blockquote>
        )}
      </div>

      {onResolve && (
        <button
          disabled={disabled}
          onClick={() => onResolve(flag.id)}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success/20 disabled:opacity-40 sm:flex-col sm:text-center"
        >
          <CheckCircle2 size={12} /> Mark resolved
        </button>
      )}
    </li>
  );
}

export function ContentFlagsPanel({ open: initialOpen, resolved: initialResolved }: Props) {
  const [open, setOpen] = useState(initialOpen);
  const [resolved, setResolved] = useState(initialResolved);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function resolve(id: string): void {
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/content/flag', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? 'Failed to resolve.');
        return;
      }

      const flag = open.find((f) => f.id === id);
      if (flag) {
        setOpen((o) => o.filter((f) => f.id !== id));
        setResolved((r) =>
          [{ ...flag, resolved: true, resolved_at: new Date().toISOString() }, ...r].slice(0, 30),
        );
      }
    });
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red">{error}</p>}

      {/* Open flags */}
      <section className="card space-y-2 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Flag size={14} className="text-red" />
          <h2 className="text-sm font-semibold text-text-primary">Open Flags</h2>
          {open.length > 0 && (
            <span className="rounded bg-red/15 px-1.5 py-0.5 font-mono text-xs text-red">
              {open.length}
            </span>
          )}
        </div>

        {open.length === 0 ? (
          <p className="py-4 text-sm text-text-secondary">No open content flags — all clear.</p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {open.map((flag) => (
              <FlagRow
                key={flag.id}
                flag={flag}
                onResolve={resolve}
                disabled={isPending}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Resolved */}
      {resolved.length > 0 && (
        <section className="card space-y-2 p-6">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Recently Resolved</h2>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {resolved.map((flag) => (
              <li key={flag.id} className="flex items-start gap-3 py-3">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{flag.title}</p>
                  <p className="text-xs text-text-muted">
                    {flag.day_number ? `Day ${flag.day_number}` : ''}{' '}
                    {flag.domain ? `· ${DOMAIN_LABEL[flag.domain]}` : ''} ·{' '}
                    {flag.content_type}
                    {flag.resolved_at
                      ? ` · Resolved ${new Date(flag.resolved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                      : ''}
                  </p>
                </div>
                <a
                  href={flag.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-text-muted hover:text-gold"
                >
                  <ExternalLink size={12} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
