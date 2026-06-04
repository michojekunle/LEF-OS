'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  back?: { href: string; label: string };
};

export function ErrorFallback({ error, reset, title, back }: Props) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('LEF route error:', error);
    }
  }, [error]);

  return (
    <div className="mx-auto max-w-content px-5 py-16 md:px-6">
      <div className="card mx-auto max-w-lg space-y-4 p-8 text-center">
        <AlertTriangle size={24} className="accent-synthesis mx-auto" />
        <h1 className="font-display text-2xl">{title ?? 'Something cracked.'}</h1>
        <p className="text-sm leading-relaxed text-text-secondary">
          {error.message || 'An unexpected error occurred while rendering this page.'}
        </p>
        {error.digest && <p className="font-mono text-xs text-text-muted">ref: {error.digest}</p>}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className="btn btn-primary text-sm">
            <RotateCcw size={14} /> Try again
          </button>
          {back && (
            <Link href={back.href} className="btn btn-secondary text-sm">
              {back.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
