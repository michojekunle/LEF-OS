'use client';

import { ErrorFallback } from '@/components/ErrorFallback';

export default function JournalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      {...props}
      title="Couldn't load the journal."
      back={{ href: '/', label: 'Home' }}
    />
  );
}
