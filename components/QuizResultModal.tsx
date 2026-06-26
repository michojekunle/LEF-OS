'use client';

import { useEffect, useRef } from 'react';
import { X, RefreshCw, Zap, Target, Brain, FileText } from 'lucide-react';

const CONFETTI_COLOURS = [
  '#c9ab70',
  '#80a394',
  '#8fa3d0',
  '#cc7272',
  '#72a880',
  '#ede8e0',
  '#c9ab70',
  '#8fa3d0',
  '#80a394',
];

type Props = {
  /** Number of questions the user answered */
  answered: number;
  /** Total questions available */
  total: number;
  /** Name of the topic/domain for context */
  topic: string;
  /** Called when "Try Again / More Questions" is requested — should trigger a LEFCounsel prompt */
  onMoreQuestions: (prompt: string) => void;
  onDismiss: () => void;
};

export function QuizResultModal({ answered, total, topic, onMoreQuestions, onDismiss }: Props) {
  const isPerfect = answered === total && total > 0;
  const isAttempted = answered > 0;
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onDismiss();
  }

  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

  const Icon = isPerfect ? Target : isAttempted ? Brain : FileText;
  const title = isPerfect ? 'Perfect score!' : isAttempted ? 'Quiz attempted!' : 'Quiz started';
  const subtitle = isPerfect
    ? `You answered all ${total} questions on ${topic}.`
    : `${answered} of ${total} questions answered on ${topic}.`;

  // IMPORTANT: prompts must contain the word "quiz" and explicitly request the
  // JSON format — the system prompt in /api/ai/chat only emits the JSON quiz
  // block when the user asks for a "quiz". Saying "questions" alone produces
  // a wall of prose instead of an interactive quiz.
  const tryAgainPrompt =
    `Generate another quick ${total}-question multiple-choice quiz on "${topic}". ` +
    `Make these different from previous questions and mix in harder angles and edge cases. ` +
    `Respond strictly with the JSON quiz format inside a \`\`\`json block — no other text.`;

  const challengePrompt =
    `Generate a challenging ${total}-question multiple-choice quiz on "${topic}". ` +
    `Go deeper than the previous quiz — application scenarios, edge cases, and cross-domain ` +
    `connections to Economics and Finance. ` +
    `Respond strictly with the JSON quiz format inside a \`\`\`json block — no other text.`;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      {/* Confetti — pops in then falls past the bottom with rotation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 36 }).map((_, i) => {
          const colour = CONFETTI_COLOURS[i % CONFETTI_COLOURS.length];
          // Pseudo-random horizontal drift so pieces fan out as they fall
          const driftX = ((i * 53) % 280) - 140; // -140 to 140 px
          return (
            <span
              key={i}
              className="animate-confetti absolute rounded-sm"
              style={{
                width: `${5 + (i % 4) * 2}px`,
                height: `${7 + (i % 3) * 3}px`,
                background: colour,
                opacity: 0.92,
                left: `${(i * 7.3 + 5) % 95}%`,
                top: `${(i * 11) % 30}%`,
                animationDelay: `${(i % 12) * 0.08}s`,
                // Custom property consumed by the keyframe for end-X position
                ['--confetti-x' as string]: `${driftX}px`,
              }}
            />
          );
        })}
      </div>

      <div className="card relative w-full max-w-sm animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)_both] space-y-5 p-7 text-center shadow-2xl">
        <button
          onClick={onDismiss}
          className="absolute right-3 top-3 rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>

        {/* Emoji + title */}
        <div className="space-y-2">
          <div className="flex justify-center text-text-muted"><Icon className="h-12 w-12" /></div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary">
            {title}
          </h2>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>

        {/* Score ring */}
        {total > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="var(--surface-2)"
                  strokeWidth="8"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={isPerfect ? 'var(--gold)' : 'var(--sage)'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - percentage / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <span
                className={`text-lg font-bold tabular-nums ${isPerfect ? 'text-gold' : 'text-sage'}`}
              >
                {percentage}%
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {answered}/{total} answered
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          {isPerfect ? (
            <button
              onClick={() => {
                onMoreQuestions(challengePrompt);
                onDismiss();
              }}
              className="btn btn-primary flex w-full items-center justify-center gap-2"
            >
              <Zap size={14} /> Challenge me — harder questions
            </button>
          ) : (
            <button
              onClick={() => {
                onMoreQuestions(tryAgainPrompt);
                onDismiss();
              }}
              className="btn btn-primary flex w-full items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> More practice questions
            </button>
          )}
          <button onClick={onDismiss} className="btn btn-secondary w-full text-xs text-text-muted">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
