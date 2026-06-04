"use client"

import React, { useState } from 'react';
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

type Props = {
  day: number;
  data: Record<'law' | 'economics' | 'finance', EnrichedData | null>;
};

export function EnrichedContentPanel({ day, data }: Props) {
  const domains = ['law', 'economics', 'finance'] as const;
  const hasAnyData = domains.some((d) => data[d]);

  if (!hasAnyData) return null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-text-primary md:text-base">
          Study Targets
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          Summaries, learning objectives, study outlines, and verified resources for each domain today.
        </p>
      </div>

      <div className="space-y-4">
        {domains.map((d) => {
          const content = data[d];
          if (!content || content.status !== 'success') return null;

          return <DomainAccordion key={d} domain={d} content={content} />;
        })}
      </div>
    </section>
  );
}

function DomainAccordion({ domain, content }: { domain: string; content: EnrichedData }) {
  const [isOpen, setIsOpen] = useState(false);

  const domainLabels = {
    law: '⚖️ Law',
    economics: '📊 Economics',
    finance: '💰 Finance',
  };

  const label = domainLabels[domain as keyof typeof domainLabels];
  const accentClass =
    domain === 'law'
      ? 'border-gold text-gold bg-gold/5'
      : domain === 'economics'
        ? 'border-sage text-sage bg-sage/5'
        : 'border-slate-blue text-slate-blue bg-slate-blue/5';

  return (
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
              <p className="body-base text-text-secondary leading-[1.75]">{content.summary}</p>
            </div>
          )}

          {/* Objectives & Outline grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {content.objectives?.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="label-caps flex items-center gap-1.5 text-text-muted">
                  <Target size={13} /> Learning Objectives
                </h4>
                <ul className="space-y-2.5 pl-1 text-sm leading-[1.65] text-text-secondary">
                  {content.objectives.map((obj, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
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
                <ol className="space-y-2 pl-1 text-sm leading-[1.65] text-text-secondary">
                  {content.outline.map((item, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="label-caps mt-0.5 min-w-[18px] tabular-nums text-text-muted">
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
                    <span className="label-caps text-text-muted opacity-70">Video</span>
                    {content.videos.map((vid, i) => (
                      <a
                        key={i}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm leading-snug transition-colors hover:bg-surface-2 ${accentClass}`}
                      >
                        <PlayCircle size={15} className="mt-px shrink-0 opacity-80" />
                        <span className="font-medium">{vid.title}</span>
                      </a>
                    ))}
                  </div>
                )}
                {content.articles?.length > 0 && (
                  <div className="space-y-2">
                    <span className="label-caps text-text-muted opacity-70">Reading</span>
                    {content.articles.map((art, i) => (
                      <a
                        key={i}
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm leading-snug transition-colors hover:bg-surface-2 ${accentClass}`}
                      >
                        <ExternalLink size={15} className="mt-px shrink-0 opacity-80" />
                        <span className="font-medium">{art.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Questions */}
          {content.questions?.length > 0 && (
            <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-surface-2 p-4 md:p-5">
              <h4 className="label-caps flex items-center gap-1.5 text-text-muted">
                <HelpCircle size={13} /> Review Questions
              </h4>
              <ol className="space-y-3.5">
                {content.questions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-[1.65] text-text-primary">
                    <span className="label-caps mt-0.5 min-w-[22px] tabular-nums text-text-muted">
                      Q{i + 1}.
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
