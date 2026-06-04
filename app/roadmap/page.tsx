import { Suspense } from 'react';
import { RoadmapView } from './RoadmapView';

export const metadata = {
  title: 'Roadmap — LEF',
  description: 'The full 111-day curriculum across Law, Economics, and Finance.',
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-content px-5 py-10 md:px-6">
      <header className="mb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.32em] text-text-secondary">
          The Curriculum
        </p>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          122 days. 3 domains. One worldview.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
          Pick a month. Pick a domain. Every week ends with a synthesis prompt. Review days are
          highlighted in gold italic.
        </p>
      </header>
      <Suspense fallback={<div className="card skeleton h-96 p-8" />}>
        <RoadmapView />
      </Suspense>
    </div>
  );
}
