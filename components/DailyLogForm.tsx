'use client';

import { useEffect, useState, useTransition } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import type { DailyEntry } from '@/lib/utils';
import { isoDate } from '@/lib/utils';
import { upsertEntryAction } from '@/app/actions/entries';
import { useToast } from './Toast';

type Props = {
  userId: string;
  day: number;
  date: Date;
  existing: DailyEntry | null;
  onSaved: (entry: DailyEntry) => void;
  /** Only show checkboxes for these domains. Defaults to all three. */
  preferredDomains?: string[];
};

const MAX_JOURNAL = 4000;
const MAX_INSIGHT = 280;

export function DailyLogForm({ day, date, existing, onSaved, preferredDomains }: Props) {
  const [studied, setStudied] = useState(
    Boolean(
      existing &&
      (existing.law_completed || existing.economics_completed || existing.finance_completed),
    ),
  );
  const [law, setLaw] = useState(existing?.law_completed ?? false);
  const [econ, setEcon] = useState(existing?.economics_completed ?? false);
  const [fin, setFin] = useState(existing?.finance_completed ?? false);
  const [rating, setRating] = useState<number>(existing?.study_rating ?? 0);
  const [journal, setJournal] = useState(existing?.journal_text ?? '');
  const [insight, setInsight] = useState(existing?.share_insight ?? '');
  const [isPublic, setIsPublic] = useState(existing?.is_public ?? false);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2400);
    return () => clearTimeout(t);
  }, [saved]);

  function markAll() {
    setStudied(true);
    if (!preferredDomains || preferredDomains.includes('law')) setLaw(true);
    if (!preferredDomains || preferredDomains.includes('economics')) setEcon(true);
    if (!preferredDomains || preferredDomains.includes('finance')) setFin(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await upsertEntryAction({
        entry_date: isoDate(date),
        day_number: day,
        law_completed: studied && law,
        economics_completed: studied && econ,
        finance_completed: studied && fin,
        study_rating: rating > 0 ? rating : null,
        journal_text: journal.trim() || null,
        share_insight: insight.trim() || null,
        is_public: isPublic && insight.trim().length > 0,
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      onSaved(res.data);
      setSaved(true);
      toast.success(`Day ${day} logged`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            id="studied"
            type="checkbox"
            checked={studied}
            onChange={(e) => setStudied(e.target.checked)}
            className="h-4 w-4 accent-[var(--gold)]"
          />
          <label htmlFor="studied" className="text-sm font-medium">
            Studied today
          </label>
        </div>
        <button
          type="button"
          onClick={markAll}
          className="text-xs uppercase tracking-[0.18em] text-text-secondary transition-colors hover:text-gold"
        >
          Mark all 3
        </button>
      </div>

      <fieldset disabled={!studied} className={!studied ? 'pointer-events-none opacity-50' : ''}>
        <legend className="mb-2 text-xs uppercase tracking-[0.18em] text-text-secondary">
          Domains completed
        </legend>
        <div className="flex flex-wrap gap-3">
          {(!preferredDomains || preferredDomains.includes('law')) && (
            <DomainCheck label="⚖️ Law" checked={law} onChange={setLaw} />
          )}
          {(!preferredDomains || preferredDomains.includes('economics')) && (
            <DomainCheck label="📊 Economics" checked={econ} onChange={setEcon} />
          )}
          {(!preferredDomains || preferredDomains.includes('finance')) && (
            <DomainCheck label="💰 Finance" checked={fin} onChange={setFin} />
          )}
        </div>
      </fieldset>

      <div>
        <div className="mb-2 text-xs uppercase tracking-[0.18em] text-text-secondary">
          Depth — how deeply did you study?
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(rating === n ? 0 : n)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2.5 transition-colors hover:bg-surface-2"
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              data-tour-action="star-rating"
            >
              <Star size={22} className={n <= rating ? 'fill-gold text-gold' : 'text-text-muted'} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="journal"
          className="mb-2 block text-xs uppercase tracking-[0.18em] text-text-secondary"
        >
          What did I learn today?
        </label>
        <textarea
          id="journal"
          value={journal}
          onChange={(e) => setJournal(e.target.value.slice(0, MAX_JOURNAL))}
          className="textarea"
          rows={4}
          placeholder="Private. For your future self."
        />
        <div className="mt-1 text-right text-xs tabular-nums text-text-muted">
          {journal.length} / {MAX_JOURNAL}
        </div>
      </div>

      <div>
        <label
          htmlFor="insight"
          className="mb-2 block text-xs uppercase tracking-[0.18em] text-text-secondary"
        >
          My insight to share
        </label>
        <textarea
          id="insight"
          value={insight}
          onChange={(e) => setInsight(e.target.value.slice(0, MAX_INSIGHT))}
          className="textarea"
          rows={3}
          placeholder="Tweet-length. One thing worth saying."
        />
        <div className="mt-1 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={insight.trim().length === 0}
              className="h-3.5 w-3.5 accent-[var(--gold)]"
            />
            Make public on /journal
          </label>
          <div className="text-xs tabular-nums text-text-muted">
            {insight.length} / {MAX_INSIGHT}
          </div>
        </div>
      </div>

      {error && (
        <div className="accent-synthesis border-accent-synthesis bg-accent-synthesis rounded-md border p-2 text-xs">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span
          className={`text-xs transition-opacity ${saved ? 'accent-econ opacity-100' : 'opacity-0'}`}
        >
          ✓ Saved
        </span>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving
            </>
          ) : (
            <>
              <Send size={14} /> Log day {day}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function DomainCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-all ${
        checked
          ? 'bg-accent-law border-gold text-text-primary'
          : 'border-border text-text-secondary'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-[var(--gold)]"
      />
      {label}
    </label>
  );
}
