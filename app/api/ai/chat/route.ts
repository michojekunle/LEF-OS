import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const sb = await supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'LEF Counsel: GEMINI_API_KEY environment variable is not configured on this server.',
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { messages, day, topics } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing or invalid messages history' }, { status: 400 });
    }

    // ── Input validation & sanitization ────────────────────────────────────
    const MAX_MESSAGES = 40; // prevent API cost abuse
    const MAX_MSG_CHARS = 8_000; // per message

    // Clamp message history length
    const trimmedMessages = (messages as unknown[]).slice(-MAX_MESSAGES);

    type ChatMessage = { role: 'user' | 'assistant'; content: string };

    // Validate each message shape and content length
    const safeMsgs: ChatMessage[] = trimmedMessages
      .filter(
        (m): m is ChatMessage =>
          m !== null &&
          typeof m === 'object' &&
          'role' in (m as object) &&
          'content' in (m as object) &&
          ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant') &&
          typeof (m as ChatMessage).content === 'string',
      )
      .map((m) => ({
        role: m.role,
        content: String(m.content).slice(0, MAX_MSG_CHARS),
      }));

    if (safeMsgs.length === 0) {
      return NextResponse.json({ error: 'No valid messages' }, { status: 400 });
    }

    // Validate day is a safe integer 1-122 to prevent prompt injection
    const safeDay: number | null =
      typeof day === 'number' && Number.isInteger(day) && day >= 1 && day <= 122 ? day : null;

    // Strip non-printable chars and limit length from topic strings
    function safeTopic(t: unknown): string {
      if (typeof t !== 'string') return '';
      return t.replace(/[^\x20-\x7E -￿]/g, '').slice(0, 200);
    }

    const safeTopics =
      topics && typeof topics === 'object'
        ? {
            law: safeTopic((topics as Record<string, unknown>).law),
            economics: safeTopic((topics as Record<string, unknown>).economics),
            finance: safeTopic((topics as Record<string, unknown>).finance),
          }
        : null;

    // Format chat history for Gemini contents array
    // Gemini roles: "user" or "model"
    const contents = safeMsgs.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const topicsContext = safeTopics
      ? `Law: "${safeTopics.law || 'Review buffer'}", Economics: "${safeTopics.economics || 'Review buffer'}", Finance: "${safeTopics.finance || 'Review buffer'}"`
      : 'Review day topics';

    const systemInstruction = `You are "LEF Counsel", an elite academic advisor, tutor, and accountability partner for the Law · Economics · Finance (LEF) 4-month curriculum.
Your goal is to help the student understand and apply concepts in Nigerian and global Law, Economics, and Finance.

Context:
- The student is currently studying Day ${safeDay ?? 'unknown'} topics.
- Active Day topics: ${topicsContext}.

Instructions:
1. Maintain an authoritative, sharp, yet encouraging tone. You are an expert counselor.
2. Provide practical Nigerian context (e.g. referencing CAMA 2020, FIRS tax codes, CBN monetary policy, local informal markets) alongside global principles.
3. Be concise and structured. Use Markdown tables, bullet points, and clean lists. Keep explanations under 3-4 paragraphs unless a deep dive is explicitly requested.
4. Always identify yourself as "LEF Counsel".
5. If the user asks for a quiz, you must generate a quick 3-question multiple-choice quiz based on the current day's topics. Format the quiz strictly as a JSON block wrapped in \`\`\`json and \`\`\` code blocks. The JSON must follow this exact format:
{
  "type": "quiz",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Explanation text"
    }
  ]
}
Do not add any other text outside of the JSON block when a quiz is requested.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.7,
            // 4096 handles full quizzes (3 Qs + explanations ≈ 600–900 tokens)
            // and rich markdown answers without cutting off
            maxOutputTokens: 4096,
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API request failed:', errText);
      return NextResponse.json(
        { error: 'Gemini service returned an error.' },
        { status: response.status },
      );
    }

    const resJson = await response.json();
    const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
