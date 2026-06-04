import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import type { LefDomain } from '@/lib/database.types';

const UpsertSchema = z.object({
  day_number: z.number().int().min(1).max(111),
  domain: z.enum(['law', 'economics', 'finance']),
  question_index: z.number().int().min(0).max(9),
  answer: z.string().min(1).max(5000).trim(),
});

// GET /api/answers?day=N  — load all answers for a day (auth required)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const { data: userData } = await sb.auth.getUser();
    if (!userData.user) return NextResponse.json({ answers: [] });

    const day = Number(new URL(req.url).searchParams.get('day'));
    if (!day || day < 1 || day > 111) {
      return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
    }

    const { data, error } = await sb
      .from('question_answers')
      .select('domain, question_index, answer, updated_at')
      .eq('user_id', userData.user.id)
      .eq('day_number', day);

    if (error) throw error;

    return NextResponse.json({ answers: data ?? [] });
  } catch (err) {
    console.error('[GET /api/answers]', err);
    return NextResponse.json({ error: 'Failed to load answers' }, { status: 500 });
  }
}

// PUT /api/answers  — upsert one answer (auth required)
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const { data: userData } = await sb.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: 'Sign in to save answers.' }, { status: 401 });
    }

    const body: unknown = await req.json();
    const parsed = UpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 422 });
    }

    const { day_number, domain, question_index, answer } = parsed.data;

    const { error } = await sb.from('question_answers').upsert(
      {
        user_id: userData.user.id,
        day_number,
        domain: domain as LefDomain,
        question_index,
        answer,
      },
      { onConflict: 'user_id,day_number,domain,question_index' },
    );

    if (error) throw error;

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error('[PUT /api/answers]', err);
    return NextResponse.json({ error: 'Failed to save answer.' }, { status: 500 });
  }
}

// DELETE /api/answers  — clear one answer
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const { data: userData } = await sb.auth.getUser();
    if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json()) as {
      day_number?: number;
      domain?: string;
      question_index?: number;
    };
    const { day_number, domain, question_index } = body;

    if (!day_number || !domain || question_index === undefined) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 422 });
    }

    await sb
      .from('question_answers')
      .delete()
      .eq('user_id', userData.user.id)
      .eq('day_number', day_number)
      .eq('domain', domain as LefDomain)
      .eq('question_index', question_index);

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[DELETE /api/answers]', err);
    return NextResponse.json({ error: 'Failed to delete answer.' }, { status: 500 });
  }
}
