'use client';

import React, { useState, useCallback } from 'react';
import {
  BookOpen,
  Target,
  List,
  PlayCircle,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ContentFlagButton } from './ContentFlagButton';
import { QuestionAnswerInput } from './QuestionAnswerInput';
import { QuizResultModal } from './QuizResultModal';
import { checkQuizAchievement } from '@/lib/achievements';
import { DOMAIN_LABELS, DOMAIN_ACCENT_CARD } from '@/lib/domain';
import type { Domain } from '@/data/curriculum-data';

type EnrichedData = {
  topic: string;
  summary: string;
  objectives: string[];
  outline: string[];
  videos: { title: string; url: string }[];
  articles: { title: string; url: string }[];
  questions: string[];
  status: string;
};

/** Keyed as `${domain}_${questionIndex}` → saved answer text */
type SavedAnswers = Record<string, string>;

type Props = {
  day: number;
  data: Record<'law' | 'economics' | 'finance', EnrichedData | null>;
  userId?: string;
  savedAnswers?: SavedAnswers;
};

export function EnrichedContentPanel({ day, data, userId, savedAnswers = {} }: Props) {
  const domains = ['law', 'economics', 'finance'] as const;
  const hasAnyData = domains.some((d) => data[d]);

  if (!hasAnyData) return null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-text-primary md:text-base">Study Targets</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          Summaries, objectives, study outlines, verified resources, and review questions for each
          domain today.
        </p>
      </div>

      <div className="space-y-4">
        {domains.map((d) => {
          const content = data[d];
          if (!content || content.status !== 'success') return null;

          return (
            <DomainAccordion
              key={d}
              domain={d}
              content={content}
              day={day}
              userId={userId}
              savedAnswers={savedAnswers}
            />
          );
        })}
      </div>
    </section>
  );
}

