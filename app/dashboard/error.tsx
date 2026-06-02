'use client';

import { ErrorFallback } from '@/components/ErrorFallback';

export default function DashboardError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      {...props}
      title="Couldn't load your dashboard."
      back={{ href: '/', label: 'Home' }}
    />
  );
}
