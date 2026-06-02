'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Check, Loader2, HelpCircle, BookOpen } from 'lucide-react';
import type { DailyEntry, DayNote, LefDomain, Question } from '@/lib/database.types';
import { DOMAIN_META } from '@/components/curriculum-data';
import { DailyLogForm } from '@/components/DailyLogForm';
import { upsertDayNoteAction } from '@/app/actions/notes';
import {
  addQuestionAction,
  answerQuestionAction,
  deleteQuestionAction,
} from '@/app/actions/questions';
import { useToast } from '@/components/Toast';

type Props = {
  userId: string;
  day: number;
  date: Date;
  existing: DailyEntry | null;
  initialNotes: DayNote[];
  initialQuestions: Question[];
};

export function DayLogPanel({
  userId,
  day,
  date,
  existing,
  initialNotes,
  initialQuestions,
}: Props) {
  const [entry, setEntry] = useState<DailyEntry | null>(existing);
  const [notes, setNotes] = useState<Record<LefDomain, string>>({
    law: initialNotes.find((n) => n.domain === 'law')?.body ?? '',
    economics: initialNotes.find((n) => n.domain === 'economics')?.body ?? '',
    finance: initialNotes.find((n) => n.domain === 'finance')?.body ?? '',
  });
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
          {entry ? 'Edit log' : 'Log this day'}
        </h2>
        <DailyLogForm
          userId={userId}
          day={day}
          date={date}
          existing={entry}
          onSaved={setEntry}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-text-secondary" />
          <h2 className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            Per-domain notes · private
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {(['law', 'economics', 'finance'] as LefDomain[]).map((d) => (
            <NoteEditor
              key={d}
              day={day}
              domain={d}
              value={notes[d]}
              onChange={(v) => setNotes((n) => ({ ...n, [d]: v }))}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-text-secondary" />
          <h2 className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            Questions to research
          </h2>
        </div>
        <QuestionStack
          day={day}
          questions={questions}
          setQuestions={setQuestions}
        />
      </section>
    </div>
  );
}

function NoteEditor({
  day,
  domain,
  value,
  onChange,
}: {
  day: number;
  domain: LefDomain;
  value: string;
  onChange: (v: string) => void;
}) {
  const meta = DOMAIN_META[domain];
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  function save() {
    start(async () => {
      const res = await upsertDayNoteAction({
        day_number: day,
        domain,
        body: value,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  }

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <span>{meta.icon}</span> {meta.label}
        </span>
        {saved && <span className="text-[10px] accent-econ">✓ saved</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 8000))}
        onBlur={() => {
          if (value !== '') save();
          else save();
        }}
        className="textarea text-sm"
        rows={5}
        placeholder={`What landed today on ${meta.label.toLowerCase()}?`}
      />
      <div className="flex items-center justify-between text-[10px] text-text-muted tabular-nums">
        <span>{pending ? 'Saving…' : 'Autosaves on blur'}</span>
        <span>{value.length} / 8000</span>
      </div>
    </div>
  );
}

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
    <div className="card p-4 space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          placeholder="What do you want to research later?"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="btn btn-primary shrink-0"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
      </form>
      {questions.length === 0 ? (
        <p className="text-xs text-text-muted italic">No questions yet for this day.</p>
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              onUpdated={(qx) =>
                setQuestions((qs) => qs.map((x) => (x.id === q.id ? qx : x)))
              }
              onDeleted={() =>
                setQuestions((qs) => qs.filter((x) => x.id !== q.id))
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

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
    <li className="card-2 p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-sm flex-1 ${
            question.answered ? 'text-text-muted line-through' : 'text-text-primary'
          }`}
        >
          {question.body}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-text-muted hover:text-gold transition-colors"
            aria-label="Answer"
            title="Add answer"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-text-muted hover:accent-synthesis transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {editing && (
        <div className="space-y-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value.slice(0, 4000))}
            placeholder="Once you've researched it, write what you learned…"
            className="textarea text-sm"
            rows={3}
          />
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={saveAnswer}
              disabled={pending}
              className="btn btn-primary text-xs"
            >
              {pending ? <Loader2 size={12} className="animate-spin" /> : null}
              Save answer
            </button>
          </div>
        </div>
      )}
      {!editing && question.answer && (
        <p className="text-xs text-text-secondary border-l-2 border-border pl-3 whitespace-pre-wrap">
          {question.answer}
        </p>
      )}
    </li>
  );
}
