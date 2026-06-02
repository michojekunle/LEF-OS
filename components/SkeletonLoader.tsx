'use client';

import React from 'react';

// Shimmer card skeleton matching Dashboard today's grid
export function CardGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading curriculum days"
      aria-busy="true"
      className="grid gap-3 md:grid-cols-3 w-full"
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5 flex flex-col gap-3 min-h-[160px] animate-pulse">
          {/* Badge skeleton */}
          <div className="w-16 h-4 bg-surface-2 border border-border rounded skeleton" />
          {/* Headline skeleton */}
          <div className="space-y-2 mt-2">
            <div className="w-full h-4 bg-surface-2 rounded skeleton" />
            <div className="w-5/6 h-4 bg-surface-2 rounded skeleton" />
          </div>
          {/* Week metadata skeleton */}
          <div className="w-24 h-3 mt-auto bg-surface-2 rounded skeleton" />
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
      className="space-y-3 w-full"
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5 flex flex-col gap-3.5 animate-pulse">
          {/* Header row skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-20 h-4 bg-surface-2 rounded skeleton" />
              <div className="w-12 h-4 bg-surface-2 rounded skeleton" />
            </div>
            <div className="w-24 h-3 bg-surface-2 rounded skeleton" />
          </div>
          
          {/* Title skeleton */}
          <div className="space-y-1.5">
            <div className="w-3/4 h-5 bg-surface-2 rounded skeleton" />
          </div>
          
          {/* Text snippets skeleton */}
          <div className="space-y-2">
            <div className="w-full h-3.5 bg-surface-2 rounded skeleton" />
            <div className="w-5/6 h-3.5 bg-surface-2 rounded skeleton" />
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
      className="space-y-6 w-full animate-pulse"
    >
      {/* Upper grid */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 flex flex-col gap-2 min-h-[90px]">
            <div className="w-16 h-3 bg-surface-2 rounded skeleton" />
            <div className="w-10 h-7 bg-surface-2 rounded skeleton mt-1" />
          </div>
        ))}
      </div>
      
      {/* Lower graph panels */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="card p-5 space-y-4 min-h-[220px]">
            <div className="w-32 h-4 bg-surface-2 rounded skeleton" />
            <div className="w-full h-32 bg-surface-2/40 rounded skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
