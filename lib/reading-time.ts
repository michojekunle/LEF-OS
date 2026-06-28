/**
 * Estimate reading time for a chunk of text.
 *
 * Uses a 220 wpm default — solid average for adult readers on screen.
 * Minimum 1 minute (so a 10-word topic doesn't display "0 min read").
 */
export type ReadingTime = {
  minutes: number;
  label: string; // e.g. "2 min read"
};

export function readingTime(text: string | null | undefined, wpm = 220): ReadingTime {
  if (!text) return { minutes: 1, label: '1 min read' };
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / wpm));
  return { minutes, label: `${minutes} min read` };
}

/**
 * Sum reading times across multiple chunks (e.g. summary + objectives + outline).
 * Returns a single ReadingTime, useful for the "card total" footer.
 */
export function totalReadingTime(chunks: Array<string | null | undefined>, wpm = 220): ReadingTime {
  const combined = chunks.filter(Boolean).join(' ');
  return readingTime(combined, wpm);
}
