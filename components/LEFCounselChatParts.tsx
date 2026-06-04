'use client';

import { useState, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { MarkdownText } from './MarkdownText';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

/* ── Quiz types ────────────────────────────────────────────────────── */
type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

type QuizData = {
  type: 'quiz';
  questions: QuizQuestion[];
};

/* ── Quiz extraction ───────────────────────────────────────────────── */

/**
 * Try to pull a quiz JSON block out of raw AI text.
 * Returns { quiz, prose } — prose is any surrounding text, quiz is null if not found.
 */
function extractQuiz(content: string): { quiz: QuizData | null; prose: string } {
  const fenceRe = /```json\s*([\s\S]*?)```/i;
  const match = fenceRe.exec(content);
  if (!match) return { quiz: null, prose: content };

  try {
    const parsed = JSON.parse(match[1]) as unknown;
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'type' in parsed &&
      (parsed as Record<string, unknown>).type === 'quiz' &&
      Array.isArray((parsed as Record<string, unknown>).questions)
    ) {
      const prose = content.replace(match[0], '').trim();
      return { quiz: parsed as QuizData, prose };
    }
  } catch {
    // Not valid JSON — fall through
  }
  return { quiz: null, prose: content };
}

/* ── QuizBlock component ───────────────────────────────────────────── */
function QuizBlock({ quiz }: { quiz: QuizData }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  function pick(qIdx: number, optIdx: number): void {
    // Lock once answered
    if (qIdx in answers) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  }

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = Object.entries(answers).filter(
    ([qIdx, optIdx]) => quiz.questions[parseInt(qIdx, 10)].answerIndex === optIdx,
  ).length;

  return (
    <div className="space-y-5">
      {quiz.questions.map((q, qIdx) => {
        const chosen = answers[qIdx] ?? null;
        const isAnswered = chosen !== null;

        return (
          <div key={qIdx} className="space-y-2.5">
            {/* Question */}
            <p className="text-xs font-semibold leading-snug text-text-primary">
              <span className="mr-1.5 text-xs uppercase tracking-wider text-text-muted">
                Q{qIdx + 1}.
              </span>
              {q.question}
            </p>

            {/* Options */}
            <div className="space-y-1.5">
              {q.options.map((opt, optIdx) => {
                const isCorrect = optIdx === q.answerIndex;
                const isChosen = chosen === optIdx;

                let optClass =
                  'w-full text-left px-3 py-2 rounded-md border text-sm leading-snug transition-all ';

                if (!isAnswered) {
                  optClass +=
                    'border-border bg-surface-2/40 text-text-primary hover:border-gold/50 hover:bg-surface-2/70 cursor-pointer';
                } else if (isCorrect) {
                  optClass += 'border-success/50 bg-success/10 text-text-primary cursor-default';
                } else if (isChosen) {
                  optClass +=
                    'border-red/50 bg-accent-synthesis/20 text-text-primary cursor-default';
                } else {
                  optClass +=
                    'border-border bg-transparent text-text-muted cursor-default opacity-60';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => pick(qIdx, optIdx)}
                    className={optClass}
                  >
                    <span className="flex items-start gap-2">
                      <span className="mt-px shrink-0 text-xs font-bold uppercase text-text-muted">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 size={13} className="mt-px shrink-0 text-success" />
                      )}
                      {isAnswered && isChosen && !isCorrect && (
                        <XCircle size={13} className="mt-px shrink-0 text-red" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation after answering */}
            {isAnswered && (
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2-overlay)] px-3 py-2 text-xs leading-relaxed text-text-secondary">
                <span className="font-semibold text-text-primary">Explanation: </span>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {/* Score summary when all answered */}
      {totalAnswered === quiz.questions.length && (
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
          <p className="text-sm text-text-secondary">
            Score:{' '}
            <span className="font-bold text-text-primary">
              {totalCorrect}/{quiz.questions.length}
            </span>
          </p>
          <span
            className={`text-xs font-semibold uppercase tracking-wide ${
              totalCorrect === quiz.questions.length
                ? 'text-success'
                : totalCorrect >= quiz.questions.length / 2
                  ? 'text-gold'
                  : 'text-red'
            }`}
          >
            {totalCorrect === quiz.questions.length
              ? 'Perfect!'
              : totalCorrect >= quiz.questions.length / 2
                ? 'Good work'
                : 'Keep studying'}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── AssistantMessage ──────────────────────────────────────────────── */
type AssistantMessageProps = {
  content: string;
  isLatest: boolean;
  onWordAdded?: () => void;
  onFinished?: () => void;
};

/**
 * Wrapper that delegates to QuizMessage or TypewriterText.
 * No hooks here — avoids hooks-in-conditional violations.
 */
export function AssistantMessage({
  content,
  isLatest,
  onWordAdded,
  onFinished,
}: AssistantMessageProps) {
  const { quiz, prose } = extractQuiz(content);

  if (quiz) {
    return <QuizMessage quiz={quiz} prose={prose} onFinished={onFinished} />;
  }

  return (
    <TypewriterText
      content={content}
      isLatest={isLatest}
      onWordAdded={onWordAdded}
      onFinished={onFinished}
    />
  );
}

/** Renders a quiz and notifies parent when mount is done (no animation needed). */
function QuizMessage({
  quiz,
  prose,
  onFinished,
}: {
  quiz: QuizData;
  prose: string;
  onFinished?: () => void;
}) {
  useEffect(() => {
    onFinished?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      {prose && <MarkdownText text={prose} />}
      <QuizBlock quiz={quiz} />
    </div>
  );
}

function TypewriterText({ content, isLatest, onWordAdded, onFinished }: AssistantMessageProps) {
  const [displayedText, setDisplayedText] = useState(isLatest ? '' : content);

  useEffect(() => {
    if (!isLatest) {
      setDisplayedText(content);
      return;
    }

    const words = content.split(' ');
    let currentWordIndex = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (currentWordIndex >= words.length) {
        clearInterval(interval);
        onFinished?.();
        return;
      }

      setDisplayedText(() => {
        const next = words.slice(0, currentWordIndex + 1).join(' ');
        currentWordIndex++;
        return next;
      });

      onWordAdded?.();
    }, 20);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, isLatest]);

  return <MarkdownText text={displayedText} />;
}

/* ── GuestOnboarding ───────────────────────────────────────────────── */
export function GuestOnboarding() {
  return (
    <div className="my-auto flex h-full flex-col items-center justify-center space-y-4 p-6 text-center">
      <div className="bg-gold/10 border-gold/30 flex h-12 w-12 items-center justify-center rounded-full border">
        <Sparkles size={20} className="text-gold" />
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
          Consult LEF Counsel
        </h3>
        <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-text-secondary">
          Sign in to consult LEF Counsel, get personalised study help, practice with interactive
          quizzes, and save your academic notes.
        </p>
      </div>
      <Link
        href="/login"
        className="btn btn-primary mt-4 w-full py-2 text-center text-xs font-semibold"
      >
        Sign In to Start
      </Link>
    </div>
  );
}

/* ── ChatBody ──────────────────────────────────────────────────────── */
type BodyProps = {
  messages: Message[];
  starterPills: { label: string; query: string }[];
  loading: boolean;
  error: string | null;
  onPillClick: (q: string) => void;
  /** Ref to the overflow-y-auto container — parent scrolls this div,
   *  never the page viewport. */
  containerRef: React.RefObject<HTMLDivElement>;
  userId?: string;
  onWordAdded?: () => void;
  animatedIndices: number[];
  onMessageAnimated: (idx: number) => void;
};

export function ChatBody({
  messages,
  starterPills,
  loading,
  error,
  onPillClick,
  containerRef,
  userId,
  onWordAdded,
  animatedIndices,
  onMessageAnimated,
}: BodyProps) {
  if (!userId) {
    return <GuestOnboarding />;
  }

  return (
    <div ref={containerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-2">
            <MessageSquare size={16} className="text-gold" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-primary">Chat with LEF Counsel</p>
            <p className="mt-1 max-w-[240px] text-sm leading-relaxed text-text-secondary">
              Ask questions, request examples, or take a quick quiz based on your curriculum.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 pt-2">
            {starterPills.map((pill) => (
              <button
                key={pill.label}
                onClick={() => onPillClick(pill.query)}
                className="bg-surface-2/40 rounded-lg border border-border px-3 py-2 text-left text-xs leading-normal text-text-secondary transition-all hover:border-gold hover:text-text-primary"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <span className="mb-0.5 px-1 text-xs uppercase tracking-wider text-text-muted">
              {m.role === 'user' ? 'You' : 'LEF Counsel'}
            </span>
            <div
              className={`max-w-[88%] rounded-lg p-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gold/10 border-gold/20 whitespace-pre-wrap border text-text-primary'
                  : 'w-full border border-border bg-surface-2 text-text-primary'
              }`}
            >
              {m.role === 'user' ? (
                m.content
              ) : (
                <AssistantMessage
                  content={m.content}
                  isLatest={idx === messages.length - 1 && !animatedIndices.includes(idx)}
                  onWordAdded={onWordAdded}
                  onFinished={() => onMessageAnimated(idx)}
                />
              )}
            </div>
          </div>
        ))
      )}

      {loading && (
        <div className="flex flex-col items-start">
          <span className="mb-0.5 px-1 text-xs uppercase tracking-wider text-text-muted">
            LEF Counsel
          </span>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-accent-synthesis/20 rounded-md border border-border p-2.5 text-xs leading-relaxed text-red">
          {error}
        </div>
      )}
    </div>
  );
}

/* ── ChatInput ─────────────────────────────────────────────────────── */
type InputProps = {
  input: string;
  loading: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
};

export function ChatInput({ input, loading, onChange, onSubmit }: InputProps) {
  return (
    <div className="bg-surface-2/20 flex gap-2 border-t border-border px-4 py-3">
      <input
        type="text"
        value={input}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSubmit()}
        placeholder="Ask LEF Counsel a question…"
        className="flex-1 rounded border border-border bg-transparent px-2.5 py-2 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-text-primary"
        aria-label="Type your question to LEF Counsel"
      />
      <button
        onClick={onSubmit}
        disabled={loading || !input.trim()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-text-primary text-bg transition-colors hover:bg-gold hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Send message"
      >
        <Send size={12} />
      </button>
    </div>
  );
}
