/**
 * lib/domain.ts
 * Single source of truth for domain display constants.
 *
 * Import these instead of writing inline ternary chains like:
 *   d === 'law' ? 'accent-law' : d === 'economics' ? 'accent-econ' : 'accent-finance'
 */

import type { Domain } from '@/data/curriculum-data';

/** Human-readable label with emoji for each domain. */
export const DOMAIN_LABELS: Record<Domain, string> = {
  law: '⚖️ Law',
  economics: '📊 Economics',
  finance: '💰 Finance',
};

/** Short labels (used in tight spaces). */
export const DOMAIN_LABELS_SHORT: Record<Domain, string> = {
  law: '⚖️ Law',
  economics: '📊 Econ',
  finance: '💰 Finance',
};

/** Tailwind text accent class for each domain. */
export const DOMAIN_ACCENT_TEXT: Record<Domain, string> = {
  law: 'accent-law',
  economics: 'accent-econ',
  finance: 'accent-finance',
};

/**
 * Full border + text + background accent classes for domain-coloured cards/chips.
 * Usage: className={DOMAIN_ACCENT_CARD[domain]}
 */
export const DOMAIN_ACCENT_CARD: Record<Domain, string> = {
  law: 'border-gold text-gold bg-gold/5',
  economics: 'border-sage text-sage bg-sage/5',
  finance: 'border-slate-blue text-slate-blue bg-slate-blue/5',
};

/** Plain text label without emoji (for email, plain text contexts). */
export const DOMAIN_LABELS_PLAIN: Record<Domain, string> = {
  law: 'Law',
  economics: 'Economics',
  finance: 'Finance',
};

/** Returns the emoji icon for a domain. */
export function domainIcon(domain: Domain): string {
  return { law: '⚖️', economics: '📊', finance: '💰' }[domain];
}
