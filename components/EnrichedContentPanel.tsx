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

export type StudyTier = 'A' | 'B' | 'C';

type Props = {
  day: number;
  data: Record<'law' | 'economics' | 'finance', EnrichedData | null>;
  userId?: string;
  savedAnswers?: SavedAnswers;
  /** Only render accordions for these domains. Defaults to all three. */
  preferredDomains?: string[];
};

export function EnrichedContentPanel({
  day,
  data,
  userId,
  savedAnswers = {},
  preferredDomains,
}: Props) {
  const [activeTier, setActiveTier] = useState<StudyTier>('B');
  const allDomains = ['law', 'economics', 'finance'] as const;
  const domains = preferredDomains
    ? allDomains.filter((d) => preferredDomains.includes(d))
    : allDomains;
  const hasAnyData = domains.some((d) => data[d]);

  if (!hasAnyData) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary md:text-base">Study Targets</h2>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            Summaries, objectives, study outlines, verified resources, and review questions for each
            domain today.
          </p>
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-surface p-1 shadow-sm">
          {(['C', 'B', 'A'] as StudyTier[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTier(t)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                activeTier === t
                  ? 'bg-text-primary text-surface shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              Tier {t}
            </button>
          ))}
        </div>
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
              tier={activeTier}
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
  tier,
}: {
  domain: string;
  content: EnrichedData;
  day: number;
  userId?: string;
  savedAnswers: SavedAnswers;
  tier: StudyTier;
}) {
  const slicedObjectives = tier === 'C' ? content.objectives?.slice(0, 1) : content.objectives;
  const slicedOutline = tier === 'C' ? [] : content.outline;
  const slicedVideos = tier === 'C' ? [] : tier === 'B' ? content.videos?.slice(0, 1) : content.videos;
  const slicedArticles = tier === 'C' ? [] : tier === 'B' ? content.articles?.slice(0, 1) : content.articles;
  const slicedQuestions = tier === 'C' ? content.questions?.slice(0, 1) : tier === 'B' ? content.questions?.slice(0, 2) : content.questions;

  const totalQuestions = slicedQuestions?.length ?? 0;

  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    (slicedQuestions ?? []).forEach((_, i) => {
      const key = `${domain}_${i}`;
      if (savedAnswers[key]) init[i] = savedAnswers[key];
    });
    return init;
  });

  const handleAnswerChange = useCallback((index: number, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value.trim()) next[index] = value;
      else delete next[index];
      return next;
    });
  }, []);

  const label = DOMAIN_LABELS[domain as keyof typeof DOMAIN_LABELS];
  const accentClass = DOMAIN_ACCENT_CARD[domain as Domain];

  return (
    <>
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
              {slicedObjectives?.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="label-caps flex items-center gap-1.5 text-text-muted">
                    <Target size={13} /> Learning Objectives
                  </h4>
                  <ul className="space-y-2.5 pl-1 text-sm leading-[1.65] text-text-primary">
                    {slicedObjectives.map((obj, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold opacity-60" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {slicedOutline?.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="label-caps flex items-center gap-1.5 text-text-muted">
                    <List size={13} /> Study Outline
                  </h4>
                  <ol className="space-y-2 pl-1 text-sm leading-[1.65] text-text-primary">
                    {slicedOutline.map((item, i) => (
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
            {(slicedVideos?.length > 0 || slicedArticles?.length > 0) && (
              <div className="space-y-3">
                <h4 className="label-caps text-text-muted">Resources</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {slicedVideos?.length > 0 && (
                    <div className="space-y-2">
                      <span className="label-caps text-text-secondary">Video</span>
                      {slicedVideos.map((vid, i) => (
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
                  {slicedArticles?.length > 0 && (
                    <div className="space-y-2">
                      <span className="label-caps text-text-secondary">Reading</span>
                      {slicedArticles.map((art, i) => (
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
            {slicedQuestions?.length > 0 && (
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
                  {slicedQuestions.map((q, i) => {
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
