'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp, RefreshCw, MessageSquareIcon } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [error, setError] = useState<string | null>(null);
  const [animatedIndices, setAnimatedIndices] = useState<number[]>([]);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  // Rate limit / retry countdown timer
  useEffect(() => {
    if (retryCountdown === null) return;
    if (retryCountdown <= 0) {
      setRetryCountdown(null);
      setError(null);
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setRetryCountdown((prev) => {
        if (prev === null) return null;
        const next = prev - 1;
        setError(`Rate limit hit. Please wait ${next}s before trying again.`);
        return next;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [retryCountdown]);

  // Ref to the scrollable chat container div (not the sentinel at the bottom).
  // We scroll the container itself, not the page, to avoid the page jumping.
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Track whether the last message update came from a live interaction
  // (user send / AI reply) vs. the initial history fetch.
  // We must NOT page-scroll on history load.
  const didUserInteract = useRef(false);

  // Scroll only the chat panel's own overflow container — never the page.
  const scrollChatToBottom = useCallback((instant = false) => {
    const el = chatContainerRef.current;
    if (!el) return;
    if (instant) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  // Fetch persisted conversation on first render
  useEffect(() => {
    if (!userId || !isOpen) return;

    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/ai/chat');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.messages) {
          // Load history silently — do NOT scroll the page
          setMessages(data.messages);
          // Scroll to bottom inside the panel after history renders,
          // but only if this is a re-open (not a fresh page load).
          if (didUserInteract.current) {
            setTimeout(() => scrollChatToBottom(true), 50);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    if (messages.length === 0) {
      fetchHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isOpen]);

  // Scroll inside the panel whenever a live interaction adds messages, loading status, or error messages change.
  // Guard with didUserInteract so the initial history load doesn't trigger page scroll.
  useEffect(() => {
    if (!didUserInteract.current) return;
    scrollChatToBottom();
  }, [messages, loading, error, scrollChatToBottom]);

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
    if (!textToSend.trim() || loading || !userId || retryCountdown !== null) return;

    setLastQuery(textToSend); // Save query for manual retries
    didUserInteract.current = true;
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

      let errorMessage = 'Failed to fetch response';
      let serverRetryAfter: number | null = null;
      try {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (!res.ok) {
            if (data && typeof data.error === 'object' && data.error !== null) {
              errorMessage = (data.error as { message?: string; error?: string }).message || 
                             (data.error as { message?: string; error?: string }).error || 
                             JSON.stringify(data.error);
            } else if (data && typeof data.error === 'string') {
              errorMessage = data.error;
            } else if (data && typeof data.message === 'string') {
              errorMessage = data.message;
            }
            if (data && typeof data.retryAfter === 'number') {
              serverRetryAfter = data.retryAfter;
            }
            const err = new Error(errorMessage);
            (err as any).retryAfter = serverRetryAfter;
            throw err;
          }
          setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
          setLoading(false);
        } else {
          const text = await res.text();
          throw new Error(text.slice(0, 150) || `HTTP error ${res.status}`);
        }
      } catch (parseErr) {
        if (parseErr instanceof Error) {
          throw parseErr;
        }
        throw new Error('An unexpected error occurred while communicating with LEF Counsel.');
      }
    } catch (err) {
      console.error(err);
      const isRate = err instanceof Error && (err.message === 'rate_limit' || err.message.includes('rate_limit') || err.message.includes('Resource has been exhausted') || (err as any).retryAfter);
      if (isRate) {
        const seconds = (err as any).retryAfter || 15;
        setRetryCountdown(seconds);
        setError(`Rate limit hit. Please wait ${seconds}s before trying again.`);
        setLoading(true); // keep loading spin active
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
        setLoading(false);
      }
    }
  }

  const handleRetry = () => {
    if (!lastQuery) return;
    setRetryCountdown(null);
    setError(null);
    setLoading(false);
    // Execute on next tick to bypass early-return guards
    setTimeout(() => {
      handleSend(lastQuery);
    }, 0);
  };

  async function handleReset() {
    setMessages([]);
    setError(null);
    setAnimatedIndices([]);

    if (!userId) return;

    try {
      await fetch('/api/ai/chat', { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear chat history from server', err);
    }
  }

  // --- FLOATING WIDGET TRIGGER ---
  if (isFloating) {
    return (
      <div className="fixed bottom-24 right-4 z-40 select-none md:bottom-6 md:right-6">
        {isOpen ? (
          <div className="card-2 bg-surface/95 reveal flex h-[460px] max-h-[75vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:w-80 md:w-96">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse text-gold" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  LEF Counsel
                </span>
                {messages.length > 0 && (
                  <span
                    className="bg-gold/10 rounded px-1.5 py-0.5 font-mono text-xs text-gold"
                    title="Messages in memory — resets when you clear"
                  >
                    {messages.length} msg{messages.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {userId && (
                  <button
                    onClick={handleReset}
                    className="p-0.5 text-text-muted transition-colors hover:text-text-secondary"
                    title="Clear conversation memory"
                    aria-label="Clear conversation memory"
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

            <ChatBody
              messages={messages}
              starterPills={starterPills}
              loading={loading}
              error={error}
              onPillClick={handleSend}
              containerRef={chatContainerRef}
              userId={userId}
              onWordAdded={() => scrollChatToBottom()}
              animatedIndices={animatedIndices}
              onMessageAnimated={(idx) => {
                setAnimatedIndices((prev) => [...prev, idx]);
              }}
              onRetry={lastQuery ? handleRetry : undefined}
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
            <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded border border-border bg-surface-2 px-2.5 py-1 text-xs uppercase tracking-wider text-gold shadow-lg group-hover:block">
              Ask LEF Counsel
            </div>

            {/* Pulsing glow */}
            <div className="bg-gold/25 pointer-events-none absolute inset-0 animate-ping rounded-full" />

            <button
              onClick={() => setIsOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface font-semibold hover:text-gold shadow-2xl transition-all duration-200 bg-gold text-bg md:h-12 md:w-12"
              title="Chat with LEF Counsel"
              aria-label="Open LEF Counsel chat"
            >
              <MessageSquareIcon size={18} className="animate-pulse" />
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
          <span className="text-xs font-normal text-text-muted">· AI Syllabus Assistant</span>
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
            containerRef={chatContainerRef}
            userId={userId}
            onWordAdded={() => scrollChatToBottom()}
            animatedIndices={animatedIndices}
            onMessageAnimated={(idx) => {
              setAnimatedIndices((prev) => [...prev, idx]);
            }}
            onRetry={lastQuery ? handleRetry : undefined}
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
