'use client';

import { useEffect, useState } from 'react';
import { useTour } from './TourProvider';

const DOMAIN_EMOJIS: Array<{ emoji: string; color: string; delay: number }> = [
  { emoji: '⚖️', color: 'var(--gold)', delay: 0 },
  { emoji: '📊', color: 'var(--sage)', delay: 120 },
  { emoji: '💰', color: 'var(--slate-blue)', delay: 240 },
];

export function TourWelcome() {
  const { next, skip } = useTour();
  const [visible, setVisible] = useState(false);
  const [emojiVisible, setEmojiVisible] = useState([false, false, false]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Collect all timers so they can all be cleared on unmount
    const timers = DOMAIN_EMOJIS.map(({ delay }, i) =>
      setTimeout(() => {
        setEmojiVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 200 + delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to LEF OS tour"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease-out',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '40px 32px',
          maxWidth: '480px',
          width: '100%',
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 32px 80px -12px rgba(0,0,0,0.6)',
        }}
      >
        {/* Domain emojis */}
        <div className="mb-6 flex items-center justify-center gap-4">
          {DOMAIN_EMOJIS.map(({ emoji, color, delay }, i) => (
            <span
              key={i}
              style={{
                fontSize: '2rem',
                color,
                opacity: emojiVisible[i] ? 1 : 0,
                transform: emojiVisible[i] ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 300ms ease-out ${delay}ms, transform 300ms ease-out ${delay}ms`,
                display: 'inline-block',
              }}
              aria-hidden="true"
            >
              {emoji}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1
          className="mb-4 text-center font-display"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', color: 'var(--text-primary)' }}
        >
          Welcome.
        </h1>

        {/* Body */}
        <p className="mb-2 text-center text-sm leading-relaxed text-text-secondary">
          This is <strong className="text-text-primary">LEF OS</strong> — a personal learning system
          for one founder&apos;s 122-day deep dive into Law, Economics, and Finance. You&apos;re
          about to see how it all fits together.
        </p>
        <p className="mb-8 text-center text-sm leading-relaxed text-text-secondary">
          The roadmap is public. The tracker is yours. Every insight gets shared.
        </p>

        {/* Note */}
        <p
          className="mb-6 text-center font-mono text-xs uppercase tracking-[0.22em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Takes about 90 seconds · You can stop anytime
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={next}
            className="btn btn-primary min-h-[44px] flex-1 justify-center sm:flex-initial sm:px-6"
          >
            Show me around →
          </button>
          <button
            type="button"
            onClick={skip}
            className="btn btn-ghost min-h-[44px] flex-1 justify-center sm:flex-initial sm:px-6"
          >
            Skip — I&apos;ll explore myself
          </button>
        </div>
      </div>
    </div>
  );
}
