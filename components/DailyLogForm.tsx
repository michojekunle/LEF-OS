'use client';

import { useEffect, useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import type { DailyEntry } from '@/lib/utils';
import { isoDate } from '@/lib/utils';

type Props = {
  userId: string;
  day: number;
  date: Date;
  existing: DailyEntry | null;
  onSaved: (entry: DailyEntry) => void;
};

const MAX_JOURNAL = 500;
const MAX_INSIGHT = 280;

export function DailyLogForm({ userId, day, date, existing, onSaved }: Props) {
  const [studied, setStudied] = useState(
    Boolean(existing && (existing.law_completed || existing.economics_completed || existing.finance_completed)),
  );
  const [law, setLaw] = useState(existing?.law_completed ?? false);
  const [econ, setEcon] = useState(existing?.economics_completed ?? false);
  const [fin, setFin] = useState(existing?.finance_completed ?? false);
  const [rating, setRating] = useState<number>(existing?.study_rating ?? 0);
  const [journal, setJournal] = useState(existing?.journal_text ?? '');
  const [insight, setInsight] = useState(existing?.share_insight ?? '');
  const [isPublic, setIsPublic] = useState(existing?.is_public ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2400);
    return () => clearTimeout(t);
  }, [saved]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const sb = supabaseBrowser();
      const payload = {
        user_id: userId,
        entry_date: isoDate(date),
        day_number: day,
        law_completed: studied && law,
        economics_completed: studied && econ,
        finance_completed: studied && fin,
        study_rating: rating > 0 ? rating : null,
        journal_text: journal.trim() || null,
        share_insight: insight.trim() || null,
        is_public: isPublic && insight.trim().length > 0,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await sb
        .from('daily_entries')
        .upsert(payload, { onConflict: 'user_id,entry_date' })
        .select()
        .single();
      if (error) throw error;
      onSaved(data as DailyEntry);
      setSaved(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save entry';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-5">
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

      <fieldset disabled={!studied} className={!studied ? 'opacity-50 pointer-events-none' : ''}>
        <legend className="text-[10px] uppercase tracking-[0.18em] text-text-secondary mb-2">
          Domains completed
        </legend>
        <div className="flex flex-wrap gap-3">
          <DomainCheck label="⚖️ Law" checked={law} onChange={setLaw} />
          <DomainCheck label="📊 Economics" checked={econ} onChange={setEcon} />
          <DomainCheck label="💰 Finance" checked={fin} onChange={setFin} />
        </div>
      </fieldset>

      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-text-secondary mb-2">
          Depth — how deeply did you study?
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(rating === n ? 0 : n)}
              className="p-1 rounded hover:bg-surface-2 transition-colors"
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
            >
              <Star
                size={20}
                className={n <= rating ? 'fill-gold text-gold' : 'text-text-muted'}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="journal" className="text-[10px] uppercase tracking-[0.18em] text-text-secondary block mb-2">
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
        <div className="mt-1 text-[10px] text-text-muted tabular-nums text-right">
          {journal.length} / {MAX_JOURNAL}
        </div>
      </div>

      <div>
        <label htmlFor="insight" className="text-[10px] uppercase tracking-[0.18em] text-text-secondary block mb-2">
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
          <div className="text-[10px] text-text-muted tabular-nums">
            {insight.length} / {MAX_INSIGHT}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-xs accent-synthesis border border-accent-synthesis bg-accent-synthesis rounded-md p-2">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span
          className={`text-xs transition-opacity ${saved ? 'opacity-100 accent-econ' : 'opacity-0'}`}
        >
          ✓ Saved
        </span>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? (
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
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-all text-sm ${
        checked ? 'border-gold bg-accent-law text-text-primary' : 'border-border text-text-secondary'
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
