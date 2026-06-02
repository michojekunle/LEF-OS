'use client';

import { ErrorFallback } from '@/components/ErrorFallback';

export default function StatsError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      {...props}
      title="Couldn't load your stats."
      back={{ href: '/dashboard', label: 'Dashboard' }}
    />
  );
}
