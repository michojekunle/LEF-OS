import { StatsSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-8 space-y-8">
      <header>
        <div className="w-24 h-3 bg-surface-2 rounded skeleton mb-1 animate-pulse" />
        <div className="w-48 h-8 bg-surface-2 rounded skeleton mt-1 animate-pulse" />
        <div className="w-full h-4 bg-surface-2 rounded skeleton mt-1 animate-pulse" />
      </header>
      <StatsSkeleton />
    </div>
  );
}
