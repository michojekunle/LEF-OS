/**
 * Quiz extraction utility.
 * Parses a raw AI response string and separates a JSON quiz block
 * from any surrounding prose text.
 */

import type { QuizData } from './types';

export function extractQuiz(content: string): { quiz: QuizData | null; prose: string } {
  const fenceRe = /```json\s*([\s\S]*?)```/i;
  const match = fenceRe.exec(content);
  let jsonString = '';
  let replacedMatch = '';

  if (match) {
    jsonString = match[1];
    replacedMatch = match[0];
  } else {
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      jsonString = content.slice(startIdx, endIdx + 1);
      replacedMatch = jsonString;
    }
  }

  if (jsonString) {
    try {
      const parsed = JSON.parse(jsonString) as unknown;
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'type' in parsed &&
        (parsed as Record<string, unknown>).type === 'quiz' &&
        Array.isArray((parsed as Record<string, unknown>).questions)
      ) {
        return { quiz: parsed as QuizData, prose: content.replace(replacedMatch, '').trim() };
      }
    } catch {
      // Not valid JSON — fall through
    }
  }

  return { quiz: null, prose: content };
}
