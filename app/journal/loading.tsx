import { ListSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 py-10 md:px-6">
      <header className="mb-8">
        <div className="skeleton mb-3 h-3 w-20 animate-pulse rounded bg-surface-2" />
        <div className="skeleton h-8 w-2/3 animate-pulse rounded bg-surface-2" />
        <div className="skeleton mt-3 h-4 w-full animate-pulse rounded bg-surface-2" />
      </header>
      <ListSkeleton />
    </div>
  );
}
