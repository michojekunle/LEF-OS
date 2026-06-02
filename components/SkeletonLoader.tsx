'use client';

import React from 'react';

// Shimmer card skeleton matching Dashboard today's grid
export function CardGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading curriculum days"
      aria-busy="true"
      className="grid w-full gap-3 md:grid-cols-3"
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className="card flex min-h-[160px] animate-pulse flex-col gap-3 p-5">
          {/* Badge skeleton */}
          <div className="skeleton h-4 w-16 rounded border border-border bg-surface-2" />
          {/* Headline skeleton */}
          <div className="mt-2 space-y-2">
            <div className="skeleton h-4 w-full rounded bg-surface-2" />
            <div className="skeleton h-4 w-5/6 rounded bg-surface-2" />
          </div>
          {/* Week metadata skeleton */}
          <div className="skeleton mt-auto h-3 w-24 rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

// Shimmer list skeleton matching Journal entries
export function ListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading journal entries"
      aria-busy="true"
      className="w-full space-y-3"
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className="card flex animate-pulse flex-col gap-3.5 p-5">
          {/* Header row skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="skeleton h-4 w-20 rounded bg-surface-2" />
              <div className="skeleton h-4 w-12 rounded bg-surface-2" />
            </div>
            <div className="skeleton h-3 w-24 rounded bg-surface-2" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-1.5">
            <div className="skeleton h-5 w-3/4 rounded bg-surface-2" />
          </div>

          {/* Text snippets skeleton */}
          <div className="space-y-2">
            <div className="skeleton h-3.5 w-full rounded bg-surface-2" />
            <div className="skeleton h-3.5 w-5/6 rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Shimmer skeleton matching Stats views
export function StatsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading statistics details"
      aria-busy="true"
      className="w-full animate-pulse space-y-6"
    >
      {/* Upper grid */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card flex min-h-[90px] flex-col gap-2 p-4">
            <div className="skeleton h-3 w-16 rounded bg-surface-2" />
            <div className="skeleton mt-1 h-7 w-10 rounded bg-surface-2" />
          </div>
        ))}
      </div>

      {/* Lower graph panels */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="card min-h-[220px] space-y-4 p-5">
            <div className="skeleton h-4 w-32 rounded bg-surface-2" />
            <div className="bg-surface-2/40 skeleton h-32 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
