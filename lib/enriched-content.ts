/**
 * Shape of one domain's enriched content entry in `data/enriched-content.json`.
 * Keyed in the JSON as `day_${N}_${domain}` (e.g. `day_1_law`).
 *
 * `tldr` is optional — backfilled by `scripts/backfill-tldr.ts` later. When
 * present, the BriefDeck uses it; otherwise it falls back to a truncated
 * `summary`.
 */
export type EnrichedData = {
  topic: string;
  summary: string;
  /** Optional 60-word punchy hook. When absent, derived from `summary`. */
  tldr?: string;
  objectives: string[];
  outline: string[];
  videos: { title: string; url: string }[];
  articles: { title: string; url: string }[];
  questions: string[];
  status: string;
};

export type EnrichedByDomain = Record<'law' | 'economics' | 'finance', EnrichedData | null>;

/**
 * Returns the best hook text for a given enriched entry:
 *   - `tldr` if present and non-empty
 *   - else first 60 words of `summary` with ellipsis
 *   - else null (no enriched content for this domain on this day)
 */
export function hookFromEnriched(entry: EnrichedData | null, maxWords = 60): string | null {
  if (!entry) return null;
  if (entry.tldr && entry.tldr.trim().length > 0) return entry.tldr.trim();
  if (!entry.summary) return null;
  const words = entry.summary.trim().split(/\s+/);
  if (words.length <= maxWords) return entry.summary.trim();
  return words.slice(0, maxWords).join(' ') + '…';
}
