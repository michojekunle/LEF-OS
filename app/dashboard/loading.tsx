import { StatsSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-8 md:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="skeleton mb-1 h-3 w-16 animate-pulse rounded bg-surface-2" />
          <div className="skeleton mt-1 h-8 w-36 animate-pulse rounded bg-surface-2" />
        </div>
      </header>

      <section className="space-y-3">
        <div className="skeleton mb-2 h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card flex min-h-[160px] animate-pulse flex-col gap-2 p-5">
              <div className="skeleton h-3 w-12 rounded bg-surface-2" />
              <div className="skeleton mt-2 h-5 w-4/5 rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </section>

      <StatsSkeleton />
    </div>
  );
}
