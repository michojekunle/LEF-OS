'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Check, Loader2, HelpCircle, BookOpen } from 'lucide-react';
import type { DailyEntry, DayNote, LefDomain, Question } from '@/lib/database.types';
import { DOMAIN_META, LEF_DOMAINS } from '@/data/curriculum-data';
import { DailyLogForm } from '@/components/DailyLogForm';
import { upsertDayNoteAction } from '@/app/actions/notes';
import {
  addQuestionAction,
  answerQuestionAction,
  deleteQuestionAction,
} from '@/app/actions/questions';
import { useToast } from '@/components/Toast';
import { checkNotesAchievement } from '@/lib/achievements';

type Props = {
  userId: string;
  day: number;
  date: Date;
  existing: DailyEntry | null;
  initialNotes: DayNote[];
  initialQuestions: Question[];
  /** Called with newly earned achievement types after a note saves */
  onAchievements?: (types: import('@/lib/achievements').Achievement[]) => void;
};

export function DayLogPanel({
  userId,
  day,
  date,
  existing,
  initialNotes,
  initialQuestions,
  onAchievements,
}: Props) {
  const [entry, setEntry] = useState<DailyEntry | null>(existing);
  const [notes, setNotes] = useState<Record<LefDomain, string>>({
    law: initialNotes.find((n) => n.domain === 'law')?.body ?? '',
    economics: initialNotes.find((n) => n.domain === 'economics')?.body ?? '',
    finance: initialNotes.find((n) => n.domain === 'finance')?.body ?? '',
  });

  function handleNoteSaved(domain: LefDomain, value: string) {
    const updated = { ...notes, [domain]: value };
    setNotes(updated);
    const earned = checkNotesAchievement(day, updated.law, updated.economics, updated.finance);
    for (const a of earned) {
      window.dispatchEvent(new CustomEvent('lef-achievement', { detail: a }));
    }
    // Also call optional prop for callers that want to handle it locally
    if (onAchievements && earned.length > 0) onAchievements(earned);
  }
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  // Mobile tab: which domain is active in the note switcher
  const [activeTab, setActiveTab] = useState<LefDomain>('law');

  return (
    <div className="space-y-8">
      {/* ── Log form ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          {entry ? 'Edit log' : 'Log this day'}
        </h2>
        <DailyLogForm userId={userId} day={day} date={date} existing={entry} onSaved={setEntry} />
      </section>

      {/* ── Per-domain notes ───────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-text-secondary" />
          <h2 className="text-xs uppercase tracking-[0.18em] text-text-secondary">
            Per-domain notes · private
          </h2>
        </div>

        {/* Mobile: tab switcher */}
        <div className="md:hidden">
          {/* Domain tabs */}
          <div className="mb-3 flex overflow-hidden rounded-lg border border-[var(--border-subtle)]">
            {LEF_DOMAINS.map((d) => {
              const meta = DOMAIN_META[d];
              const active = activeTab === d;
              const accentClass =
                d === 'law'
                  ? 'text-gold border-gold bg-gold/10'
                  : d === 'economics'
                    ? 'text-sage border-sage bg-sage/10'
                    : 'text-slate-blue border-slate-blue bg-slate-blue/10';
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveTab(d)}
                  className={`flex flex-1 items-center justify-center gap-1.5 border-r border-[var(--border-subtle)] py-2.5 text-xs font-medium transition-colors last:border-r-0 ${
                    active ? accentClass : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span className="hidden xs:inline">{meta.label}</span>
                  <span className="xs:hidden">{meta.label.slice(0, 3)}</span>
                </button>
              );
            })}
          </div>
          {/* Active domain editor */}
          <NoteEditor
            key={activeTab}
            day={day}
            domain={activeTab}
            value={notes[activeTab]}
            onChange={(v) => setNotes((n) => ({ ...n, [activeTab]: v }))}
            onSaved={(v) => handleNoteSaved(activeTab, v)}
          />
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden gap-3 md:grid md:grid-cols-3">
          {LEF_DOMAINS.map((d) => (
            <NoteEditor
              key={d}
              day={day}
              domain={d}
              value={notes[d]}
              onChange={(v) => setNotes((n) => ({ ...n, [d]: v }))}
              onSaved={(v) => handleNoteSaved(d, v)}
            />
          ))}
        </div>
      </section>

      {/* ── Questions ──────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-text-secondary" />
          <h2 className="text-xs uppercase tracking-[0.18em] text-text-secondary">
            Questions to research
          </h2>
        </div>
        <QuestionStack day={day} questions={questions} setQuestions={setQuestions} />
      </section>
    </div>
  );
}

/* ── NoteEditor ────────────────────────────────────────────────────── */
function NoteEditor({
  day,
  domain,
  value,
  onChange,
  onSaved,
}: {
  day: number;
  domain: LefDomain;
  value: string;
  onChange: (v: string) => void;
  onSaved?: (v: string) => void;
}) {
  const meta = DOMAIN_META[domain];
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  function save() {
    start(async () => {
      const res = await upsertDayNoteAction({ day_number: day, domain, body: value });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      onSaved?.(value);
    });
  }

  return (
    <div className="card flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <span>{meta.icon}</span> {meta.label}
        </span>
        {saved && <span className="accent-econ text-xs">✓ saved</span>}
        {pending && <span className="text-xs text-text-muted">Saving…</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 8000))}
        onBlur={save}
        className="textarea text-sm"
        rows={6}
        placeholder={`What landed today on ${meta.label.toLowerCase()}?`}
      />
      <div className="flex items-center justify-between text-xs tabular-nums text-text-muted">
        <span>Autosaves on blur</span>
        <span>{value.length} / 8000</span>
      </div>
    </div>
  );
}

/* ── QuestionStack ─────────────────────────────────────────────────── */
function QuestionStack({
  day,
  questions,
  setQuestions,
}: {
  day: number;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}) {
  const [text, setText] = useState('');
  const [pending, start] = useTransition();
  const toast = useToast();

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    start(async () => {
      const res = await addQuestionAction({ body: text.trim(), day_number: day });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setQuestions((qs) => [res.data, ...qs]);
      setText('');
      toast.success('Question captured');
    });
  }

  return (
    <div className="card space-y-4 p-4">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          placeholder="What do you want to research later?"
          className="input min-w-0 flex-1"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="btn btn-primary shrink-0 px-3"
          aria-label="Add question"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>
      {questions.length === 0 ? (
        <p className="py-2 text-xs italic text-text-muted">No questions yet for this day.</p>
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              onUpdated={(qx) => setQuestions((qs) => qs.map((x) => (x.id === q.id ? qx : x)))}
              onDeleted={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── QuestionRow ───────────────────────────────────────────────────── */
function QuestionRow({
  question,
  onUpdated,
  onDeleted,
}: {
  question: Question;
  onUpdated: (q: Question) => void;
  onDeleted: () => void;
}) {
  const [answer, setAnswer] = useState(question.answer ?? '');
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();

  function saveAnswer() {
    start(async () => {
      const res = await answerQuestionAction({ id: question.id, answer });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onUpdated(res.data);
      setEditing(false);
      toast.success('Answer saved');
    });
  }

  function remove() {
    start(async () => {
      const res = await deleteQuestionAction(question.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onDeleted();
    });
  }

  return (
    <li className="card-2 flex flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-3">
        <p
          className={`flex-1 text-sm leading-snug ${
            question.answered ? 'text-text-muted line-through' : 'text-text-primary'
          }`}
        >
          {question.body}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`rounded-md p-1.5 transition-colors ${
              editing
                ? 'bg-gold/10 text-gold'
                : 'text-text-muted hover:bg-surface-2 hover:text-gold'
            }`}
            aria-label="Answer this question"
            title="Add answer"
          >
            <Check size={13} />
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-red"
            aria-label="Delete question"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {editing && (
        <div className="space-y-2 pt-1">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value.slice(0, 4000))}
            placeholder="Write what you learned after researching…"
            className="textarea text-sm"
            rows={3}
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn btn-ghost px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveAnswer}
              disabled={pending}
              className="btn btn-primary px-3 py-1.5 text-xs"
            >
              {pending ? <Loader2 size={12} className="animate-spin" /> : null}
              Save answer
            </button>
          </div>
        </div>
      )}
      {!editing && question.answer && (
        <p className="whitespace-pre-wrap border-l-2 border-border pl-3 text-xs leading-relaxed text-text-secondary">
          {question.answer}
        </p>
      )}
    </li>
  );
}
