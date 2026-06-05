import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth, unauthorized, badRequest, serverError } from '@/lib/api';
import { QuestionAnswerUpsertSchema, QuestionAnswerDeleteSchema } from '@/lib/schemas';
import type { LefDomain } from '@/lib/database.types';

// GET /api/answers?day=N  — load all saved answers for a day (auth required)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const user = await requireAuth(sb);
    if (!user) return NextResponse.json({ answers: [] });

    const day = Number(new URL(req.url).searchParams.get('day'));
    if (!day || day < 1 || day > 111) return badRequest('Invalid day');

    const { data, error } = await sb
      .from('question_answers')
      .select('domain, question_index, answer, updated_at')
      .eq('user_id', user.id)
      .eq('day_number', day);

    if (error) throw error;
    return NextResponse.json({ answers: data ?? [] });
  } catch (err) {
    console.error('[GET /api/answers]', err);
    return serverError('Failed to load answers');
  }
}

// PUT /api/answers  — upsert one answer (auth required)
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const user = await requireAuth(sb);
    if (!user) return unauthorized('Sign in to save answers.');

    const parsed = QuestionAnswerUpsertSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest('Invalid input.', parsed.error.flatten());

    const { day_number, domain, question_index, answer } = parsed.data;

    const { error } = await sb
      .from('question_answers')
      .upsert(
        { user_id: user.id, day_number, domain: domain as LefDomain, question_index, answer },
        { onConflict: 'user_id,day_number,domain,question_index' },
      );
    if (error) throw error;

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error('[PUT /api/answers]', err);
    return serverError('Failed to save answer.');
  }
}

// DELETE /api/answers  — clear one answer (auth required)
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const user = await requireAuth(sb);
    if (!user) return unauthorized();

    const parsed = QuestionAnswerDeleteSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest('Missing or invalid fields.');

    const { day_number, domain, question_index } = parsed.data;

    await sb
      .from('question_answers')
      .delete()
      .eq('user_id', user.id)
      .eq('day_number', day_number)
      .eq('domain', domain as LefDomain)
      .eq('question_index', question_index);

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[DELETE /api/answers]', err);
    return serverError('Failed to delete answer.');
  }
}
