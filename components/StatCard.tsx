import React from 'react';

type Props = {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  /** Optional extra padding. Defaults to 'p-4'. */
  padding?: string;
};

/**
 * Shared metric card used on the Dashboard and Stats pages.
 * Keeps the icon-label / value / sub-label pattern in one place.
 */
export function StatCard({ icon, label, value, sub, padding = 'p-4' }: Props) {
  return (
    <div className={`card ${padding}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-secondary">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">
        {value}
        {sub && <span className="text-base font-normal text-text-muted"> {sub}</span>}
      </p>
    </div>
  );
}
