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
    setAnimatedIndices([]);
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
                    className="text-text-muted hover:text-text-secondary transition-colors p-0.5"
                    title="Reset conversation"
                    aria-label="Reset conversation"
                  >
                    <RefreshCw size={11} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-muted hover:text-text-primary p-0.5"
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
        aria-expanded={isOpen}
        aria-controls="lef-counsel-inline-panel"
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
        <div id="lef-counsel-inline-panel" className="h-[400px] flex flex-col">
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
