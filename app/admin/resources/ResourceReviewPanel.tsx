'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, XCircle, ExternalLink, Clock, Flag, Trash2 } from 'lucide-react';
import type { LefDomain, ResourceSubmission } from '@/lib/database.types';
import { DOMAIN_LABELS_SHORT } from '@/lib/domain';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ResourceTypeIcon } from '@/components/ui/ResourceTypeIcon';

type FlaggedSubmission = ResourceSubmission & { flag_count: number };

type Props = {
  pending: ResourceSubmission[];
  flagged: FlaggedSubmission[];
  recent: ResourceSubmission[];
};

export function ResourceReviewPanel({ pending: initialPending, flagged: initialFlagged, recent: initialRecent }: Props) {
  const [pending, setPending]   = useState(initialPending);
  const [flagged, setFlagged]   = useState(initialFlagged);
  const [recent, setRecent]     = useState(initialRecent);
  const [isPending, startTransition] = useTransition();
  const [error, setError]       = useState<string | null>(null);

  async function act(id: string, action: 'approve' | 'reject' | 'remove', from: 'pending' | 'flagged'): Promise<void> {
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

      const source = from === 'pending' ? pending : (flagged as ResourceSubmission[]);
      const submission = source.find((s) => s.id === id);
      if (submission) {
        const updated: ResourceSubmission = {
          ...submission,
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
        };
        if (from === 'pending') setPending((p) => p.filter((s) => s.id !== id));
        else setFlagged((f) => f.filter((s) => s.id !== id));
        setRecent((r) => [updated, ...r].slice(0, 20));
      }
    });
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red">{error}</p>}

      {/* ── Flagged (priority) ───────────────────────────────────────── */}
      {flagged.length > 0 && (
        <section className="card p-6">
          <SectionHeader
            title={<span className="flex items-center gap-2"><Flag size={14} className="text-red" /> Flagged by Users</span>}
            subtitle="Automatically hidden after reaching the flag threshold. Remove or reinstate."
            aside={<Badge variant="danger">{flagged.length}</Badge>}
          />
          <SubmissionList items={flagged} showFlags onAct={(id, action) => act(id, action, 'flagged')} disabled={isPending} />
        </section>
      )}

      {/* ── Pending ─────────────────────────────────────────────────── */}
      <section className="card p-6">
        <SectionHeader
          title="Pending Review"
          aside={pending.length > 0 ? <Badge variant="gold">{pending.length}</Badge> : undefined}
        />
        {pending.length === 0 ? (
          <p className="text-sm text-text-secondary">No new submissions awaiting review.</p>
        ) : (
          <SubmissionList items={pending} onAct={(id, action) => act(id, action, 'pending')} disabled={isPending} />
        )}
      </section>

      {/* ── Recently reviewed ───────────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="card p-6">
          <SectionHeader title="Recently Reviewed" />
          <ul className="divide-y divide-[var(--border-subtle)]">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === 'approved' ? 'success' : 'danger'}>{s.status}</Badge>
                    <span className="text-xs text-text-muted">Day {s.day_number} · {DOMAIN_LABELS_SHORT[s.domain as LefDomain]}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-text-primary">{s.title}</p>
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-text-muted hover:text-gold">
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

type SubmissionListProps = {
  items: (ResourceSubmission & { flag_count?: number })[];
  onAct: (id: string, action: 'approve' | 'reject' | 'remove') => void;
  disabled: boolean;
  showFlags?: boolean;
};

function SubmissionList({ items, onAct, disabled, showFlags }: SubmissionListProps) {
  return (
    <ul className="divide-y divide-[var(--border-subtle)]">
      {items.map((s) => (
        <li key={s.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {showFlags && s.flag_count != null && (
                <Badge variant="danger">⚑ {s.flag_count} flag{s.flag_count !== 1 ? 's' : ''}</Badge>
              )}
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <ResourceTypeIcon type={s.type} size={11} />
                {s.type}
              </span>
              <span className="text-xs text-text-muted">Day {s.day_number} · {DOMAIN_LABELS_SHORT[s.domain as LefDomain]}</span>
            </div>

            <p className="text-sm font-medium text-text-primary">{s.title}</p>

            <a href={s.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gold hover:underline">
              {s.url.length > 70 ? `${s.url.slice(0, 70)}…` : s.url}
              <ExternalLink size={10} />
            </a>

            {s.note && <p className="text-xs italic text-text-secondary">"{s.note}"</p>}

            {!showFlags && (
              <p className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={9} />
                {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
            {showFlags ? (
              <>
                <ActionBtn variant="danger" icon={<Trash2 size={12} />} disabled={disabled} onClick={() => onAct(s.id, 'remove')}>Remove</ActionBtn>
                <ActionBtn variant="ghost"  icon={<CheckCircle2 size={12} />} disabled={disabled} onClick={() => onAct(s.id, 'approve')}>Keep it</ActionBtn>
              </>
            ) : (
              <>
                <ActionBtn variant="success" icon={<CheckCircle2 size={12} />} disabled={disabled} onClick={() => onAct(s.id, 'approve')}>Approve</ActionBtn>
                <ActionBtn variant="danger"  icon={<XCircle size={12} />}      disabled={disabled} onClick={() => onAct(s.id, 'reject')}>Reject</ActionBtn>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

type ActionBtnProps = {
  variant: 'success' | 'danger' | 'ghost';
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const ACTION_CLASSES: Record<ActionBtnProps['variant'], string> = {
  success: 'border-success/40 bg-success/10 text-success hover:bg-success/20',
  danger:  'border-red/30    bg-red/10    text-red    hover:bg-red/20',
  ghost:   'border-[var(--border-subtle)] text-text-secondary hover:border-success hover:text-success',
};

function ActionBtn({ variant, icon, disabled, onClick, children }: ActionBtnProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${ACTION_CLASSES[variant]}`}
    >
      {icon} {children}
    </button>
  );
}
