import { StatsSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-8 md:px-6">
      <header>
        <div className="skeleton mb-1 h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="skeleton mt-1 h-8 w-48 animate-pulse rounded bg-surface-2" />
        <div className="skeleton mt-1 h-4 w-full animate-pulse rounded bg-surface-2" />
      </header>
      <StatsSkeleton />
    </div>
  );
}
