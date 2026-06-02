'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, ChevronDown, ChevronUp, RefreshCw, MessageSquare } from 'lucide-react';

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
};

export function LEFCounselPanel({ day, topics, isFloating = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!isFloating); // Floating starts closed, inline starts open
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const starterPills = [
    { label: "💡 Explain today's concepts", query: "Can you explain today's Law, Economics, and Finance topics in simple terms?" },
    { label: "📝 Give me a quick quiz", query: "Give me a quick 3-question multiple-choice quiz based on today's study topics." },
    { label: "🇳🇬 Apply to Nigeria context", query: "How do today's topics apply practically to a business or founder in Nigeria?" },
  ];

  async function handleSend(textToSend: string) {
    if (!textToSend.trim() || loading) return;

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
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40 select-none">
        {isOpen ? (
          <div className="w-80 md:w-96 h-[460px] max-h-[75vh] card-2 bg-surface/95 border-border shadow-2xl rounded-xl flex flex-col overflow-hidden reveal">
            {/* Header */}
            <header className="px-4 py-3 bg-surface-2 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-gold animate-pulse" />
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">LEF Counsel</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="text-text-muted hover:text-text-secondary transition-colors"
                  title="Reset conversation"
                >
                  <RefreshCw size={11} />
                </button>
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
            />

            {/* Input Bar */}
            <ChatInput
              input={input}
              loading={loading}
              onChange={setInput}
              onSubmit={() => handleSend(input)}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-11 h-11 md:w-12 md:h-12 bg-text-primary text-bg hover:bg-gold hover:text-bg font-semibold rounded-full shadow-2xl flex items-center justify-center transition-all duration-200"
            title="Chat with LEF Counsel"
          >
            <Sparkles size={18} className="animate-pulse" />
          </button>
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
          />
          <ChatInput
            input={input}
            loading={loading}
            onChange={setInput}
            onSubmit={() => handleSend(input)}
          />
        </div>
      )}
    </section>
  );
}

// ── Shared Subcomponents ───────────────────────────────────────────────────

type BodyProps = {
  messages: Message[];
  starterPills: { label: string; query: string }[];
  loading: boolean;
  error: string | null;
  onPillClick: (q: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

function ChatBody({
  messages,
  starterPills,
  loading,
  error,
  onPillClick,
  messagesEndRef,
}: BodyProps) {
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
              className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-gold/10 border border-gold/20 text-text-primary'
                  : 'bg-surface-2 border border-border text-text-primary'
              }`}
            >
              {m.content}
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
