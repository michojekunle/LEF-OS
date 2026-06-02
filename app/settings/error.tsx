'use client';

import { ErrorFallback } from '@/components/ErrorFallback';

export default function SettingsError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      {...props}
      title="Couldn't load settings."
      back={{ href: '/dashboard', label: 'Dashboard' }}
    />
  );
}
