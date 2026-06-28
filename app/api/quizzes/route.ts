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

    const body = await request.json();
    const { day_number, domain, score, total } = body;

    // Simple validations
    if (
      typeof day_number !== 'number' ||
      typeof domain !== 'string' ||
      typeof score !== 'number' ||
      typeof total !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid or missing fields' }, { status: 400 });
    }

    const { data, error } = await (sb as any)
      .from('user_quizzes')
      .insert([
        {
          user_id: user.id,
          day_number,
          domain,
          score,
          total,
        },
      ])
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
