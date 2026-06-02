'use client';

import { ErrorFallback } from '@/components/ErrorFallback';

export default function RoadmapError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      {...props}
      title="Couldn't load the roadmap."
      back={{ href: '/', label: 'Home' }}
    />
  );
}
