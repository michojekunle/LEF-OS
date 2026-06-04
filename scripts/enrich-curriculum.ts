import { GoogleGenerativeAI } from '@google/generative-ai';
import { CURRICULUM, Domain } from '../data/curriculum-data';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// Use the fast and cheap flash model, it's great for structured JSON extraction
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.2, // Low temp for factual correctness
  },
});

const OUTPUT_FILE = path.join(process.cwd(), 'data', 'enriched-content.json');

// Helper to validate URLs (returns true if 200-399)
async function validateUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET', // some sites reject HEAD
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return res.ok || (res.status >= 300 && res.status < 400);
  } catch (err) {
    return false;
  }
}

// Ensure the file exists
let enrichedData: Record<string, any> = {};
if (fs.existsSync(OUTPUT_FILE)) {
  try {
    enrichedData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  } catch (e) {
    console.error('Failed to parse existing enriched-content.json, starting fresh.');
  }
}

async function processTopic(
  dayNum: number,
  domain: string,
  topic: string,
  isReview: boolean,
  trackFocus: string,
) {
  const key = `day_${dayNum}_${domain}`;

  // Skip if already successfully processed
  if (enrichedData[key] && enrichedData[key].status === 'success') {
    console.log(`[SKIP] Day ${dayNum} - ${domain} already processed.`);
    return;
  }

  console.log(`\n[START] Processing Day ${dayNum} - ${domain} - Topic: ${topic}`);

  const systemPrompt = `You are "LEF Counsel", an expert academic syllabus builder. Your job is to enrich a single study topic for a 4-month curriculum in Nigerian and global Law, Economics, and Finance.

The student is studying:
- Domain: ${domain.toUpperCase()}
- Track Focus: ${trackFocus}
- Topic: "${topic}"
- Is Review Day: ${isReview ? 'Yes (Create a synthesis review)' : 'No (Create a standard lesson)'}

Output a strictly formatted JSON object with exactly the following schema.
For resources, provide MAJORLY OPEN-ACCESS, highly reliable, and valid links. Avoid paywalls.
The JSON must adhere to this shape:
{
  "summary": "A concise 2-3 paragraph summary of the topic.",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "outline": ["Concept 1", "Concept 2", "Concept 3"],
  "videos": [
    { "title": "Specific Video Title", "url": "https://www.youtube.com/watch?v=..." }
  ],
  "articles": [
    { "title": "Specific Article Title", "url": "https://..." }
  ],
  "questions": [
    "Question 1 testing comprehension",
    "Question 2 testing practical application (Nigerian context if applicable)",
    "Question 3"
  ]
}
Return ONLY valid JSON.`;

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      });
      const responseText = result.response.text();

      // Parse JSON
      let content;
      try {
        content = JSON.parse(responseText);
      } catch (err) {
        console.error(`[ERROR] JSON parse failed on attempt ${attempt + 1}. Retrying...`);
        attempt++;
        await new Promise((res) => setTimeout(res, 2000));
        continue;
      }

      // Link Validation
      const validVideos = [];
      if (Array.isArray(content.videos)) {
        for (const vid of content.videos) {
          if (await validateUrl(vid.url)) {
            validVideos.push(vid);
          } else {
            console.log(`  [INVALID URL DROPPED] Video: ${vid.url}`);
          }
        }
      }

      const validArticles = [];
      if (Array.isArray(content.articles)) {
        for (const art of content.articles) {
          if (await validateUrl(art.url)) {
            validArticles.push(art);
          } else {
            console.log(`  [INVALID URL DROPPED] Article: ${art.url}`);
          }
        }
      }

      // Reconstruct validated content
      const finalContent = {
        topic,
        summary: content.summary || '',
        objectives: content.objectives || [],
        outline: content.outline || [],
        videos: validVideos,
        articles: validArticles,
        questions: content.questions || [],
        status: 'success',
      };

      enrichedData[key] = finalContent;
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedData, null, 2));

      console.log(
        `[SUCCESS] Saved Day ${dayNum} - ${domain}. (Videos: ${validVideos.length}, Articles: ${validArticles.length})`,
      );
      break; // Success
    } catch (err) {
      console.error(`[ERROR] API request failed on attempt ${attempt + 1}:`, err);
      attempt++;
      await new Promise((res) => setTimeout(res, 5000)); // Rate limit backoff
    }
  }

  if (attempt >= maxAttempts) {
    console.error(
      `[FATAL] Failed to process Day ${dayNum} - ${domain} after ${maxAttempts} attempts.`,
    );
    // Mark as failed so we can retry the script later
    enrichedData[key] = { status: 'failed', topic };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedData, null, 2));
  }
}

async function main() {
  console.log('Starting Curriculum Enrichment Engine...');
  console.log(`Outputting to: ${OUTPUT_FILE}`);

  // Loop through all data sequentially to respect rate limits
  for (const month of CURRICULUM) {
    for (const domain of ['law', 'economics', 'finance'] as const) {
      const track = month.tracks[domain];
      for (const week of track.weeks) {
        for (const day of week.days) {
          await processTopic(day.day, domain, day.topic, day.isReview, track.focus);
          // Small delay between calls to avoid hitting Gemini rate limits
          await new Promise((res) => setTimeout(res, 1000));
        }
      }
    }
  }

  console.log('Enrichment complete!');
}

main().catch(console.error);
