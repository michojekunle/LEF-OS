/**
 * lib/api.ts
 * Shared helpers for Next.js API route handlers.
 *
 * requireAuth()  — returns the authenticated user or null
 * requireAdmin() — returns the user only if is_primary_user = true
 * unauthorized() — returns a 401 NextResponse
 * forbidden()    — returns a 403 NextResponse
 * badRequest()   — returns a 400/422 NextResponse
 * serverError()  — returns a 500 NextResponse
 */

import { NextResponse } from 'next/server';
import { supabaseServer } from './supabase-server';

type SB = Awaited<ReturnType<typeof supabaseServer>>;

export type AuthedUser = { id: string; email: string | undefined };

/** Returns the current user, or null if unauthenticated. */
export async function requireAuth(sb: SB): Promise<AuthedUser | null> {
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) return null;
  return { id: user.id, email: user.email };
}

/** Returns the user only when they have is_primary_user = true. */
export async function requireAdmin(sb: SB): Promise<AuthedUser | null> {
  const user = await requireAuth(sb);
  if (!user) return null;
  const { data: profile } = await sb
    .from('profiles')
    .select('is_primary_user')
    .eq('id', user.id)
    .single();
  return profile?.is_primary_user ? user : null;
}

// ── Standard error responses ──────────────────────────────────────────────────

export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message: string, details?: unknown): NextResponse {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status: 422 });
}

export function conflict(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function notFound(message = 'Not found'): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = 'Internal server error'): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}
