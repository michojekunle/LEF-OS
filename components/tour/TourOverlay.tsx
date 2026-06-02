'use client';

import { useTour, type SpotlightRect } from './TourProvider';

/**
 * OVERLAY STRATEGY — 4 quadrant divs
 * ─────────────────────────────────────────────────────────────────
 * clip-path cuts the overlay visually but the div's hit-box still
 * covers the full viewport, swallowing clicks in the "hole". Instead
 * we render four separate divs that surround the spotlight rectangle.
 * The physical gap between them IS the spotlight — no DOM element
 * lives there, so clicks pass through to the page naturally.
 *
 *   ┌────────────────── TOP ────────────────────────────────────────┐
 *   ├──── LEFT ────┬───────────── (hole) ──────────┬── RIGHT ──────┤
 *   └──────────────────── BOTTOM ──────────────────────────────────┘
 */

const BG = 'rgba(0,0,0,0.72)';
const EASE = '350ms cubic-bezier(0.4,0,0.2,1)';

interface QuadrantProps {
  rect: SpotlightRect;
}

function Quadrants({ rect }: QuadrantProps) {
  const { top, left, width, height } = rect;
  const rTop = top;
  const rLeft = left;
  const rRight = left + width;
  const rBottom = top + height;

  const base: React.CSSProperties = {
    position: 'fixed',
    zIndex: 70,
    backgroundColor: BG,
    pointerEvents: 'auto',
  };

  const t = `top ${EASE}, left ${EASE}, right ${EASE}, bottom ${EASE}, width ${EASE}, height ${EASE}`;

  return (
    <>
      {/* TOP — full width, from top of viewport to top of spotlight */}
      <div
        aria-hidden="true"
        style={{ ...base, top: 0, left: 0, right: 0, height: Math.max(0, rTop), transition: t }}
      />
      {/* BOTTOM — full width, from bottom of spotlight to bottom of viewport */}
      <div
        aria-hidden="true"
        style={{ ...base, top: rBottom, left: 0, right: 0, bottom: 0, transition: t }}
      />
      {/* LEFT — between top and bottom of spotlight, left of it */}
      <div
        aria-hidden="true"
        style={{
          ...base,
          top: rTop,
          left: 0,
          width: Math.max(0, rLeft),
          height: rBottom - rTop,
          transition: t,
        }}
      />
      {/* RIGHT — between top and bottom of spotlight, right of it */}
      <div
        aria-hidden="true"
        style={{
          ...base,
          top: rTop,
          left: rRight,
          right: 0,
          height: rBottom - rTop,
          transition: t,
        }}
      />
    </>
  );
}

function FullscreenOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        backgroundColor: BG,
        pointerEvents: 'auto',
      }}
    />
  );
}

function SpotlightBorder({ rect }: { rect: SpotlightRect }) {
  const t = `top ${EASE}, left ${EASE}, width ${EASE}, height ${EASE}`;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        zIndex: 71,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        border: '2px solid rgba(200,169,110,0.65)',
        borderRadius: '8px',
        boxShadow: '0 0 0 1px rgba(200,169,110,0.2), 0 0 28px 6px rgba(200,169,110,0.12)',
        pointerEvents: 'none',
        transition: t,
        willChange: 'top, left, width, height',
      }}
    />
  );
}

export function TourOverlay() {
  const { state, isActive, currentStep } = useTour();
  const isFullscreen = currentStep?.fullscreen === true;
  const rect = isFullscreen ? null : state.spotlightRect;

  if (!isActive) return null;

  if (isFullscreen || rect === null) {
    return <FullscreenOverlay />;
  }

  return (
    <>
      <Quadrants rect={rect} />
      <SpotlightBorder rect={rect} />
    </>
  );
}
