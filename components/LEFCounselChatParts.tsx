'use client';

import { useState, useEffect } from 'react';
import { Send, Sparkles, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { MarkdownText } from './MarkdownText';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type AssistantMessageProps = {
  content: string;
  isLatest: boolean;
  onWordAdded?: () => void;
  onFinished?: () => void;
};

export function AssistantMessage({ content, isLatest, onWordAdded, onFinished }: AssistantMessageProps) {
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
        if (onFinished) {
          onFinished();
        }
        return;
      }

      setDisplayedText(() => {
        const nextWords = words.slice(0, currentWordIndex + 1).join(' ');
        currentWordIndex++;
        return nextWords;
      });

      if (onWordAdded) {
        onWordAdded();
      }
    }, 20); // 20ms reveal speed

    return () => clearInterval(interval);
  }, [content, isLatest, onWordAdded, onFinished]);

  return <MarkdownText text={displayedText} />;
}

export function GuestOnboarding() {
  return (
    <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4 my-auto">
      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
        <Sparkles size={20} className="text-gold" />
      </div>
      <div>
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Consult LEF Counsel</h3>
        <p className="text-[11px] text-text-secondary mt-2 max-w-[220px] leading-relaxed">
          Sign in to consult LEF Counsel, get personalized study help, practice with interactive quizzes, and save your academic notes.
        </p>
      </div>
      <Link
        href="/login"
        className="w-full btn btn-primary text-xs py-2 mt-4 font-semibold text-center"
      >
        Sign In to Start
      </Link>
    </div>
  );
}

type BodyProps = {
  messages: Message[];
  starterPills: { label: string; query: string }[];
  loading: boolean;
  error: string | null;
  onPillClick: (q: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
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
  messagesEndRef,
  userId,
  onWordAdded,
  animatedIndices,
  onMessageAnimated,
}: BodyProps) {
  if (!userId) {
    return <GuestOnboarding />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center">
            <MessageSquare size={16} className="text-gold" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-primary">Chat with LEF Counsel</p>
            <p className="text-[11px] text-text-secondary mt-1 max-w-[240px] leading-relaxed">
              Ask questions, request examples, or take a quick quiz based on your curriculum.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full pt-2">
            {starterPills.map((pill) => (
              <button
                key={pill.label}
                onClick={() => onPillClick(pill.query)}
                className="text-[10px] text-left text-text-secondary hover:text-text-primary hover:border-gold border border-border bg-surface-2/40 px-3 py-2 rounded-lg transition-all leading-normal"
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
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <span className="text-[9px] uppercase tracking-wider text-text-muted mb-0.5 px-1">
              {m.role === 'user' ? 'You' : 'LEF Counsel'}
            </span>
            <div
              className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gold/10 border border-gold/20 text-text-primary whitespace-pre-wrap'
                  : 'bg-surface-2 border border-border text-text-primary'
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
          <span className="text-[9px] uppercase tracking-wider text-text-muted mb-0.5 px-1">
            LEF Counsel
          </span>
          <div className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      {error && (
        <div className="text-[10px] text-red border border-border-accent-synthesis bg-accent-synthesis p-2.5 rounded-md leading-relaxed">
          {error}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

type InputProps = {
  input: string;
  loading: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
};

export function ChatInput({ input, loading, onChange, onSubmit }: InputProps) {
  return (
    <div className="px-4 py-3 border-t border-border bg-surface-2/20 flex gap-2">
      <input
        type="text"
        value={input}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="Ask LEF Counsel a question…"
        className="flex-1 bg-transparent text-xs outline-none border border-border focus:border-text-primary rounded px-2.5 py-1.5 placeholder:text-text-muted"
        aria-label="Type your question to LEF Counsel"
      />
      <button
        onClick={onSubmit}
        disabled={loading || !input.trim()}
        className="w-8 h-8 rounded-md bg-text-primary text-bg hover:bg-gold hover:text-bg flex items-center justify-center transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <Send size={12} />
      </button>
    </div>
  );
}
