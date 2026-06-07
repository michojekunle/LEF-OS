import { NextResponse, NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import type { DailyEntry } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

function csvEscape(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const includeParam = req.nextUrl.searchParams.get('include');
  const inc = includeParam
    ? new Set(includeParam.split(','))
    : new Set(['entries', 'journal', 'insights', 'notes', 'questions', 'answers']);
  const wantJournal = inc.has('journal');
  const wantInsights = inc.has('insights');
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data } = await sb
    .from('daily_entries')
    .select('*')
    .eq('user_id', u.user.id)
    .order('entry_date', { ascending: true });

  const entries = (data as DailyEntry[] | null) ?? [];

  const headers = [
    'entry_date',
    'day_number',
    'law',
    'economics',
    'finance',
    'study_rating',
    'is_public',
    ...(wantInsights ? ['share_insight'] : []),
    ...(wantJournal ? ['journal_text'] : []),
  ];

  const lines = [headers.join(',')];
  for (const e of entries) {
    lines.push(
      [
        e.entry_date,
        e.day_number,
        e.law_completed,
        e.economics_completed,
        e.finance_completed,
        e.study_rating ?? '',
        e.is_public,
        ...(wantInsights ? [e.share_insight ?? ''] : []),
        ...(wantJournal ? [e.journal_text ?? ''] : []),
      ]
        .map(csvEscape)
        .join(','),
    );
  }

  const body = lines.join('\n');
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="lef-entries-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
