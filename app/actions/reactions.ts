'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import type { ReactionKind } from '@/lib/database.types';
import type { ActionResult } from './entries';

export async function toggleReactionAction(input: {
  entry_id: string;
  kind: ReactionKind;
}): Promise<ActionResult<{ added: boolean }>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Sign in to react' };

  const { data: existing } = await sb
    .from('journal_reactions')
    .select('id')
    .eq('entry_id', input.entry_id)
    .eq('user_id', u.user.id)
    .eq('kind', input.kind)
    .maybeSingle();

  if (existing) {
    const { error } = await sb
      .from('journal_reactions')
      .delete()
      .eq('id', existing.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/journal');
    return { ok: true, data: { added: false } };
  }

  const { error } = await sb.from('journal_reactions').insert({
    entry_id: input.entry_id,
    user_id: u.user.id,
    kind: input.kind,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/journal');
  return { ok: true, data: { added: true } };
}
