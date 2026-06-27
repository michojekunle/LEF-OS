import { NextResponse, NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { findDayMeta } from '@/data/curriculum-data';
import { DOMAIN_LABELS } from '@/lib/domain';
import type { DailyEntry, DayNote, LefDomain, Question } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  // Parse ?include= param — default: all sections
  const includeParam = req.nextUrl.searchParams.get('include');
  const inc = includeParam
    ? new Set(includeParam.split(','))
    : new Set(['entries', 'journal', 'insights', 'notes', 'questions', 'answers']);
  const wantEntries = inc.has('entries');
  const wantJournal = inc.has('journal');
  const wantInsights = inc.has('insights');
  const wantNotes = inc.has('notes');
  const wantQuestions = inc.has('questions');

  const [{ data: profile }, { data: entriesData }, { data: notesData }, { data: qData }] =
    await Promise.all([
      sb.from('profiles').select('*').eq('id', u.user.id).maybeSingle(),
      sb
        .from('daily_entries')
        .select('*')
        .eq('user_id', u.user.id)
        .order('entry_date', { ascending: true }),
      sb
        .from('day_notes')
        .select('*')
        .eq('user_id', u.user.id)
        .order('day_number', { ascending: true }),
      sb
        .from('questions')
        .select('*')
        .eq('user_id', u.user.id)
        .order('created_at', { ascending: true }),
    ]);

  const entries = (entriesData as DailyEntry[] | null) ?? [];
  const notes = (notesData as DayNote[] | null) ?? [];
  const questions = (qData as Question[] | null) ?? [];

  const notesByDay = new Map<number, DayNote[]>();
  for (const n of notes) {
    const arr = notesByDay.get(n.day_number) ?? [];
    arr.push(n);
    notesByDay.set(n.day_number, arr);
  }

  const questionsByDay = new Map<number | 'unanchored', Question[]>();
  for (const q of questions) {
    const k = q.day_number ?? ('unanchored' as const);
    const arr = questionsByDay.get(k) ?? [];
    arr.push(q);
    questionsByDay.set(k, arr);
  }

  const lines: string[] = [];
  const name = profile?.display_name ?? u.user.email ?? 'Learner';
  const stamp = new Date().toISOString().slice(0, 10);

  lines.push(`# LEF OS — ${name}'s Archive`);
  lines.push('');
  lines.push(`_Exported ${stamp} · Law · Economics · Finance_`);
  lines.push('');
  lines.push(
    `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} · ${notes.length} note${
      notes.length === 1 ? '' : 's'
    } · ${questions.length} question${questions.length === 1 ? '' : 's'}`,
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const e of wantEntries ? entries : []) {
    lines.push(`## Day ${e.day_number} — ${e.entry_date}`);
    const flags: string[] = [];
    if (e.law_completed) flags.push('Law');
    if (e.economics_completed) flags.push('Economics');
    if (e.finance_completed) flags.push('Finance');
    lines.push('');
    if (flags.length) lines.push(`**Completed**: ${flags.join(' · ')}`);
    if (e.study_rating) {
      const tier = e.study_rating >= 3 ? 'A (Hardcore)' : e.study_rating === 2 ? 'B (Dedicated)' : 'C (Minimum Viable)';
      lines.push(`**Depth**: Tier ${tier}`);
    }
    if (wantInsights && e.is_public && e.share_insight)
      lines.push(`**Public insight**: ${e.share_insight}`);
    lines.push('');

    // Curriculum topics for context
    const topics: string[] = [];
    for (const d of ['law', 'economics', 'finance'] as LefDomain[]) {
      const meta = findDayMeta(d, e.day_number);
      if (meta) topics.push(`- _${DOMAIN_LABELS[d]}_: ${meta.topic}`);
    }
    if (topics.length) {
      lines.push('**Topics**');
      lines.push(...topics);
      lines.push('');
    }

    if (wantJournal && e.journal_text) {
      lines.push('### Journal');
      lines.push('');
      lines.push(e.journal_text);
      lines.push('');
    }

    if (wantNotes) {
      const dayNotes = notesByDay.get(e.day_number) ?? [];
      if (dayNotes.length) {
        lines.push('### Notes');
        for (const d of ['law', 'economics', 'finance'] as LefDomain[]) {
          const note = dayNotes.find((x) => x.domain === d);
          if (note) {
            lines.push(`**${DOMAIN_LABELS[d]}**`);
            lines.push('');
            lines.push(note.body);
            lines.push('');
          }
        }
      }
    }

    if (wantQuestions) {
      const dayQs = questionsByDay.get(e.day_number);
      if (dayQs && dayQs.length) {
        lines.push('### Questions');
        for (const q of dayQs) {
          lines.push(`- ${q.answered ? '✓' : '○'} ${q.body}`);
          if (q.answer) lines.push(`  > ${q.answer.replace(/\n/g, '\n  > ')}`);
        }
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
  }

  // Trailing notes without an entry-day
  const orphanNotes = wantNotes
    ? notes.filter((n) => !entries.some((e) => e.day_number === n.day_number))
    : [];
  if (orphanNotes.length) {
    lines.push('## Notes without a logged entry');
    lines.push('');
    for (const n of orphanNotes) {
      lines.push(`### Day ${n.day_number} — ${DOMAIN_LABELS[n.domain]}`);
      lines.push('');
      lines.push(n.body);
      lines.push('');
    }
  }

  // Unanchored questions
  const orphans = wantQuestions ? questionsByDay.get('unanchored') : undefined;
  if (orphans && orphans.length) {
    lines.push('## Open questions (no day)');
    lines.push('');
    for (const q of orphans) {
      lines.push(`- ${q.answered ? '✓' : '○'} ${q.body}`);
      if (q.answer) lines.push(`  > ${q.answer.replace(/\n/g, '\n  > ')}`);
    }
  }

  const body = lines.join('\n');
  const slug = (profile?.username ?? 'lef-archive').replace(/[^a-z0-9_-]/gi, '-');

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}-${stamp}.md"`,
      'Cache-Control': 'no-store',
    },
  });
}
