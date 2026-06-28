/**
 * One-off: backfill the optional `tldr` field on every entry in
 * `data/enriched-content.json` that doesn't already have one.
 *
 * For each missing entry, sends the existing `summary` to Gemini Flash and
 * asks for a single-paragraph hook of ~60 words. Validates length (40–90
 * words) and writes back to the same JSON file in place.
 *
 * Resume-safe: skips entries that already have `tldr`. You can re-run after
 * a partial failure with no duplication.
 *
 * Usage:
 *   GEMINI_API_KEY=... npx tsx scripts/backfill-tldr.ts
 *   GEMINI_API_KEY=... npx tsx scripts/backfill-tldr.ts --only=day_1_law
 *   GEMINI_API_KEY=... npx tsx scripts/backfill-tldr.ts --dry
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY in .env or .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const isDry = args.includes('--dry');
const onlyArg = args.find((a) => a.startsWith('--only='));
const onlyKey = onlyArg ? onlyArg.split('=')[1] : null;

const FILE = path.join(process.cwd(), 'data', 'enriched-content.json');
const MIN_WORDS = 40;
const MAX_WORDS = 90;
const THROTTLE_MS = 2000;

type EnrichedEntry = {
  topic?: string;
  summary?: string;
  tldr?: string;
  objectives?: string[];
  outline?: string[];
  // others ignored
  [k: string]: unknown;
};

type EnrichedFile = Record<string, EnrichedEntry>;

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 250,
  },
});

const SYSTEM_PROMPT = `You compress curriculum summaries into punchy 60-word hooks for a 5-minute reader.

Rules:
- Lead with the single most surprising or actionable insight.
- Plain prose. No headings, no lists, no markdown.
- One paragraph, 40 to 90 words.
- Active voice. No throat-clearing ("In this lesson..."). Just the substance.
- Keep proper nouns (people, statutes, places) but drop hedging.
- Do not start with "Today" or "This".

Output ONLY the hook paragraph. No preamble, no quotes around it, no labels.`;

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

async function generateTldr(topic: string, summary: string): Promise<string> {
  const userPrompt = `Topic: ${topic}\n\nSummary:\n${summary}\n\nWrite the 60-word hook.`;
  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: userPrompt },
  ]);
  const text = result.response.text().trim();
  // Strip enclosing quotes if Gemini adds them
  return text.replace(/^["'`]+|["'`]+$/g, '').trim();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(FILE)) {
    console.error('enriched-content.json not found at', FILE);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(FILE, 'utf-8')) as EnrichedFile;
  const allKeys = Object.keys(data);
  const targetKeys = onlyKey ? [onlyKey] : allKeys;

  const needsBackfill = targetKeys.filter((k) => {
    const entry = data[k];
    if (!entry) return false;
    if (entry.tldr && entry.tldr.trim().length > 0) return false; // already done
    if (!entry.summary || entry.summary.trim().length === 0) return false; // nothing to compress
    return true;
  });

  console.log(`Found ${needsBackfill.length} entries needing tldr backfill (of ${allKeys.length} total).`);
  if (isDry) {
    console.log('Dry run — listing first 5:');
    needsBackfill.slice(0, 5).forEach((k) => console.log('  ·', k));
    return;
  }
  if (needsBackfill.length === 0) {
    console.log('Nothing to do. Exiting.');
    return;
  }

  let done = 0;
  let failed = 0;

  for (const key of needsBackfill) {
    const entry = data[key];
    const topic = entry.topic ?? '(no topic)';
    const summary = entry.summary ?? '';
    try {
      const tldr = await generateTldr(topic, summary);
      const wc = wordCount(tldr);
      if (wc < MIN_WORDS || wc > MAX_WORDS) {
        console.warn(
          `[${key}] ⚠ word count ${wc} outside [${MIN_WORDS}, ${MAX_WORDS}] — keeping anyway`,
        );
      }
      entry.tldr = tldr;
      // Write incrementally so a crash mid-loop doesn't lose progress
      fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
      done += 1;
      console.log(`[${done}/${needsBackfill.length}] ${key} (${wc} words) — saved`);
    } catch (err) {
      failed += 1;
      console.error(`[${key}] ✗ failed:`, err instanceof Error ? err.message : err);
    }
    await sleep(THROTTLE_MS);
  }

  console.log(`\n✓ Backfill complete. ${done} succeeded, ${failed} failed.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
