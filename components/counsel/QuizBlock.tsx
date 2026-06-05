'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { QuizData } from './types';

type Props = { quiz: QuizData };

export function QuizBlock({ quiz }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  function pick(qIdx: number, optIdx: number): void {
    if (qIdx in answers) return; // locked once answered
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  }

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = Object.entries(answers).filter(
    ([qIdx, optIdx]) => quiz.questions[parseInt(qIdx, 10)].answerIndex === optIdx,
  ).length;

  const scoreLabel =
    totalCorrect === quiz.questions.length
      ? 'Perfect!'
      : totalCorrect >= quiz.questions.length / 2
        ? 'Good work'
        : 'Keep studying';

  const scoreColor =
    totalCorrect === quiz.questions.length
      ? 'text-success'
      : totalCorrect >= quiz.questions.length / 2
        ? 'text-gold'
        : 'text-red';

  return (
    <div className="space-y-5">
      {quiz.questions.map((q, qIdx) => {
        const chosen = answers[qIdx] ?? null;
        const isAnswered = chosen !== null;

        return (
          <div key={qIdx} className="space-y-2.5">
            <p className="text-xs font-semibold leading-snug text-text-primary">
              <span className="mr-1.5 text-xs uppercase tracking-wider text-text-muted">
                Q{qIdx + 1}.
              </span>
              {q.question}
            </p>

            <div className="space-y-1.5">
              {q.options.map((opt, optIdx) => {
                const isCorrect = optIdx === q.answerIndex;
                const isChosen = chosen === optIdx;

                const base =
                  'w-full text-left px-3 py-2 rounded-md border text-sm leading-snug transition-all ';
                const stateClass = !isAnswered
                  ? 'border-border bg-surface-2/40 text-text-primary hover:border-gold/50 hover:bg-surface-2/70 cursor-pointer'
                  : isCorrect
                    ? 'border-success/50 bg-success/10 text-text-primary cursor-default'
                    : isChosen
                      ? 'border-red/50 bg-accent-synthesis/20 text-text-primary cursor-default'
                      : 'border-border bg-transparent text-text-muted cursor-default opacity-60';

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => pick(qIdx, optIdx)}
                    className={base + stateClass}
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

            {isAnswered && (
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2-overlay)] px-3 py-2 text-xs leading-relaxed text-text-secondary">
                <span className="font-semibold text-text-primary">Explanation: </span>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {totalAnswered === quiz.questions.length && (
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
          <p className="text-sm text-text-secondary">
            Score:{' '}
            <span className="font-bold text-text-primary">
              {totalCorrect}/{quiz.questions.length}
            </span>
          </p>
          <span className={`text-xs font-semibold uppercase tracking-wide ${scoreColor}`}>
            {scoreLabel}
          </span>
        </div>
      )}
    </div>
  );
}
