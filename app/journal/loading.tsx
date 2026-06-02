import { ListSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-10">
      <header className="mb-8">
        <div className="w-20 h-3 bg-surface-2 rounded skeleton mb-3 animate-pulse" />
        <div className="w-2/3 h-8 bg-surface-2 rounded skeleton animate-pulse" />
        <div className="w-full h-4 bg-surface-2 rounded skeleton mt-3 animate-pulse" />
      </header>
      <ListSkeleton />
    </div>
  );
}
