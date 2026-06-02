'use client';

import { ErrorFallback } from '@/components/ErrorFallback';

export default function ProfileError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      {...props}
      title="Couldn't load this profile."
      back={{ href: '/journal', label: 'Journal' }}
    />
  );
}
