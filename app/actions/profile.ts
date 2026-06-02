'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import type { Profile } from '@/lib/database.types';
import type { ActionResult } from './entries';

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export async function updateProfileAction(input: {
  display_name?: string | null;
  username?: string | null;
  bio?: string | null;
  default_public?: boolean;
}): Promise<ActionResult<Profile>> {
  const sb = await supabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { ok: false, error: 'Not signed in' };

  const patch: Partial<Profile> = {};

  if (input.display_name !== undefined) {
    patch.display_name = input.display_name?.trim().slice(0, 60) || null;
  }
  if (input.username !== undefined) {
    const u2 = input.username?.trim().toLowerCase() || null;
    if (u2 !== null && !USERNAME_RE.test(u2)) {
      return {
        ok: false,
        error: 'Username must be 3–24 chars, lowercase letters / numbers / _',
      };
    }
    if (u2) {
      const { data: existing } = await sb
        .from('profiles')
        .select('id')
        .eq('username', u2)
        .neq('id', u.user.id)
        .maybeSingle();
      if (existing) return { ok: false, error: 'Username already taken' };
    }
    patch.username = u2;
  }
  if (input.bio !== undefined) {
    patch.bio = input.bio?.trim().slice(0, 280) || null;
  }
  if (input.default_public !== undefined) {
    patch.default_public = Boolean(input.default_public);
  }

  const { data, error } = await sb
    .from('profiles')
    .update(patch)
    .eq('id', u.user.id)
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  if (data.username) revalidatePath(`/u/${data.username}`);
  return { ok: true, data: data as Profile };
}
