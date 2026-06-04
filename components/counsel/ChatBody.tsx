'use client';

import { MessageSquare } from 'lucide-react';
import { AssistantMessage } from './AssistantMessage';
import { GuestOnboarding } from './GuestOnboarding';
import type { Message } from './types';

type Props = {
  messages: Message[];
  starterPills: { label: string; query: string }[];
  loading: boolean;
  error: string | null;
  onPillClick: (q: string) => void;
  /** Ref to the overflow container — the parent scrolls this, never the page. */
  containerRef: React.RefObject<HTMLDivElement>;
  userId?: string;
  onWordAdded?: () => void;
  animatedIndices: number[];
  onMessageAnimated: (idx: number) => void;
  onRetry?: () => void;
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
  onRetry,
}: Props) {
  if (!userId) return <GuestOnboarding />;

  return (
    <div ref={containerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <EmptyState starterPills={starterPills} onPillClick={onPillClick} />
      ) : (
        <>
          {/* Compact pill row once conversation starts */}
          <div className="border-border/40 flex flex-wrap gap-2 border-b pb-3">
            {starterPills.map((pill) => (
              <button
                key={pill.label}
                onClick={() => onPillClick(pill.query)}
                className="bg-surface-2/60 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium leading-normal text-text-secondary transition-all hover:border-gold hover:text-text-primary"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {messages.map((m, idx) => (
            <MessageRow
              key={idx}
              message={m}
              isLatest={idx === messages.length - 1}
              animatedIndices={animatedIndices}
              onWordAdded={onWordAdded}
              onMessageAnimated={onMessageAnimated}
              idx={idx}
            />
          ))}
        </>
      )}

      {loading && <ThinkingIndicator />}

      {error && (
        <div className="bg-accent-synthesis/20 border-red/20 flex items-center justify-between gap-3 rounded-md border p-3 text-xs leading-relaxed text-red">
          <span className="flex-1">{error}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="bg-red/10 border-red/20 hover:bg-red/20 shrink-0 rounded border px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-red transition-all"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  starterPills,
  onPillClick,
}: {
  starterPills: { label: string; query: string }[];
  onPillClick: (q: string) => void;
}) {
  return (
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
  );
}

function MessageRow({
  message: m,
  isLatest,
  animatedIndices,
  onWordAdded,
  onMessageAnimated,
  idx,
}: {
  message: Message;
  isLatest: boolean;
  animatedIndices: number[];
  onWordAdded?: () => void;
  onMessageAnimated: (idx: number) => void;
  idx: number;
}) {
  return (
    <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
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
            isLatest={isLatest && !animatedIndices.includes(idx)}
            onWordAdded={onWordAdded}
            onFinished={() => onMessageAnimated(idx)}
          />
        )}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
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
  );
}