function DomainAccordion({
  domain,
  content,
  day,
  userId,
  savedAnswers,
}: {
  domain: string;
  content: EnrichedData;
  day: number;
  userId?: string;
  savedAnswers: SavedAnswers;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    (content.questions ?? []).forEach((_, i) => {
      const key = `${domain}_${i}`;
      if (savedAnswers[key]) init[i] = savedAnswers[key];
    });
    return init;
  });
  const [quizModal, setQuizModal] = useState<{ answered: number; total: number } | null>(null);
  const [quizAttempted, setQuizAttempted] = useState(
    // Already attempted if any answer exists
    Object.keys(savedAnswers).some((k) => k.startsWith(`${domain}_`)),
  );

  const totalQuestions = content.questions?.length ?? 0;

  const handleAnswerChange = useCallback(
    (index: number, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev };
        if (value.trim()) next[index] = value;
        else delete next[index];
        const answeredCount = Object.keys(next).length;

        // First answer — show "attempted" confetti
        if (!quizAttempted && value.trim()) {
          setQuizAttempted(true);
          const earned = checkQuizAchievement(day);
          if (earned.length > 0) {
            setQuizModal({ answered: answeredCount, total: totalQuestions });
          }
        }

        // All answered — show completion modal
        if (answeredCount === totalQuestions && totalQuestions > 0) {
          setQuizModal({ answered: answeredCount, total: totalQuestions });
        }

        return next;
      });
    },
    [quizAttempted, day, totalQuestions],
  );

  function sendToLEFCounsel(prompt: string) {
    window.dispatchEvent(new CustomEvent('lef-counsel-prompt', { detail: { query: prompt } }));
  }

  const label = DOMAIN_LABELS[domain as keyof typeof DOMAIN_LABELS];
  const accentClass = DOMAIN_ACCENT_CARD[domain as Domain];

  return (
    <>
      {quizModal && (
        <QuizResultModal
          answered={quizModal.answered}
          total={quizModal.total}
          topic={content.topic}
          onMoreQuestions={sendToLEFCounsel}
          onDismiss={() => setQuizModal(null)}
        />
      )}
      <div className={`overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-surface`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2"
        >
          <div className="min-w-0">
            <span className="label-caps text-text-muted">{label}</span>
            <h3 className="mt-1.5 text-base font-semibold leading-snug text-text-primary md:text-lg">
              {content.topic}
            </h3>
          </div>
          {isOpen ? (
            <ChevronUp size={18} className="shrink-0 text-text-muted" />
          ) : (
            <ChevronDown size={18} className="shrink-0 text-text-muted" />
          )}
        </button>

        {isOpen && (
          <div className="space-y-7 border-t border-[var(--border-subtle)] p-5 md:p-6">
            {/* Summary */}
            {content.summary && (
              <div className="space-y-2.5">
                <h4 className="label-caps flex items-center gap-1.5 text-text-muted">
                  <BookOpen size={13} /> Summary
                </h4>
                <div className="space-y-3">
                  {content.summary
                    .split(/\n\n+/)
                    .map((para) => para.trim())
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i} className="body-base leading-[1.75] text-text-primary">
                        {para}
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Objectives & Outline grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {content.objectives?.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="label-caps flex items-center gap-1.5 text-text-muted">
                    <Target size={13} /> Learning Objectives
                  </h4>
                  <ul className="space-y-2.5 pl-1 text-sm leading-[1.65] text-text-primary">
                    {content.objectives.map((obj, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold opacity-60" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {content.outline?.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="label-caps flex items-center gap-1.5 text-text-muted">
                    <List size={13} /> Study Outline
                  </h4>
                  <ol className="space-y-2 pl-1 text-sm leading-[1.65] text-text-primary">
                    {content.outline.map((item, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="label-caps mt-0.5 min-w-[18px] tabular-nums text-text-secondary">
                          {i + 1}.
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Resources */}
            {(content.videos?.length > 0 || content.articles?.length > 0) && (
              <div className="space-y-3">
                <h4 className="label-caps text-text-muted">Resources</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {content.videos?.length > 0 && (
                    <div className="space-y-2">
                      <span className="label-caps text-text-secondary">Video</span>
                      {content.videos.map((vid, i) => (
                        <div key={i} className="group relative flex items-stretch gap-1">
                          <a
                            href={vid.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex min-w-0 flex-1 items-start gap-2.5 rounded-lg border p-3 text-sm leading-snug transition-colors hover:bg-surface-2 ${accentClass}`}
                          >
                            <PlayCircle size={15} className="mt-px shrink-0 opacity-80" />
                            <span className="font-medium">{vid.title}</span>
                          </a>
                          <div className="flex items-center">
                            <ContentFlagButton
                              url={vid.url}
                              title={vid.title}
                              contentType="video"
                              dayNumber={day}
                              domain={domain}
                              userId={userId}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {content.articles?.length > 0 && (
                    <div className="space-y-2">
                      <span className="label-caps text-text-secondary">Reading</span>
                      {content.articles.map((art, i) => (
                        <div key={i} className="group relative flex items-stretch gap-1">
                          <a
                            href={art.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex min-w-0 flex-1 items-start gap-2.5 rounded-lg border p-3 text-sm leading-snug transition-colors hover:bg-surface-2 ${accentClass}`}
                          >
                            <ExternalLink size={15} className="mt-px shrink-0 opacity-80" />
                            <span className="font-medium">{art.title}</span>
                          </a>
                          <div className="flex items-center">
                            <ContentFlagButton
                              url={art.url}
                              title={art.title}
                              contentType="article"
                              dayNumber={day}
                              domain={domain}
                              userId={userId}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review Questions + Answer Inputs */}
            {content.questions?.length > 0 && (
              <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-surface-2 p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <h4 className="label-caps flex items-center gap-1.5 text-text-muted">
                    <HelpCircle size={13} /> Review Questions
                  </h4>
                  <span className="text-xs text-text-muted">
                    {userId
                      ? `${Object.keys(answers).length}/${totalQuestions} answered`
                      : 'Sign in to save answers'}
                  </span>
                </div>
                <ol className="space-y-5">
                  {content.questions.map((q, i) => {
                    const answerKey = `${domain}_${i}`;
                    const savedAnswer = savedAnswers[answerKey] ?? '';
                    return (
                      <li key={i} className="space-y-0.5">
                        <div className="flex gap-3 text-sm leading-[1.65] text-text-primary">
                          <span className="label-caps mt-0.5 min-w-[22px] tabular-nums text-text-muted">
                            Q{i + 1}.
                          </span>
                          <span className="font-medium">{q}</span>
                        </div>
                        <div className="pl-[30px]">
                          <QuestionAnswerInput
                            dayNumber={day}
                            domain={domain}
                            questionIndex={i}
                            initialAnswer={savedAnswer}
                            userId={userId}
                            onAnswerChange={(v) => handleAnswerChange(i, v)}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
