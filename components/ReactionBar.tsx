'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactionKind } from '@/lib/database.types';
import { toggleReactionAction } from '@/app/actions/reactions';
import { useToast } from './Toast';
import { Hand, Brain, Flame, Bookmark } from 'lucide-react';

const KINDS: { kind: ReactionKind; emoji: React.ReactNode; label: string }[] = [
  { kind: 'clap', emoji: <Hand size={14} />, label: 'Clap' },
  { kind: 'brain', emoji: <Brain size={14} />, label: 'Insightful' },
  { kind: 'fire', emoji: <Flame size={14} />, label: 'Fire' },
  { kind: 'bookmark', emoji: <Bookmark size={14} />, label: 'Save' },
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
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm transition-colors ${
              active
                ? 'border-gold/50 bg-accent-law text-gold'
                : 'border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
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
