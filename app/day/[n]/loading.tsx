import { CardGridSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="mx-auto max-w-content animate-pulse space-y-8 px-5 py-8 md:px-6">
      <header className="space-y-3">
        <div className="skeleton h-3 w-16 rounded bg-surface-2" />
        <div className="skeleton h-10 w-48 rounded bg-surface-2" />
        <div className="skeleton h-4 w-32 rounded bg-surface-2" />
      </header>
      <CardGridSkeleton />
    </div>
  );
}
