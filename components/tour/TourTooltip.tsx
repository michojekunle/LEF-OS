'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { TourStep, AccentColor } from './tour-steps';
import type { SpotlightRect } from './TourProvider';
import { TOTAL_TOUR_STEPS } from './tour-steps';

type Props = {
  step: TourStep;
  stepIndex: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  spotlightRect: SpotlightRect | null;
  hasCompletedInteraction: boolean;
};

const ACCENT_CSS: Record<AccentColor, string> = {
  gold: 'var(--gold)',
  sage: 'var(--sage)',
  'slate-blue': 'var(--slate-blue)',
};

type Placement = 'top' | 'bottom' | 'left' | 'right';

function computePosition(
  rect: SpotlightRect | null,
  tooltipW: number,
  tooltipH: number,
  isMobile: boolean,
): { top: number; left: number; placement: Placement } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 16;

  if (!rect) {
    // Fullscreen/centered
    return {
      top: (vh - tooltipH) / 2,
      left: (vw - tooltipW) / 2,
      placement: 'bottom',
    };
  }

  const spaceBottom = vh - (rect.top + rect.height) - gap;
  const spaceTop = rect.top - gap;
  const spaceRight = vw - (rect.left + rect.width) - gap;
  const spaceLeft = rect.left - gap;

  let placement: Placement;

  if (isMobile) {
    placement = spaceBottom >= tooltipH + gap ? 'bottom' : 'top';
  } else {
    const spaces: Record<Placement, number> = {
      bottom: spaceBottom,
      top: spaceTop,
      right: spaceRight,
      left: spaceLeft,
    };
    placement = (Object.keys(spaces) as Placement[]).reduce((a, b) =>
      spaces[a] > spaces[b] ? a : b,
    );
  }

  let top = 0;
  let left = 0;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  switch (placement) {
    case 'bottom':
      top = rect.top + rect.height + gap;
      left = Math.min(Math.max(centerX - tooltipW / 2, gap), vw - tooltipW - gap);
      break;
    case 'top':
      top = rect.top - tooltipH - gap;
      left = Math.min(Math.max(centerX - tooltipW / 2, gap), vw - tooltipW - gap);
      break;
    case 'right':
      top = Math.min(Math.max(centerY - tooltipH / 2, gap), vh - tooltipH - gap);
      left = rect.left + rect.width + gap;
      break;
    case 'left':
      top = Math.min(Math.max(centerY - tooltipH / 2, gap), vh - tooltipH - gap);
      left = rect.left - tooltipW - gap;
      break;
  }

  top = Math.max(gap, Math.min(top, vh - tooltipH - gap));
  left = Math.max(gap, Math.min(left, vw - tooltipW - gap));

  return { top, left, placement };
}

function renderBody(body: string): React.ReactNode {
  const parts = body.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function TourTooltip({
  step,
  stepIndex,
  onNext,
  onBack,
  onSkip,
  spotlightRect,
  hasCompletedInteraction,
}: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; placement: Placement }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });
  const [visible, setVisible] = useState(false);
  const [showDisabledTooltip, setShowDisabledTooltip] = useState(false);
  const accentColor = ACCENT_CSS[step.accentColor];
  const totalSteps = TOTAL_TOUR_STEPS;
  const isInteractive = Boolean(step.interactionId);
  const nextDisabled = isInteractive && !hasCompletedInteraction;

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [stepIndex]);

  // useLayoutEffect fires synchronously after DOM mutations — avoids the
  // one-frame flicker that useEffect causes when computing tooltip position.
  useLayoutEffect(() => {
    function updatePosition() {
      if (!tooltipRef.current) return;
      const tooltipW = Math.min(320, window.innerWidth - 32);
      const tooltipH = tooltipRef.current.offsetHeight;
      const isMobile = window.innerWidth < 640;
      const pos = computePosition(spotlightRect, tooltipW, tooltipH, isMobile);
      setPosition(pos);
    }

    updatePosition();
    window.addEventListener('resize', updatePosition, { passive: true });
    return () => window.removeEventListener('resize', updatePosition);
  }, [spotlightRect, stepIndex]);

  const translateY = position.placement === 'top' ? '8px' : '-8px';

  const progressFill = Math.round(((stepIndex + 1) / totalSteps) * 100);

  return (
    <div
      ref={tooltipRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Tour step ${stepIndex + 1} of ${totalSteps}: ${step.title}`}
      style={{
        position: 'fixed',
        zIndex: 72,
        top: position.top,
        left: position.left,
        width: `min(320px, calc(100vw - 32px))`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${translateY})`,
        transition: 'opacity 200ms ease-out, transform 200ms ease-out',
        borderLeft: `3px solid ${accentColor}`,
        backgroundColor: 'var(--surface)',
        border: `1px solid var(--border)`,
        borderLeftWidth: '3px',
        borderLeftColor: accentColor,
        borderRadius: '8px',
        boxShadow: '0 20px 60px -12px rgba(0,0,0,0.5), 0 4px 16px -4px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
        <span
          className="font-mono text-xs uppercase tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          Step {stepIndex + 1} of {totalSteps - 1}
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted transition-colors hover:text-text-primary"
          aria-label="Skip tour"
        >
          <X size={14} />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-[var(--border-dim)]" />

      {/* Body */}
      <div className="px-4 py-3">
        <h3 className="mb-2 font-display text-xl leading-snug text-text-primary">{step.title}</h3>
        <p className="text-sm leading-relaxed text-text-secondary">{renderBody(step.body)}</p>
        {step.nudge && (
          <p className="mt-3 text-xs italic" style={{ color: accentColor }}>
            ✦ {step.nudge}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-[var(--border-dim)]" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          disabled={stepIndex === 0}
          className="flex min-h-[44px] items-center justify-center text-xs text-text-secondary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
          aria-label="Previous step"
        >
          ← Back
        </button>

        {/* Progress bar */}
        <div
          className="flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]"
          style={{ height: '4px' }}
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressFill}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>

        {/* Next button */}
        <div className="relative">
          <button
            type="button"
            onClick={nextDisabled ? undefined : onNext}
            disabled={nextDisabled}
            className="flex min-h-[44px] items-center justify-center rounded-md px-3 text-xs font-medium transition-all"
            style={{
              backgroundColor: nextDisabled ? 'transparent' : accentColor,
              color: nextDisabled ? 'var(--text-muted)' : 'var(--bg)',
              opacity: nextDisabled ? 0.5 : 1,
              cursor: nextDisabled ? 'not-allowed' : 'pointer',
              border: nextDisabled ? `1px solid var(--border)` : 'none',
            }}
            aria-label={step.actionLabel}
            onMouseEnter={() => nextDisabled && setShowDisabledTooltip(true)}
            onMouseLeave={() => setShowDisabledTooltip(false)}
            onFocus={() => nextDisabled && setShowDisabledTooltip(true)}
            onBlur={() => setShowDisabledTooltip(false)}
          >
            {step.actionLabel}
          </button>
          {showDisabledTooltip && nextDisabled && (
            <div
              className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md px-2 py-1 text-xs text-text-primary shadow-md"
              style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              Complete the step above first
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
