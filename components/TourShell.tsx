'use client';

import dynamic from 'next/dynamic';
import { TourProvider } from '@/components/tour/TourProvider';

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
