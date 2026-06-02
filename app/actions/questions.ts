'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import type { Question, LefDomain } from '@/lib/database.types';
import type { ActionResult } from './entries';

const MAX_Q = 1000;
const MAX_A = 4000;

export async function addQuestionAction(input: {
  body: string;
  day_number?: number | null;
  domain?: LefDomain | null;
}): Promise<ActionResult<Question>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };
  const body = input.body.trim().slice(0, MAX_Q);
  if (!body) return { ok: false, error: 'Question cannot be empty' };
  const { data, error } = await sb
    .from('questions')
    .insert({
      user_id: u.user.id,
      body,
      day_number: input.day_number ?? null,
      domain: input.domain ?? null,
    })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  if (input.day_number) revalidatePath(`/day/${input.day_number}`);
  return { ok: true, data: data as Question };
}

export async function answerQuestionAction(input: {
  id: string;
  answer: string;
}): Promise<ActionResult<Question>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };
  const answer = input.answer.trim().slice(0, MAX_A);
  const { data, error } = await sb
    .from('questions')
    .update({ answer: answer || null, answered: answer.length > 0 })
    .eq('id', input.id)
    .eq('user_id', u.user.id)
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true, data: data as Question };
}

export async function deleteQuestionAction(id: string): Promise<ActionResult<true>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };
  const { error } = await sb.from('questions').delete().eq('id', id).eq('user_id', u.user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true, data: true };
}
