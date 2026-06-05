/**
 * components/ui/Badge.tsx
 * Reusable status/label badge. Replaces the dozens of inline
 * `rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider` patterns.
 */

import type { ReactNode } from 'react';

type Variant = 'default' | 'gold' | 'success' | 'danger' | 'info' | 'muted';

const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'bg-surface-2 text-text-secondary border border-[var(--border-subtle)]',
  gold: 'bg-gold/15 text-gold border border-gold/30',
  success: 'bg-success/10 text-success border border-success/40',
  danger: 'bg-red/10 text-red border border-red/30',
  info: 'bg-slate-blue/10 text-slate-blue border border-slate-blue/30',
  muted: 'bg-surface-2 text-text-muted border border-[var(--border-subtle)]',
};

type Props = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

export function Badge({ variant = 'default', children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
