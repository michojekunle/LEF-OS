'use client';

/**
 * Client-side wrapper that lazy-loads the tour system.
 * `ssr: false` is only valid inside Client Components — this file is the
 * boundary that makes it legal.
 */
import dynamic from 'next/dynamic';

const TourProvider = dynamic(() => import('@/components/tour').then((m) => m.TourProvider), {
  ssr: false,
});

const TourOrchestrator = dynamic(
  () => import('@/components/tour').then((m) => m.TourOrchestrator),
  { ssr: false },
);

export function TourShell({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      {children}
      <TourOrchestrator />
    </TourProvider>
  );
}
