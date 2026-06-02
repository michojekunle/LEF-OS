'use client';

import { ErrorFallback } from '@/components/ErrorFallback';

export default function GlobalRouteError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback {...props} back={{ href: '/', label: 'Home' }} title="Something cracked." />
  );
}
