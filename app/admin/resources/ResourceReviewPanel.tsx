'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, XCircle, ExternalLink, Clock } from 'lucide-react';
import type { LefDomain, ResourceSubmission } from '@/lib/database.types';

const DOMAIN_LABEL: Record<LefDomain, string> = {
  law: '⚖️ Law',
  economics: '📊 Econ',
  finance: '💰 Finance',
};

type Props = {
  pending: ResourceSubmission[];
  recent: ResourceSubmission[];
};

export function ResourceReviewPanel({ pending: initialPending, recent: initialRecent }: Props) {
  const [pending, setPending] = useState(initialPending);
  const [recent, setRecent] = useState(initialRecent);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: 'approve' | 'reject'): Promise<void> {
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/resources/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? 'Failed to update.');
        return;
      }

      // Move from pending → recent optimistically
      const submission = pending.find((s) => s.id === id);
      if (submission) {
        const updated: ResourceSubmission = {
          ...submission,
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
        };
        setPending((p) => p.filter((s) => s.id !== id));
        setRecent((r) => [updated, ...r].slice(0, 20));
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Pending */}
      <section className="card space-y-4 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
          Pending Review
          {pending.length > 0 && (
            <span className="ml-2 rounded bg-gold/15 px-1.5 py-0.5 font-mono text-xs text-gold">
              {pending.length}
            </span>
          )}
        </h2>

        {error && (
          <p className="text-sm text-red">{error}</p>
        )}

        {pending.length === 0 ? (
          <p className="text-sm text-text-secondary">No pending submissions — all clear.</p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {pending.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-[var(--border-subtle)] px-1.5 py-0.5 text-xs uppercase tracking-wider text-text-muted">
                      Day {s.day_number}
                    </span>
                    <span className="text-xs text-text-muted">{DOMAIN_LABEL[s.domain]}</span>
                    <span className="text-xs uppercase tracking-wider text-text-muted">{s.type}</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{s.title}</p>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-gold hover:underline"
                  >
                    {s.url.slice(0, 70)}{s.url.length > 70 ? '…' : ''}
                    <ExternalLink size={10} />
                  </a>
                  {s.note && (
                    <p className="text-sm italic text-text-secondary">"{s.note}"</p>
                  )}
                  <p className="text-xs text-text-muted">
                    <Clock size={9} className="mr-0.5 inline" />
                    {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <button
                    disabled={isPending}
                    onClick={() => act(s.id, 'approve')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-3 py-1.5 text-sm font-semibold text-success transition-colors hover:bg-success/20 disabled:opacity-40"
                  >
                    <CheckCircle2 size={12} /> Approve
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => act(s.id, 'reject')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red/30 bg-red/10 px-3 py-1.5 text-sm font-semibold text-red transition-colors hover:bg-red/20 disabled:opacity-40"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recently reviewed */}
      {recent.length > 0 && (
        <section className="card space-y-4 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Recently Reviewed
          </h2>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        s.status === 'approved'
                          ? 'bg-success/10 text-success'
                          : 'bg-red/10 text-red'
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="text-xs text-text-muted">Day {s.day_number} · {DOMAIN_LABEL[s.domain]}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-text-primary">{s.title}</p>
                </div>
                <a
                  href={s.url}
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
