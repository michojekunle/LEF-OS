'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import type { Bookmark, LefDomain } from '@/lib/database.types';
import type { ActionResult } from './entries';

export async function addBookmarkAction(input: {
  url: string;
  title?: string | null;
  note?: string | null;
  domain?: LefDomain | null;
  day_number?: number | null;
}): Promise<ActionResult<Bookmark>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };
  let url: string;
  try {
    url = new URL(input.url).toString();
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }
  if (!/^https?:/i.test(url)) return { ok: false, error: 'URL must be http(s)' };

  const { data, error } = await sb
    .from('bookmarks')
    .upsert(
      {
        user_id: u.user.id,
        url,
        title: input.title?.trim().slice(0, 200) || null,
        note: input.note?.trim().slice(0, 1000) || null,
        domain: input.domain ?? null,
        day_number: input.day_number ?? null,
      },
      { onConflict: 'user_id,url' },
    )
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true, data: data as Bookmark };
}

export async function toggleBookmarkDoneAction(id: string): Promise<ActionResult<Bookmark>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };
  const { data: row, error: getErr } = await sb
    .from('bookmarks')
    .select('done')
    .eq('id', id)
    .eq('user_id', u.user.id)
    .single();
  if (getErr) return { ok: false, error: getErr.message };
  const { data, error } = await sb
    .from('bookmarks')
    .update({ done: !row.done })
    .eq('id', id)
    .eq('user_id', u.user.id)
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true, data: data as Bookmark };
}

export async function deleteBookmarkAction(id: string): Promise<ActionResult<true>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };
  const { error } = await sb.from('bookmarks').delete().eq('id', id).eq('user_id', u.user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true, data: true };
}
