'use client';

import { useEffect, useRef } from 'react';
import { X, Download, Twitter, Linkedin } from 'lucide-react';
import type { Achievement, AchievementType } from '@/lib/achievements';

const META: Record<
  AchievementType,
  { emoji: string; title: string; subtitle: string; colour: string }
> = {
  perfect_day: {
    emoji: '🏆',
    title: 'Perfect Day',
    subtitle: 'Law · Economics · Finance — all three, one session.',
    colour: 'var(--gold)',
  },
  full_notes_day: {
    emoji: '📝',
    title: 'Full Notes',
    subtitle: 'Every domain documented for the day.',
    colour: 'var(--sage)',
  },
  quiz_complete: {
    emoji: '🧠',
    title: 'Quiz Complete',
    subtitle: 'All review questions answered. Solid recall.',
    colour: 'var(--slate-blue)',
  },
  perfect_week: {
    emoji: '🔥',
    title: 'Perfect Week',
    subtitle: 'Seven days. Three domains. Zero gaps.',
    colour: 'var(--gold)',
  },
  week_complete: {
    emoji: '✅',
    title: 'Week Complete',
    subtitle: 'Another week of the curriculum down.',
    colour: 'var(--sage)',
  },
  streak: {
    emoji: '⚡',
    title: 'Streak Milestone',
    subtitle: 'Consistency is the compounding asset.',
    colour: 'var(--gold)',
  },
};

const CONFETTI_COLOURS = [
  '#c9ab70',
  '#80a394',
  '#8fa3d0',
  '#cc7272',
  '#72a880',
  '#ede8e0',
  '#c9ab70',
  '#80a394',
  '#8fa3d0',
  '#c9ab70',
  '#80a394',
  '#8fa3d0',
];

type Props = {
  achievement: Achievement;
  onDismiss: () => void;
};

export function AchievementModal({ achievement, onDismiss }: Props) {
  const meta = META[achievement.type];
  const overlayRef = useRef<HTMLDivElement>(null);

  const theme =
    typeof window !== 'undefined' ? (localStorage.getItem('lef-theme') ?? 'dark') : 'dark';

  const ogUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/og/achievement?` +
        new URLSearchParams({
          type: achievement.type,
          day: String(achievement.day ?? ''),
          username: '', // username not available in this context — kept blank
          streak: String(achievement.streak ?? ''),
          theme,
        })
      : '';

  const encodedText = encodeURIComponent(
    `${meta.emoji} ${meta.title} — ${meta.subtitle}\n\nLEF OS · Law · Economics · Finance`,
  );
  const siteUrl = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.origin : 'https://lef-os.vercel.app',
  );

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  // Close on backdrop click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onDismiss();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={meta.title}
    >
      {/* Confetti — pops in then falls past the bottom with rotation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 40 }).map((_, i) => {
          const colour = CONFETTI_COLOURS[i % CONFETTI_COLOURS.length];
          const driftX = ((i * 47) % 320) - 160;
          return (
            <span
              key={i}
              className="animate-confetti absolute rounded-sm"
              style={{
                width: `${5 + (i % 4) * 2}px`,
                height: `${7 + (i % 3) * 3}px`,
                background: colour,
                opacity: 0.92,
                left: `${(i * 6.7 + 4) % 95}%`,
                top: `${(i * 9.3) % 25}%`,
                animationDelay: `${(i % 14) * 0.07}s`,
                ['--confetti-x' as string]: `${driftX}px`,
              }}
            />
          );
        })}
      </div>

      {/* Modal card */}
      <div
        className="card relative flex w-full max-w-md animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)_both] flex-col items-center gap-5 p-8 text-center shadow-2xl"
        style={{ borderColor: meta.colour, borderWidth: '1px' }}
      >
        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute right-3 top-3 rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        {/* Emoji */}
        <div className="text-6xl leading-none" role="img" aria-label={meta.title}>
          {meta.emoji}
        </div>

        {/* Title + subtitle */}
        <div className="space-y-1.5">
          <h2
            className="font-display text-2xl font-bold tracking-tight"
            style={{ color: meta.colour }}
          >
            {meta.title}
          </h2>
          <p className="text-sm text-text-secondary">{meta.subtitle}</p>
          {achievement.streak && (
            <p className="mt-1 font-mono text-xs font-bold text-gold">
              {achievement.streak}-day streak
            </p>
          )}
          {achievement.day && (
            <p className="font-mono text-xs text-text-muted">Day {achievement.day}</p>
          )}
        </div>

        {/* Card preview */}
        {ogUrl && (
          <div className="w-full overflow-hidden rounded-xl border border-[var(--border-subtle)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogUrl}
              alt="Achievement card"
              className="w-full object-cover"
              style={{ aspectRatio: '1200/630' }}
            />
          </div>
        )}

        {/* Share row */}
        <div className="flex w-full flex-wrap justify-center gap-2">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
          >
            <Twitter size={13} /> X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
          >
            <Linkedin size={13} /> LinkedIn
          </a>
          <a
            href={`https://wa.me/?text=${encodedText}%20${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
          {ogUrl && (
            <a
              href={ogUrl}
              download={`lef-${achievement.type}.png`}
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
            >
              <Download size={13} /> Save image
            </a>
          )}
        </div>

        <button onClick={onDismiss} className="text-xs text-text-muted hover:text-text-primary">
          Dismiss
        </button>
      </div>
    </div>
  );
}
