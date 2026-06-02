'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Message, ChatBody, ChatInput } from './LEFCounselChatParts';

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
  const [animatedIndices, setAnimatedIndices] = useState<number[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const starterPills = [
    {
      label: "💡 Explain today's concepts",
      query: "Can you explain today's Law, Economics, and Finance topics in simple terms?",
    },
    {
      label: '📝 Give me a quick quiz',
      query: "Give me a quick 3-question multiple-choice quiz based on today's study topics.",
    },
    {
      label: '🇳🇬 Apply to Nigeria context',
      query: "How do today's topics apply practically to a business or founder in Nigeria?",
    },
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
    setAnimatedIndices([]);
  }

  // --- FLOATING WIDGET TRIGGER ---
  if (isFloating) {
    return (
      <div className="fixed bottom-24 right-4 z-40 select-none md:bottom-6 md:right-6">
        {isOpen ? (
          <div className="card-2 bg-surface/95 reveal flex h-[460px] max-h-[75vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border-border shadow-2xl sm:w-80 md:w-96">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse text-gold" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  LEF Counsel
                </span>
              </div>
              <div className="flex items-center gap-3">
                {userId && (
                  <button
                    onClick={handleReset}
                    className="p-0.5 text-text-muted transition-colors hover:text-text-secondary"
                    title="Reset conversation"
                    aria-label="Reset conversation"
                  >
                    <RefreshCw size={11} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-0.5 text-text-muted hover:text-text-primary"
                  title="Close LEF Counsel chat"
                  aria-label="Close LEF Counsel chat"
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
              animatedIndices={animatedIndices}
              onMessageAnimated={(idx) => {
                setAnimatedIndices((prev) => [...prev, idx]);
              }}
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
          <div className="group relative">
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded border border-border bg-surface-2 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold shadow-lg group-hover:block">
              Ask LEF Counsel
            </div>

            {/* Pulsing glow */}
            <div className="bg-gold/25 pointer-events-none absolute inset-0 animate-ping rounded-full" />

            <button
              onClick={() => setIsOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold bg-surface font-semibold text-gold shadow-2xl transition-all duration-200 hover:bg-gold hover:text-bg md:h-12 md:w-12"
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
    <section className="card overflow-hidden border-border bg-surface">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-surface-2/20 hover:bg-surface-2/40 flex w-full items-center justify-between border-b border-border px-5 py-4 transition-colors"
        aria-expanded={isOpen}
        aria-controls="lef-counsel-inline-panel"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-gold" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Ask LEF Counsel
          </h2>
          <span className="text-[10px] font-normal text-text-muted">· AI Syllabus Assistant</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Panel Body */}
      {isOpen && (
        <div id="lef-counsel-inline-panel" className="flex h-[400px] flex-col">
          <ChatBody
            messages={messages}
            starterPills={starterPills}
            loading={loading}
            error={error}
            onPillClick={handleSend}
            messagesEndRef={messagesEndRef}
            userId={userId}
            onWordAdded={scrollToBottom}
            animatedIndices={animatedIndices}
            onMessageAnimated={(idx) => {
              setAnimatedIndices((prev) => [...prev, idx]);
            }}
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
