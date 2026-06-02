'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, ChevronDown, ChevronUp, RefreshCw, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { MarkdownText } from './MarkdownText';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  day: number;
  topics?: {
    law?: string;
    economics?: string;
    finance?: string;
  };
  isFloating?: boolean;
  userId?: string;
};

export function LEFCounselPanel({ day, topics, isFloating = false, userId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!isFloating); // Floating starts closed, inline starts open
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const starterPills = [
    { label: "💡 Explain today's concepts", query: "Can you explain today's Law, Economics, and Finance topics in simple terms?" },
    { label: "📝 Give me a quick quiz", query: "Give me a quick 3-question multiple-choice quiz based on today's study topics." },
    { label: "🇳🇬 Apply to Nigeria context", query: "How do today's topics apply practically to a business or founder in Nigeria?" },
  ];

  async function handleSend(textToSend: string) {
    if (!textToSend.trim() || loading || !userId) return;

    setError(null);
    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          day,
          topics,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setMessages([]);
    setError(null);
  }

  // --- FLOATING WIDGET TRIGGER ---
  if (isFloating) {
    return (
      <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 select-none">
        {isOpen ? (
          <div className="w-80 md:w-96 h-[460px] max-h-[75vh] card-2 bg-surface/95 border-border shadow-2xl rounded-xl flex flex-col overflow-hidden reveal">
            {/* Header */}
            <header className="px-4 py-3 bg-surface-2 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-gold animate-pulse" />
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">LEF Counsel</span>
              </div>
              <div className="flex items-center gap-3">
                {userId && (
                  <button
                    onClick={handleReset}
                    className="text-text-muted hover:text-text-secondary transition-colors"
                    title="Reset conversation"
                  >
                    <RefreshCw size={11} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-muted hover:text-text-primary p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            </header>

            {/* Chat Body */}
            <ChatBody
              messages={messages}
              starterPills={starterPills}
              loading={loading}
              error={error}
              onPillClick={handleSend}
              messagesEndRef={messagesEndRef}
              userId={userId}
              onWordAdded={scrollToBottom}
            />

            {/* Input Bar */}
            {userId && (
              <ChatInput
                input={input}
                loading={loading}
                onChange={setInput}
                onSubmit={() => handleSend(input)}
              />
            )}
          </div>
        ) : (
          <div className="relative group">
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block pointer-events-none whitespace-nowrap bg-surface-2 border border-border text-gold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded shadow-lg">
              Ask LEF Counsel
            </div>

            {/* Pulsing glow */}
            <div className="absolute inset-0 rounded-full bg-gold/25 animate-ping pointer-events-none" />

            <button
              onClick={() => setIsOpen(true)}
              className="relative w-11 h-11 md:w-12 md:h-12 bg-surface border border-gold text-gold hover:bg-gold hover:text-bg font-semibold rounded-full shadow-2xl flex items-center justify-center transition-all duration-200"
              title="Chat with LEF Counsel"
              aria-label="Open LEF Counsel chat"
            >
              <Sparkles size={18} className="animate-pulse" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- INLINE STUDY PAGE PANEL ---
  return (
    <section className="card border-border bg-surface overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 border-b border-border bg-surface-2/20 flex items-center justify-between hover:bg-surface-2/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-gold" />
          <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Ask LEF Counsel
          </h2>
          <span className="text-[10px] text-text-muted font-normal">
            · AI Syllabus Assistant
          </span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Panel Body */}
      {isOpen && (
        <div className="h-[400px] flex flex-col">
          <ChatBody
            messages={messages}
            starterPills={starterPills}
            loading={loading}
            error={error}
            onPillClick={handleSend}
            messagesEndRef={messagesEndRef}
            userId={userId}
            onWordAdded={scrollToBottom}
          />
          {userId && (
            <ChatInput
              input={input}
              loading={loading}
              onChange={setInput}
              onSubmit={() => handleSend(input)}
            />
          )}
        </div>
      )}
    </section>
  );
}

// ── Shared Subcomponents ───────────────────────────────────────────────────

type AssistantMessageProps = {
  content: string;
  isLatest: boolean;
  onWordAdded?: () => void;
};

function AssistantMessage({ content, isLatest, onWordAdded }: AssistantMessageProps) {
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
  }, [content, isLatest, onWordAdded]);

  return <MarkdownText text={displayedText} />;
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
};

function GuestOnboarding() {
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

function ChatBody({
  messages,
  starterPills,
  loading,
  error,
  onPillClick,
  messagesEndRef,
  userId,
  onWordAdded,
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
                  isLatest={idx === messages.length - 1}
                  onWordAdded={onWordAdded}
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

function ChatInput({ input, loading, onChange, onSubmit }: InputProps) {
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
      />
      <button
        onClick={onSubmit}
        disabled={loading || !input.trim()}
        className="btn btn-primary text-xs p-1.5 w-8 h-8 flex items-center justify-center shrink-0"
      >
        <Send size={12} />
      </button>
    </div>
  );
}
