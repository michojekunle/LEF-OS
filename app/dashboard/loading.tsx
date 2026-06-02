import { StatsSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-8 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="w-16 h-3 bg-surface-2 rounded skeleton mb-1 animate-pulse" />
          <div className="w-36 h-8 bg-surface-2 rounded skeleton mt-1 animate-pulse" />
        </div>
      </header>

      <section className="space-y-3">
        <div className="w-24 h-3 bg-surface-2 rounded skeleton mb-2 animate-pulse" />
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 min-h-[160px] flex flex-col gap-2 animate-pulse">
              <div className="w-12 h-3 bg-surface-2 rounded skeleton" />
              <div className="w-4/5 h-5 bg-surface-2 rounded skeleton mt-2" />
            </div>
          ))}
        </div>
      </section>

      <StatsSkeleton />
    </div>
  );
}
