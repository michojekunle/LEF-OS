'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import type { DailyEntry } from '@/lib/database.types';

export type EntryInput = {
  entry_date: string; // YYYY-MM-DD
  day_number: number;
  law_completed: boolean;
  economics_completed: boolean;
  finance_completed: boolean;
  study_rating: number | null;
  journal_text: string | null;
  share_insight: string | null;
  is_public: boolean;
};

const MAX_JOURNAL = 4000;
const MAX_INSIGHT = 280;

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function upsertEntryAction(input: EntryInput): Promise<ActionResult<DailyEntry>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };

  const sanitized = {
    user_id: u.user.id,
    entry_date: input.entry_date,
    day_number: input.day_number,
    law_completed: !!input.law_completed,
    economics_completed: !!input.economics_completed,
    finance_completed: !!input.finance_completed,
    study_rating:
      input.study_rating && input.study_rating >= 1 && input.study_rating <= 5
        ? input.study_rating
        : null,
    journal_text: input.journal_text?.trim().slice(0, MAX_JOURNAL) || null,
    share_insight: input.share_insight?.trim().slice(0, MAX_INSIGHT) || null,
    is_public: input.is_public && Boolean((input.share_insight ?? '').trim().length > 0),
  };

  const { data, error } = await sb
    .from('daily_entries')
    .upsert(sanitized, { onConflict: 'user_id,entry_date' })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/journal');
  revalidatePath(`/day/${input.day_number}`);
  revalidatePath('/stats');

  return { ok: true, data: data as DailyEntry };
}

export async function deleteEntryAction(entryId: string): Promise<ActionResult<true>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };
  const { error } = await sb
    .from('daily_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', u.user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/journal');
  return { ok: true, data: true };
}
