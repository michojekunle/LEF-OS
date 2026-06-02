'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { markTourComplete } from '@/lib/tour';
import { useTour } from './TourProvider';

const CONFETTI_COLORS = [
  'var(--gold)',
  'var(--sage)',
  'var(--slate-blue)',
  '#f0e4b8',
  '#b8d4c8',
  '#c8d0e8',
  'var(--gold)',
  'var(--sage)',
];

type ConfettiPiece = {
  id: number;
  left: number;
  top: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
};

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 1.5,
    duration: 1.5 + Math.random() * 1.5,
    size: 4 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));
}

export function TourComplete() {
  const { skip } = useTour();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [showDay1, setShowDay1] = useState(false);
  const confettiRef = useRef(generateConfetti());
  const markedRef = useRef(false);

  useEffect(() => {
    if (!markedRef.current) {
      markedRef.current = true;
      markTourComplete();
    }
    const t1 = setTimeout(() => setVisible(true), 40);
    const t2 = setTimeout(() => setShowDay1(true), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  function handleLogDay1() {
    skip();
    router.push('/dashboard');
  }

  function handleBrowseRoadmap() {
    skip();
    router.push('/roadmap');
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tour complete"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(4px)',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease-out',
      }}
    >
      {/* Confetti */}
      {confettiRef.current.map((p) => (
        <div
          key={p.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s infinite`,
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
        }
        @keyframes tour-number-fade-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes tour-day1-fade-in {
          0% { opacity: 0; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes tour-flame-in {
          0% { opacity: 0; transform: scale(0.5) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '40px 32px',
          maxWidth: '460px',
          width: '100%',
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 32px 80px -12px rgba(0,0,0,0.6)',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        {/* Animated number → Day 1 */}
        <div
          className="relative mb-4 flex items-center justify-center"
          style={{ height: '72px' }}
          aria-label="122 days, Day 1"
        >
          <span
            style={{
              position: 'absolute',
              fontFamily: 'var(--font-playfair), serif',
              fontSize: '4rem',
              color: 'var(--gold)',
              fontWeight: 700,
              lineHeight: 1,
              animation: showDay1 ? 'tour-number-fade-out 0.4s ease-out forwards' : undefined,
            }}
          >
            122
          </span>
          <span
            style={{
              position: 'absolute',
              fontFamily: 'var(--font-playfair), serif',
              fontSize: '3.5rem',
              color: 'var(--gold)',
              fontWeight: 700,
              lineHeight: 1,
              opacity: 0,
              animation: showDay1 ? 'tour-day1-fade-in 0.5s ease-out 0.3s forwards' : undefined,
            }}
          >
            Day 1
          </span>
        </div>

        {/* Flame */}
        <div
          style={{
            fontSize: '2rem',
            marginBottom: '16px',
            display: 'inline-block',
            animation: 'tour-flame-in 0.5s ease-out 0.6s both',
          }}
          aria-hidden="true"
        >
          🔥
        </div>

        <h2
          className="mb-4 font-display"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--text-primary)' }}
        >
          You&apos;re ready.
        </h2>

        <p className="mb-2 text-sm leading-relaxed text-text-secondary">
          You&apos;ve seen the whole system. The roadmap is public. The tracker is yours. The
          journey is 122 days.
        </p>
        <p className="mb-8 text-sm font-medium" style={{ color: 'var(--gold)' }}>
          Day 1 is today. Go log it.
        </p>

        <p
          className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Tour complete. Restart it anytime from the footer.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleLogDay1}
            className="btn btn-primary min-h-[44px] flex-1 justify-center sm:flex-initial sm:px-6"
          >
            Log Day 1 →
          </button>
          <button
            type="button"
            onClick={handleBrowseRoadmap}
            className="btn btn-secondary min-h-[44px] flex-1 justify-center sm:flex-initial sm:px-6"
          >
            Browse the roadmap →
          </button>
        </div>
      </div>
    </div>
  );
}
