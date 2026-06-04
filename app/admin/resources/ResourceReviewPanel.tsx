'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, XCircle, ExternalLink, Clock, Flag, Trash2 } from 'lucide-react';
import type { LefDomain, ResourceSubmission } from '@/lib/database.types';

const DOMAIN_LABEL: Record<LefDomain, string> = {
  law: '⚖️ Law',
  economics: '📊 Econ',
  finance: '💰 Finance',
};

type FlaggedSubmission = ResourceSubmission & { flag_count: number };

type Props = {
  pending: ResourceSubmission[];
  flagged: FlaggedSubmission[];
  recent: ResourceSubmission[];
};

export function ResourceReviewPanel({
  pending: initialPending,
  flagged: initialFlagged,
  recent: initialRecent,
}: Props) {
  const [pending, setPending] = useState(initialPending);
  const [flagged, setFlagged] = useState(initialFlagged);
  const [recent, setRecent] = useState(initialRecent);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function act(
    id: string,
    action: 'approve' | 'reject' | 'remove',
    from: 'pending' | 'flagged',
  ): Promise<void> {
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

      const sourceList = from === 'pending' ? pending : (flagged as ResourceSubmission[]);
      const submission = sourceList.find((s) => s.id === id);

      if (submission) {
        const updated: ResourceSubmission = {
          ...submission,
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
        };
        if (from === 'pending') {
          setPending((p) => p.filter((s) => s.id !== id));
        } else {
          setFlagged((f) => f.filter((s) => s.id !== id));
        }
        setRecent((r) => [updated, ...r].slice(0, 20));
      }
    });
  }

  const totalPending = pending.length + flagged.length;

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red">{error}</p>}

      {/* ── Flagged by users (priority) ─────────────────────────────── */}
      {flagged.length > 0 && (
        <section className="card space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Flag size={14} className="text-red" />
            <h2 className="text-sm font-semibold text-text-primary">
              Flagged by Users
            </h2>
            <span className="rounded bg-red/15 px-1.5 py-0.5 font-mono text-xs text-red">
              {flagged.length}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            These resources were automatically hidden after reaching the flag threshold. Remove or
            reinstate each one.
          </p>

          <ul className="divide-y divide-[var(--border-subtle)]">
            {flagged.map((s) => (
              <li key={s.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:gap-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-red/30 bg-red/10 px-1.5 py-0.5 text-xs font-semibold text-red">
                      ⚑ {s.flag_count} flag{s.flag_count !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-text-muted">
                      Day {s.day_number} · {DOMAIN_LABEL[s.domain]}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-text-muted">{s.type}</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{s.title}</p>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                  >
                    {s.url.slice(0, 70)}{s.url.length > 70 ? '…' : ''}
                    <ExternalLink size={10} />
                  </a>
                  {s.note && (
                    <p className="text-xs italic text-text-secondary">"{s.note}"</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                  <button
                    disabled={isPending}
                    onClick={() => act(s.id, 'remove', 'flagged')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red/30 bg-red/10 px-3 py-1.5 text-xs font-semibold text-red transition-colors hover:bg-red/25 disabled:opacity-40"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => act(s.id, 'approve', 'flagged')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-success hover:text-success disabled:opacity-40"
                  >
                    <CheckCircle2 size={12} /> Keep it
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Pending (new submissions) ────────────────────────────────── */}
      <section className="card space-y-4 p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text-primary">
            Pending Review
          </h2>
          {pending.length > 0 && (
            <span className="rounded bg-gold/15 px-1.5 py-0.5 font-mono text-xs text-gold">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-text-secondary">
            {totalPending === 0 ? 'No pending submissions — all clear.' : 'No new submissions awaiting review.'}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {pending.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
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
                    className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                  >
                    {s.url.slice(0, 70)}{s.url.length > 70 ? '…' : ''}
                    <ExternalLink size={10} />
                  </a>
                  {s.note && (
                    <p className="text-xs italic text-text-secondary">"{s.note}"</p>
                  )}
                  <p className="text-xs text-text-muted">
                    <Clock size={9} className="mr-0.5 inline" />
                    {new Date(s.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                  <button
                    disabled={isPending}
                    onClick={() => act(s.id, 'approve', 'pending')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success/20 disabled:opacity-40"
                  >
                    <CheckCircle2 size={12} /> Approve
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => act(s.id, 'reject', 'pending')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red/30 bg-red/10 px-3 py-1.5 text-xs font-semibold text-red transition-colors hover:bg-red/20 disabled:opacity-40"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Recently reviewed ───────────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="card space-y-4 p-6">
          <h2 className="text-sm font-semibold text-text-primary">Recently Reviewed</h2>
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
                    <span className="text-xs text-text-muted">
                      Day {s.day_number} · {DOMAIN_LABEL[s.domain]}
                    </span>
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
