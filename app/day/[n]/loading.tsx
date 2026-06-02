import { CardGridSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-8 space-y-8 animate-pulse">
      <header className="space-y-3">
        <div className="w-16 h-3 bg-surface-2 rounded skeleton" />
        <div className="w-48 h-10 bg-surface-2 rounded skeleton" />
        <div className="w-32 h-4 bg-surface-2 rounded skeleton" />
      </header>
      <CardGridSkeleton />
    </div>
  );
}
