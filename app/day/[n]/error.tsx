'use client';

import { ErrorFallback } from '@/components/ErrorFallback';

export default function DayError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorFallback
      {...props}
      title="Couldn't load this day."
      back={{ href: '/roadmap', label: 'Roadmap' }}
    />
  );
}
