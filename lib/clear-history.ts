/**
 * Shared "clear all history" action used by both the Command Palette
 * ("Clear all history" command) and LEFCounsel (when the user asks the
 * AI to clear/wipe/reset their history in natural language).
 *
 * Wipes:
 *   - LEFCounsel chat history (server-side DELETE /api/ai/chat)
 *   - Achievement badges, tour state, dismissed prompts (localStorage)
 *   - Quiz dedup, streak banners, etc. (sessionStorage)
 *
 * Does NOT touch: study logs, notes, entries, theme preference, auth session.
 */

const LEF_LOCAL_KEYS_TO_CLEAR = [
  'lef_achievements_seen',
  'lef_tour_completed',
  'lef_tour_step',
  'lef_first_public_shown',
  'dismissed-push-prompt',
  'lef-pwa-dismissed',
];

export type ClearHistoryResult = {
  chatCleared: boolean;
  localCleared: boolean;
  sessionCleared: boolean;
};

export async function clearAllHistory(): Promise<ClearHistoryResult> {
  const result: ClearHistoryResult = {
    chatCleared: false,
    localCleared: false,
    sessionCleared: false,
  };

  // 1) Clear LEFCounsel chat history on the server (best-effort)
  try {
    const res = await fetch('/api/ai/chat', { method: 'DELETE' });
    result.chatCleared = res.ok;
  } catch (err) {
    console.error('[clear-history] Failed to clear chat history:', err);
  }

  // 2) Wipe LEF-specific localStorage keys (preserve theme + auth)
  if (typeof window !== 'undefined') {
    try {
      for (const k of LEF_LOCAL_KEYS_TO_CLEAR) {
        localStorage.removeItem(k);
      }
      result.localCleared = true;
    } catch (err) {
      console.error('[clear-history] localStorage error:', err);
    }

    // 3) Wipe all sessionStorage (quiz dedup, streak banners, etc.)
    try {
      sessionStorage.clear();
      result.sessionCleared = true;
    } catch (err) {
      console.error('[clear-history] sessionStorage error:', err);
    }
  }

  return result;
}

/**
 * Detects whether a user message is asking to clear history/chats.
 * Matches phrases like:
 *   "clear my history"
 *   "delete all chats"
 *   "wipe my conversation"
 *   "reset everything"
 *   "erase memory"
 *   "/clear"  (slash command)
 */
export function isClearHistoryIntent(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // Slash command shortcut
  if (/^\/(clear|reset|wipe)\b/i.test(trimmed)) return true;

  // Natural language: verb + (optional possessive/article) + noun
  const re =
    /\b(clear|delete|wipe|reset|erase|remove)\b[^.?!]{0,40}\b(history|chats?|conversation|conversations|messages|memory|everything|all)\b/i;
  return re.test(trimmed);
}
