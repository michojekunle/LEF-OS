'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactionKind } from '@/lib/database.types';
import { toggleReactionAction } from '@/app/actions/reactions';
import { useToast } from './Toast';

const KINDS: { kind: ReactionKind; emoji: string; label: string }[] = [
  { kind: 'clap', emoji: '👏', label: 'Clap' },
  { kind: 'brain', emoji: '🧠', label: 'Insightful' },
  { kind: 'fire', emoji: '🔥', label: 'Fire' },
  { kind: 'bookmark', emoji: '🔖', label: 'Save' },
];

type Counts = Partial<Record<ReactionKind, number>>;

type Props = {
  entryId: string;
  initialCounts: Counts;
  initialMine: ReactionKind[];
  signedIn: boolean;
};

export function ReactionBar({ entryId, initialCounts, initialMine, signedIn }: Props) {
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [mine, setMine] = useState<Set<ReactionKind>>(new Set(initialMine));
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function toggle(kind: ReactionKind) {
    if (!signedIn) {
      toast.info('Sign in to react');
      router.push('/login?next=/journal');
      return;
    }
    // optimistic
    const hadIt = mine.has(kind);
    const nextMine = new Set(mine);
    if (hadIt) nextMine.delete(kind);
    else nextMine.add(kind);
    setMine(nextMine);
    setCounts((c) => ({ ...c, [kind]: Math.max(0, (c[kind] ?? 0) + (hadIt ? -1 : 1)) }));

    start(async () => {
      const res = await toggleReactionAction({ entry_id: entryId, kind });
      if (!res.ok) {
        toast.error(res.error);
        // revert
        setMine(mine);
        setCounts((c) => ({ ...c, [kind]: Math.max(0, (c[kind] ?? 0) + (hadIt ? 1 : -1)) }));
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      {KINDS.map(({ kind, emoji, label }) => {
        const n = counts[kind] ?? 0;
        const active = mine.has(kind);
        return (
          <button
            type="button"
            key={kind}
            onClick={() => toggle(kind)}
            disabled={pending}
            aria-pressed={active}
            title={label}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors ${
              active
                ? 'border-gold/50 bg-accent-law text-gold'
                : 'border-border text-text-secondary hover:text-text-primary hover:border-text-muted'
            }`}
          >
            <span aria-hidden>{emoji}</span>
            {n > 0 && <span className="tabular-nums">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}
