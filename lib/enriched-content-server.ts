import * as fs from 'fs';
import * as path from 'path';
import { type EnrichedByDomain, type EnrichedData } from './enriched-content';

/**
 * Server-only: load enriched content for a given day from
 * `data/enriched-content.json`. Returns nulls for any missing domain.
 *
 * NOTE: This uses `fs` so it can only run in Node runtime, not Edge.
 */
export function loadEnrichedForDay(day: number): EnrichedByDomain {
  const empty: EnrichedByDomain = { law: null, economics: null, finance: null };
  try {
    const p = path.join(process.cwd(), 'data', 'enriched-content.json');
    if (!fs.existsSync(p)) return empty;
    const allData = JSON.parse(fs.readFileSync(p, 'utf-8')) as Record<string, EnrichedData>;
    return {
      law: allData[`day_${day}_law`] ?? null,
      economics: allData[`day_${day}_economics`] ?? null,
      finance: allData[`day_${day}_finance`] ?? null,
    };
  } catch {
    return empty;
  }
}
