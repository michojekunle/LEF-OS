import React from 'react';

type Props = {
  value: number;
  max: number;
  label?: React.ReactNode;
  accent?: 'gold' | 'sage' | 'slate' | 'red' | 'success';
  showCount?: boolean;
  className?: string;
};

const fill: Record<string, string> = {
  gold: 'bg-gold',
  sage: 'bg-sage',
  slate: 'bg-slate-blue',
  red: 'bg-lef-red',
  success: 'bg-success',
};

export function ProgressBar({
  value,
  max,
  label,
  accent = 'gold',
  showCount = true,
  className = '',
}: Props) {
  const clamped = Math.max(0, Math.min(value, max));
  const pct = max === 0 ? 0 : Math.round((clamped / max) * 1000) / 10;
  return (
    <div className={className}>
      {(label || showCount) && (
        <div className="mb-1.5 flex items-baseline justify-between">
          {label && (
            <span className="text-xs uppercase tracking-[0.18em] text-text-secondary">{label}</span>
          )}
          {showCount && (
            <span className="font-mono text-xs tabular-nums text-text-secondary">
              {clamped} / {max} <span className="text-text-muted">· {pct}%</span>
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full border border-border bg-surface-2">
        <div
          className={`h-full ${fill[accent]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
