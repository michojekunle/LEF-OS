'use client';

import { useState } from 'react';
import { Plus, Link2, X, ChevronDown, Send, CheckCircle2 } from 'lucide-react';
import type { LefDomain, ResourceType } from '@/lib/database.types';
import { DOMAIN_LABELS } from '@/lib/domain';

type Props = {
  day: number;
  defaultDomain?: LefDomain;
  userId?: string;
};

const TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: 'video', label: '▶ Video' },
  { value: 'article', label: '📄 Article' },
  { value: 'tool', label: '🔧 Tool / App' },
  { value: 'other', label: '🔗 Other' },
];

export function ResourceSubmitForm({ day, defaultDomain = 'law', userId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [domain, setDomain] = useState<LefDomain>(defaultDomain);
  const [type, setType] = useState<ResourceType>('article');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting) return;

    setResult(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_number: day,
          domain,
          type,
          title: title.trim(),
          url: url.trim(),
          note: note.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (res.ok) {
        setResult({ ok: true, message: data.message ?? "Submitted! We'll review it shortly." });
        setTitle('');
        setUrl('');
        setNote('');
      } else {
        setResult({ ok: false, message: data.error ?? 'Submission failed. Please try again.' });
      }
    } catch {
      setResult({ ok: false, message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--border-subtle)] px-3 py-1.5 text-xs uppercase tracking-wider text-text-muted transition-colors hover:border-gold hover:text-gold"
      >
        <Plus size={11} />
        Suggest a resource
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 size={13} className="text-gold" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Suggest a resource for Day {day}
          </span>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            setResult(null);
          }}
          className="text-text-muted hover:text-text-primary"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {result?.ok ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={28} className="text-success" />
          <p className="text-xs text-text-primary">{result.message}</p>
          <button
            onClick={() => {
              setResult(null);
            }}
            className="text-xs uppercase tracking-wider text-gold hover:underline"
          >
            Submit another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Domain + Type row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-text-muted">Domain</label>
              <div className="relative">
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as LefDomain)}
                  className="w-full appearance-none rounded border border-[var(--border-subtle)] bg-surface-2 px-2.5 py-1.5 pr-7 text-xs text-text-primary outline-none focus:border-gold"
                >
                  {(Object.keys(DOMAIN_LABELS) as LefDomain[]).map((d) => (
                    <option key={d} value={d}>
                      {DOMAIN_LABELS[d]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-text-muted">Type</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ResourceType)}
                  className="w-full appearance-none rounded border border-[var(--border-subtle)] bg-surface-2 px-2.5 py-1.5 pr-7 text-xs text-text-primary outline-none focus:border-gold"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-text-muted">
              Title <span className="text-red/70">*</span>
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Contract Law Explained — Legal Eagle"
              maxLength={200}
              className="w-full rounded border border-[var(--border-subtle)] bg-surface-2 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-gold"
            />
          </div>

          {/* URL */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-text-muted">
              URL <span className="text-red/70">*</span>
            </label>
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              className="w-full rounded border border-[var(--border-subtle)] bg-surface-2 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-gold"
            />
          </div>

          {/* Optional note */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-text-muted">
              Why is this good? <span className="text-text-muted">(optional, max 500 chars)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief note on why this resource is helpful…"
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded border border-[var(--border-subtle)] bg-surface-2 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-gold"
            />
          </div>

          {result && !result.ok && <p className="text-sm text-red">{result.message}</p>}

          <div className="flex items-center justify-between pt-1">
            {!userId && (
              <p className="text-xs text-text-muted">
                Submitted anonymously —{' '}
                <a href="/login" className="text-gold hover:underline">
                  sign in
                </a>{' '}
                to track yours.
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || !title.trim() || !url.trim()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={11} />
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
