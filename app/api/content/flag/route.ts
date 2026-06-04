import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import {
  requireAuth,
  requireAdmin,
  conflict,
  forbidden,
  badRequest,
  serverError,
} from '@/lib/api';
import { buildEmailLayout, sanitizeHtmlText, sendAdminEmail } from '@/lib/email';
import { ContentFlagCreateSchema, ContentFlagResolveSchema } from '@/lib/schemas';
import { DOMAIN_LABELS } from '@/lib/domain';
import { getSiteUrl } from '@/lib/env';
import type { LefDomain } from '@/lib/database.types';
import type { Domain } from '@/data/curriculum-data';

// POST /api/content/flag  — flag a study resource (video or article)
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const user = await requireAuth(sb);

    const parsed = ContentFlagCreateSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest('Invalid input.');

    const { url, title, day_number, domain, content_type, reason } = parsed.data;

    // Prevent duplicate flag from the same authenticated user
    if (user) {
      const { data: existing } = await sb
        .from('content_flags')
        .select('id')
        .eq('url', url)
        .eq('flagged_by', user.id)
        .maybeSingle();
      if (existing) return conflict('You have already flagged this resource.');
    }

    const { error } = await sb
      .from('content_flags')
      .insert({
        url,
        title,
        day_number: day_number ?? null,
        domain: (domain ?? null) as LefDomain | null,
        content_type,
        flagged_by: user?.id ?? null,
        reason: reason ?? null,
      });

    if (error) {
      if (error.code === '23505') return conflict('You have already flagged this resource.');
      throw error;
    }

    // Every content flag fires an email immediately (no threshold)
    void sendContentFlagEmail({ url, title, day_number, domain, content_type, reason, flaggedBy: user?.email ?? 'anonymous' });

    return NextResponse.json({ flagged: true, message: 'Flagged for review. Thank you.' }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/content/flag]', err);
    return serverError('Failed to submit flag.');
  }
}

// PATCH /api/content/flag  — admin marks a flag resolved
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const admin = await requireAdmin(sb);
    if (!admin) return forbidden();

    const parsed = ContentFlagResolveSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest('Missing id');

    const { error } = await sb
      .from('content_flags')
      .update({ resolved: true, resolved_by: admin.id, resolved_at: new Date().toISOString() })
      .eq('id', parsed.data.id);

    if (error) throw error;
    return NextResponse.json({ message: 'Marked resolved.' });
  } catch (err) {
    console.error('[PATCH /api/content/flag]', err);
    return serverError('Failed to resolve flag.');
  }
}

async function sendContentFlagEmail(params: {
  url: string;
  title: string;
  day_number?: number;
  domain?: string;
  content_type: string;
  reason?: string;
  flaggedBy: string;
}): Promise<void> {
  const adminUrl = `${getSiteUrl()}/admin/content-flags`;
  const { url, title, day_number, domain, content_type, reason, flaggedBy } = params;

  const typeIcon = content_type === 'video' ? '▶' : '📄';
  const typeLabel = content_type === 'video' ? 'Video' : 'Article';
  const domainLabel = domain ? (DOMAIN_LABELS[domain as Domain] ?? domain) : '';
  const dayLine = day_number ? `Day ${day_number}${domainLabel ? ` · ${domainLabel}` : ''}` : 'Unknown day';

  const cardHtml = `
  <div class="card">
    <div class="row"><div class="lbl">Type</div><div class="val">${typeIcon} ${typeLabel}</div></div>
    <div class="row"><div class="lbl">Location</div><div class="val">${dayLine}</div></div>
    <div class="row"><div class="lbl">Title</div><div class="val">${sanitizeHtmlText(title)}</div></div>
    <div class="row"><div class="lbl">URL</div><div class="val"><a href="${url}">${sanitizeHtmlText(url)}</a></div></div>
    <div class="row"><div class="lbl">Flagged by</div><div class="val">${sanitizeHtmlText(flaggedBy)}</div></div>
    ${reason ? `<div class="reason">"${sanitizeHtmlText(reason)}"</div>` : ''}
  </div>`;

  await sendAdminEmail({
    subject: `[LEF OS] ⚑ ${typeLabel} flagged — Day ${day_number ?? '?'} ${domain ?? ''}`,
    html: buildEmailLayout({
      title: `${typeIcon} Study resource flagged as broken or wrong`,
      badgeText: '⚑ Content Flagged',
      subTitle: `A user flagged a ${typeLabel.toLowerCase()} link in the enriched study content. Review and update enriched-content.json if needed.`,
      cardHtml,
      actionButton: { text: 'View all flagged content →', url: adminUrl },
      footerText: `Update data/enriched-content.json to replace the broken link, then mark this flag resolved.<br /><a href="${adminUrl}" style="color:#857e76">${adminUrl}</a>`,
    }),
  });
}
