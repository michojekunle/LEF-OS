/**
 * components/ui/SectionHeader.tsx
 * Consistent card/section header pattern used across admin and content panels.
 * Eliminates the repeated `<h2 className="text-xs/sm font-semibold uppercase...">` boilerplate.
 */

import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional content placed in the top-right corner (badges, action buttons). */
  aside?: ReactNode;
  /** HTML heading level — defaults to h2. */
  as?: 'h1' | 'h2' | 'h3' | 'h4';
};

export function SectionHeader({ title, subtitle, aside, as: Tag = 'h2' }: Props) {
  return (
    <div className={`flex items-start justify-between gap-4 ${subtitle ? 'mb-4' : 'mb-3'}`}>
      <div>
        <Tag className="text-sm font-semibold text-text-primary">{title}</Tag>
        {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
