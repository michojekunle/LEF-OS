'use client';

import { useState, useCallback } from 'react';
import type { Achievement } from '@/lib/achievements';

export function useAchievement() {
  const [queue, setQueue] = useState<Achievement[]>([]);

  const current = queue[0] ?? null;

  const queueAchievement = useCallback((achievements: Achievement[]) => {
    if (achievements.length === 0) return;
    setQueue((prev) => [...prev, ...achievements]);
  }, []);

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  return { current, queueAchievement, dismiss };
}
