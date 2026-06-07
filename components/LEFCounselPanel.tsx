'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageSquareIcon,
  Send,
} from 'lucide-react';
import { type Message, ChatBody, ChatInput } from './counsel';
import { QuizResultModal } from './QuizResultModal';
import { checkQuizAchievement } from '@/lib/achievements';

// ── Quiz helpers ───────────────────────────────────────────────────────────────

/** Returns the number of questions detected in an AI response, or 0 if not a quiz. */
function detectQuizQuestions(text: string): number {
  // Match numbered items: "1." "1)" "Q1." "Q1:" at the start of a line
  const numbered = text.match(/(?:^|\n)\s*(?:Q?\d+[.):\s])/g) ?? [];
  return numbered.length >= 2 ? numbered.length : 0;
}

/** Parse a score like "3/5", "3 out of 5", "60%", "Score: 3 out of 5" from AI text.
 *  @param knownTotal - the number of questions we sent, used as fallback denominator */
function parseScore(text: string, knownTotal = 0): { answered: number; total: number } | null {
  // "3/5" or "3 out of 5" — most reliable pattern
  const frac = text.match(/\b(\d+)\s*(?:\/|out\s+of)\s*(\d+)\b/i);
  if (frac) {
    const a = Number(frac[1]);
    const t = Number(frac[2]);
    if (t > 0 && a <= t) return { answered: a, total: t };
  }

  // "Score: 3" where we know the total from quiz mode
  if (knownTotal > 0) {
    const scoreLabel = text.match(/(?:score|got|earned|correct)[:\s]+(\d+)/i);
    if (scoreLabel) {
      const a = Number(scoreLabel[1]);
      if (a <= knownTotal) return { answered: a, total: knownTotal };
    }
  }

  // "60%" — use knownTotal as denominator if available
  const pct = text.match(/\b(\d+)\s*%/);
  if (pct) {
    const p = Number(pct[1]);
    const denominator = (() => {
      const n = text.match(/\bof\s+(\d+)\b/i) ?? text.match(/\/\s*(\d+)\b/);
      return n ? Number(n[1]) : knownTotal > 0 ? knownTotal : 0;
    })();
    if (denominator > 0) {
      return { answered: Math.round((p / 100) * denominator), total: denominator };
    }
  }

  return null;
}

/** Pages where the floating AI button adds no value and should be hidden. */
const FLOATING_HIDDEN_PATHS = ['/roadmap', '/journal', '/stats', '/export', '/settings'];

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

interface CounselError extends Error {
  retryAfter?: number | null;
}

