'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function JournalSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [pending, start] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (q.trim()) sp.set('q', q.trim());
      else sp.delete('q');
      sp.delete('p'); // reset page
      start(() => router.replace(`/journal?${sp.toString()}`, { scroll: false }));
    }, 280);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="card-2 border border-border rounded-md flex items-center gap-2 px-3 py-2">
      <Search size={14} className="text-text-secondary" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search public insights…"
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-text-muted"
        aria-label="Search journal"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ('')}
          aria-label="Clear search"
          className="text-text-muted hover:text-text-primary"
        >
          <X size={14} />
        </button>
      )}
      {pending && (
        <span className="text-[10px] text-text-muted font-mono tracking-wider">…</span>
      )}
    </div>
  );
}
