'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Loader2, Pencil, ChevronDown, Trash2 } from 'lucide-react';
import Link from 'next/link';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  dayNumber: number;
  domain: string;
  questionIndex: number;
  initialAnswer?: string;
  userId?: string;
};

const DEBOUNCE_MS = 1400;

export function QuestionAnswerInput({
  dayNumber,
  domain,
  questionIndex,
  initialAnswer = '',
  userId,
}: Props) {
  const [isOpen, setIsOpen] = useState(!!initialAnswer);
  const [text, setText] = useState(initialAnswer);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialAnswer);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  function resize(): void {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  const save = useCallback(
    async (value: string): Promise<void> => {
      if (value === lastSavedRef.current) return;
      if (!userId) return;

      setSaveState('saving');
      try {
        if (value.trim() === '') {
          // Delete blank answers
          const res = await fetch('/api/answers', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              day_number: dayNumber,
              domain,
              question_index: questionIndex,
            }),
          });
          if (!res.ok) throw new Error('delete failed');
        } else {
          const res = await fetch('/api/answers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              day_number: dayNumber,
              domain,
              question_index: questionIndex,
              answer: value.trim(),
            }),
          });
          if (!res.ok) throw new Error('save failed');
        }
        lastSavedRef.current = value;
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2500);
      } catch {
        setSaveState('error');
        setTimeout(() => setSaveState('idle'), 3000);
      }
    },
    [userId, dayNumber, domain, questionIndex],
  );

  // Debounced auto-save on text change
  useEffect(() => {
    if (!isOpen) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(text), DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, isOpen, save]);

  // Save immediately on unmount / tab close
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (text !== lastSavedRef.current) {
        void save(text);
      }
    };
  }, [text, save]);

  function open(): void {
    setIsOpen(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      resize();
    }, 0);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setText(e.target.value);
    resize();
  }

  // ── Collapsed (no answer yet) ─────────────────────────────────────
  if (!isOpen) {
    if (!userId) {
      return (
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-gold"
        >
          <Pencil size={11} />
          Sign in to write your answer
        </Link>
      );
    }

    return (
      <button
        onClick={open}
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-primary"
      >
        <Pencil size={11} />
        Write your answer
      </button>
    );
  }

  // ── Expanded ──────────────────────────────────────────────────────
  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">Your answer</span>
        <div className="flex items-center gap-2">
          {/* Save state indicator */}
          {saveState === 'saving' && (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Loader2 size={11} className="animate-spin" /> Saving…
            </span>
          )}
          {saveState === 'saved' && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check size={11} /> Saved
            </span>
          )}
          {saveState === 'error' && <span className="text-xs text-red">Save failed</span>}

          {/* Collapse */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-0.5 text-text-muted hover:text-text-primary"
            title="Collapse"
            aria-label="Collapse answer"
          >
            <ChevronDown size={13} />
          </button>

          {/* Clear */}
          {text.trim() && (
            <button
              onClick={() => {
                setText('');
                void save('');
              }}
              className="rounded p-0.5 text-text-muted hover:text-red"
              title="Clear answer"
              aria-label="Clear answer"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder="Write your answer here — it saves automatically…"
        rows={3}
        className="focus:ring-gold/30 w-full resize-none overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2.5 text-sm leading-relaxed text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-gold focus:ring-1"
        style={{ minHeight: '80px' }}
      />

      {!userId && (
        <p className="text-xs text-text-muted">
          <Link href="/login" className="text-gold hover:underline">
            Sign in
          </Link>{' '}
          to save your answers across sessions.
        </p>
      )}
    </div>
  );
}
