import { Suspense } from 'react';
import { RoadmapView } from './RoadmapView';

export const metadata = {
  title: 'Roadmap — LEF',
  description: 'The full 111-day curriculum across Law, Economics, and Finance.',
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-10">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-text-secondary mb-3">
          The Curriculum
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          122 days. 3 domains. One worldview.
        </h1>
        <p className="text-text-secondary mt-3 max-w-2xl text-sm md:text-base">
          Pick a month. Pick a domain. Every week ends with a synthesis prompt.
          Review days are highlighted in gold italic.
        </p>
      </header>
      <Suspense fallback={<div className="card p-8 skeleton h-96" />}>
        <RoadmapView />
      </Suspense>
    </div>
  );
}
