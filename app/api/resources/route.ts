import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth, badRequest, conflict, serverError } from '@/lib/api';
import { buildEmailLayout, sanitizeHtmlText, sendAdminEmail } from '@/lib/email';
import { ResourceSubmitSchema } from '@/lib/schemas';
import { DOMAIN_LABELS } from '@/lib/domain';
import { getSiteUrl } from '@/lib/env';
import type { LefDomain, ResourceType } from '@/lib/database.types';
import type { Domain } from '@/data/curriculum-data';

const TYPE_LABEL: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  tool: 'Tool',
  other: 'Other',
};

// GET /api/resources?day=N&domain=X  — approved resources for a day (public)
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const day = Number(searchParams.get('day'));
  const domain = searchParams.get('domain') as LefDomain | null;

  if (!day || day < 1 || day > 111) return badRequest('Invalid day');

  try {
    const sb = await supabaseServer();
    let query = sb
      .from('resource_submissions')
      .select('id, day_number, domain, type, title, url, note, created_at')
      .eq('day_number', day)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (domain) query = query.eq('domain', domain);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ resources: data ?? [] });
  } catch (err) {
    console.error('[GET /api/resources]', err);
    return serverError('Failed to fetch resources');
  }
}

// POST /api/resources  — submit a new resource
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const user = await requireAuth(sb);

    const parsed = ResourceSubmitSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest('Invalid input', parsed.error.flatten());

    const { day_number, domain, type, title, url, note } = parsed.data;

    // Deduplicate: same URL + day + domain already pending or approved
    const { data: existing } = await sb
      .from('resource_submissions')
      .select('id, status')
      .eq('day_number', day_number)
      .eq('domain', domain)
      .eq('url', url)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existing) {
      return conflict(
        existing.status === 'approved'
          ? 'This resource is already listed for this day.'
          : 'This resource is already pending review.',
      );
    }

    const { data, error } = await sb
      .from('resource_submissions')
      .insert({
        day_number,
        domain: domain as LefDomain,
        type: type as ResourceType,
        title,
        url,
        note: note ?? null,
        submitted_by: user?.id ?? null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    // Non-blocking — a send failure never stops the submission
    void sendSubmissionEmail({
      submissionId: data.id,
      day_number,
      domain,
      type,
      title,
      url,
      note,
      submittedBy: user?.email ?? 'anonymous',
    });

    return NextResponse.json(
      { id: data.id, message: 'Submitted for review — thank you!' },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/resources]', err);
    return serverError('Failed to submit resource');
  }
}

async function sendSubmissionEmail(params: {
  submissionId: string;
  day_number: number;
  domain: string;
  type: string;
  title: string;
  url: string;
  note?: string | null;
  submittedBy: string;
}): Promise<void> {
  const reviewUrl = `${getSiteUrl()}/admin/resources`;
  const { submissionId, day_number, domain, type, title, url, note, submittedBy } = params;
  const domainLabel = DOMAIN_LABELS[domain as Domain] ?? domain;

  const cardHtml = `
  <div class="card">
    <div class="row"><div class="lbl">Day</div><div class="val">Day ${day_number}</div></div>
    <div class="row"><div class="lbl">Domain</div><div class="val">${domainLabel}</div></div>
    <div class="row"><div class="lbl">Type</div><div class="val">${TYPE_LABEL[type] ?? type}</div></div>
    <div class="row"><div class="lbl">Title</div><div class="val">${sanitizeHtmlText(title)}</div></div>
    <div class="row"><div class="lbl">URL</div><div class="val"><a href="${url}">${sanitizeHtmlText(url)}</a></div></div>
    <div class="row"><div class="lbl">From</div><div class="val">${sanitizeHtmlText(submittedBy)}</div></div>
    ${note ? `<div class="reason">"${sanitizeHtmlText(note)}"</div>` : ''}
  </div>`;

  await sendAdminEmail({
    subject: `[LEF OS] New resource submitted — Day ${day_number} ${domain}`,
    html: buildEmailLayout({
      title: 'Resource waiting for review',
      badgeText: 'New Submission',
      subTitle: 'Someone submitted a new resource link. Review and approve or reject it below.',
      cardHtml,
      actionButton: { text: 'Review Submission →', url: reviewUrl },
      footerText: `Submission ID: <span class="id">${submissionId}</span><br />Visit <a href="${reviewUrl}" style="color:#857e76">/admin/resources</a> to manage all pending submissions.`,
    }),
  });
}