export function LEFCounselPanel({ day, topics, isFloating = false, userId }: Props) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [error, setError] = useState<string | null>(null);
  const [animatedIndices, setAnimatedIndices] = useState<number[]>([]);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  // ── Quiz tracking ────────────────────────────────────────────────────────────
  /** Number of questions in the active quiz (0 = no quiz active) */
  const [quizQuestionCount, setQuizQuestionCount] = useState(0);
  /** How many user messages sent since quiz started */
  const [quizAnswerCount, setQuizAnswerCount] = useState(0);
  /** Whether the user has already requested score check */
  const [scorePending, setScorePending] = useState(false);
  /** Result to show in the QuizResultModal (null = hidden) */
  const [quizResult, setQuizResult] = useState<{ answered: number; total: number } | null>(null);

  // Rate limit / retry countdown timer
  useEffect(() => {
    if (retryCountdown === null) return;
    if (retryCountdown <= 0) {
      setRetryCountdown(null);
      setError('Rate limit wait period complete. You can now retry your request.');
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
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isOpen]);

  // Scroll inside the panel whenever a live interaction adds messages, loading status, or error messages change.
  // Guard with didUserInteract so the initial history load doesn't trigger page scroll.
  useEffect(() => {
    if (!didUserInteract.current) return;
    scrollChatToBottom();
  }, [messages, loading, error, scrollChatToBottom]);

  // Listen for external quiz prompt events fired by QuizResultModal
  useEffect(() => {
    function handleQuizPrompt(e: Event) {
      const query = (e as CustomEvent<{ query: string }>).detail?.query;
      if (!query) return;
      // Open panel if floating and closed
      setIsOpen(true);
      // Small delay so panel animates open before message lands
      setTimeout(() => handleSend(query), 300);
    }
    window.addEventListener('lef-counsel-prompt', handleQuizPrompt);
    return () => window.removeEventListener('lef-counsel-prompt', handleQuizPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const isRetryAttempt =
      messages.length > 0 &&
      messages[messages.length - 1].role === 'user' &&
      messages[messages.length - 1].content === textToSend;

    const userMessage: Message = { role: 'user', content: textToSend };

    if (!isRetryAttempt) {
      setMessages((prev) => [...prev, userMessage]);
      // If a quiz is active, count this as an answer
      if (quizQuestionCount > 0) {
        setQuizAnswerCount((n) => n + 1);
      }
    }

    setInput('');
    setLoading(true);

    try {
      const payloadMessages = isRetryAttempt ? messages : [...messages, userMessage];
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
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
              errorMessage =
                (data.error as { message?: string; error?: string }).message ||
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
            const err = new Error(errorMessage) as CounselError;
            err.retryAfter = serverRetryAfter;
            throw err;
          }
          const aiText: string = data.text;
          setMessages((prev) => [...prev, { role: 'assistant', content: aiText }]);
          setLoading(false);

          // ── Score detection (runs FIRST — takes priority over quiz re-detection) ──
          // The AI's score breakdown often contains numbered lines ("1. Correct ✓")
          // which would falsely trigger quiz detection. Resolve score first so we
          // don't skip it because !detectedCount is false.
          const detectedCount = detectQuizQuestions(aiText);
          let scoreHandled = false;

          if (scorePending || quizQuestionCount > 0) {
            const score = parseScore(aiText, quizQuestionCount);
            if (score && score.total > 0) {
              scoreHandled = true;
              setScorePending(false);
              setQuizQuestionCount(0);
              setQuizAnswerCount(0);
              // Always show the result modal when a score is found
              setQuizResult(score);
            }
          }

          // ── Quiz detection (only when we didn't just handle a score) ──────────
          if (!scoreHandled && detectedCount > 0 && quizQuestionCount === 0) {
            // AI sent a new quiz — enter quiz mode
            setQuizQuestionCount(detectedCount);
            setQuizAnswerCount(0);
            setScorePending(false);
            // Fire one-time "attempted" achievement — does NOT show the result
            // modal here; the modal shows when the score comes back so the user
            // sees actual results, not a 0/N placeholder.
            checkQuizAchievement(day); // marks seen in localStorage (deduped)
          }
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
      const isRate =
        err instanceof Error &&
        (err.message === 'rate_limit' ||
          err.message.includes('rate_limit') ||
          err.message.includes('Resource has been exhausted') ||
          (err as CounselError).retryAfter);
      if (isRate) {
        const seconds = (err as CounselError).retryAfter || 15;
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

  function requestScore() {
    setScorePending(true);
    handleSend(
      `Please now score all my answers above. For each question, tell me if I was correct or not, then give me a final score in the format X/${quizQuestionCount} (e.g. "Score: 3/${quizQuestionCount}").`,
    );
  }

  function resetQuiz() {
    setQuizQuestionCount(0);
    setQuizAnswerCount(0);
    setScorePending(false);
    setQuizResult(null);
  }

  async function handleReset() {
    resetQuiz();
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
  // Hide on pages where an AI study partner adds no value
  if (
    isFloating &&
    FLOATING_HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return null;
  }

  // ── Quiz result modal — rendered outside the panel so z-index clears everything
  const quizModal = quizResult && (
    <QuizResultModal
      answered={quizResult.answered}
      total={quizResult.total}
      topic={`Day ${day} topics`}
      onMoreQuestions={(prompt) => {
        resetQuiz();
        window.dispatchEvent(new CustomEvent('lef-counsel-prompt', { detail: { query: prompt } }));
      }}
      onDismiss={() => setQuizResult(null)}
    />
  );

  // ── Quiz status bar — shown inside the panel when quiz is active
  const quizBar = quizQuestionCount > 0 && !quizResult && (
    <div className="bg-surface-2/60 flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-1.5 text-xs">
      <span className="text-text-secondary">
        Quiz active ·{' '}
        <span className="font-semibold text-gold">
          {quizAnswerCount}/{quizQuestionCount}
        </span>{' '}
        answered
      </span>
      {quizAnswerCount >= quizQuestionCount && !scorePending && (
        <button
          onClick={requestScore}
          className="bg-gold/15 hover:bg-gold/25 flex items-center gap-1 rounded-md px-2 py-0.5 font-medium text-gold transition-colors"
        >
          <Send size={10} /> Check my score
        </button>
      )}
      {scorePending && <span className="text-text-muted">Scoring…</span>}
      <button onClick={resetQuiz} className="ml-2 text-text-muted hover:text-text-primary">
        ✕
      </button>
    </div>
  );

  if (isFloating) {
    return (
      <>
        {quizModal}
        {/* z-[75] keeps the panel above the tour overlay (z-70) and tooltip (z-72)
          so LEFCounsel remains fully usable during the guided tour. */}
        <div className="fixed bottom-24 right-4 z-[75] select-none md:bottom-6 md:right-6">
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

              {quizBar}

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
            <div className="group relative" data-tour="lef-counsel-btn">
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded border border-border bg-surface-2 px-2.5 py-1 text-xs uppercase tracking-wider text-gold shadow-lg group-hover:block">
                Ask LEF Counsel
              </div>

              {/* Pulsing glow */}
              <div className="bg-gold/25 pointer-events-none absolute inset-0 animate-ping rounded-full" />

              <button
                onClick={() => setIsOpen(true)}
                data-tour-action="lef-counsel-btn"
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gold font-semibold text-bg shadow-2xl transition-all duration-200 hover:bg-surface hover:text-gold md:h-12 md:w-12"
                title="Chat with LEF Counsel"
                aria-label="Open LEF Counsel chat"
              >
                <MessageSquareIcon size={18} className="animate-pulse" />
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // --- INLINE STUDY PAGE PANEL ---
  return (
    <>
      {quizModal}
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
            {quizBar}
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
    </>
  );
}
