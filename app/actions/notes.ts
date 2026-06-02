'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import type { DayNote, LefDomain } from '@/lib/database.types';
import type { ActionResult } from './entries';

const MAX_NOTE = 8000;

export async function upsertDayNoteAction(input: {
  day_number: number;
  domain: LefDomain;
  body: string;
}): Promise<ActionResult<DayNote | null>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };

  const body = input.body.trim().slice(0, MAX_NOTE);

  if (body.length === 0) {
    // Empty note → delete row if it exists
    const { error } = await sb
      .from('day_notes')
      .delete()
      .eq('user_id', u.user.id)
      .eq('day_number', input.day_number)
      .eq('domain', input.domain);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/day/${input.day_number}`);
    revalidatePath('/dashboard');
    return { ok: true, data: null };
  }

  const { data, error } = await sb
    .from('day_notes')
    .upsert(
      {
        user_id: u.user.id,
        day_number: input.day_number,
        domain: input.domain,
        body,
      },
      { onConflict: 'user_id,day_number,domain' },
    )
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/day/${input.day_number}`);
  revalidatePath('/dashboard');
  return { ok: true, data: data as DayNote };
}
