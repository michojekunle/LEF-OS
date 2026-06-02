'use client';

import { useTour } from './TourProvider';
import { TOTAL_TOUR_STEPS } from './tour-steps';

type SegmentColor = {
  range: [number, number]; // inclusive step indices
  color: string;
};

const SEGMENTS: SegmentColor[] = [
  { range: [0, 3], color: 'var(--gold)' },
  { range: [4, 5], color: 'var(--sage)' },
  { range: [6, 9], color: 'var(--slate-blue)' },
  { range: [10, 10], color: 'var(--gold)' },
];

function colorForStep(index: number): string {
  for (const seg of SEGMENTS) {
    if (index >= seg.range[0] && index <= seg.range[1]) {
      return seg.color;
    }
  }
  return 'var(--gold)';
}

export function TourProgress() {
  const { state, isActive } = useTour();

  if (!isActive) return null;

  const currentIndex = state.currentStep;
  const fillPercent = Math.round(((currentIndex + 1) / TOTAL_TOUR_STEPS) * 100);
  const barColor = colorForStep(currentIndex);

  return (
    <div
      aria-label={`Tour progress: step ${currentIndex + 1} of ${TOTAL_TOUR_STEPS - 1}`}
      style={{ zIndex: 73 }}
      className="fixed bottom-20 right-4 w-36 space-y-1 rounded-lg p-3 shadow-md md:bottom-6"
      // Use inline style for bg to tap CSS vars
    >
      <div
        className="space-y-1.5 p-2.5"
        style={{
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border-dim)',
          borderRadius: '8px',
        }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-secondary">
          Step {currentIndex + 1} of {TOTAL_TOUR_STEPS - 1}
        </p>
        <div
          className="overflow-hidden rounded-full"
          style={{
            height: '3px',
            backgroundColor: 'var(--border)',
          }}
          aria-hidden="true"
        >
          <div
            style={{
              height: '100%',
              width: `${fillPercent}%`,
              backgroundColor: barColor,
              borderRadius: '9999px',
              transition: 'width 350ms cubic-bezier(0.4,0,0.2,1), background-color 350ms ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
