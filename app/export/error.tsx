'use client';

import { ErrorFallback } from '@/components/ErrorFallback';

export default function ExportError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback {...props} title="Export failed." back={{ href: '/dashboard', label: 'Dashboard' }} />
  );
}
