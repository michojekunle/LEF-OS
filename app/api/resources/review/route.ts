import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin, forbidden, badRequest, serverError } from '@/lib/api';
import { ResourceReviewSchema } from '@/lib/schemas';

// GET /api/resources/review  — list pending + flagged submissions (admin only)
export async function GET(): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const admin = await requireAdmin(sb);
    if (!admin) return forbidden();

    const [
      { data: pending, error: e1 },
      { data: flagged, error: e2 },
      { data: recent, error: e3 },
    ] = await Promise.all([
      sb
        .from('resource_submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
      sb
        .from('resource_submissions')
        .select('*')
        .eq('status', 'flagged')
        .order('created_at', { ascending: false }),
      sb
        .from('resource_submissions')
        .select('*')
        .in('status', ['approved', 'rejected'])
        .order('reviewed_at', { ascending: false })
        .limit(20),
    ]);

    if (e1 ?? e2 ?? e3) throw e1 ?? e2 ?? e3;

    // Attach flag counts to flagged submissions
    const flaggedIds = (flagged ?? []).map((s) => s.id);
    const flagCounts: Record<string, number> = {};
    if (flaggedIds.length > 0) {
      const { data: counts } = await sb
        .from('resource_flags')
        .select('submission_id')
        .in('submission_id', flaggedIds);
      (counts ?? []).forEach((r) => {
        flagCounts[r.submission_id] = (flagCounts[r.submission_id] ?? 0) + 1;
      });
    }

    return NextResponse.json({
      pending: pending ?? [],
      flagged: (flagged ?? []).map((s) => ({ ...s, flag_count: flagCounts[s.id] ?? 0 })),
      recent: recent ?? [],
    });
  } catch (err) {
    console.error('[GET /api/resources/review]', err);
    return serverError('Failed to fetch submissions');
  }
}

// PATCH /api/resources/review  — approve / reject / remove (admin only)
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const sb = await supabaseServer();
    const admin = await requireAdmin(sb);
    if (!admin) return forbidden();

    const parsed = ResourceReviewSchema.safeParse(await req.json());
    if (!parsed.success) return badRequest('Invalid input');

    const { id, action } = parsed.data;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { error } = await sb
      .from('resource_submissions')
      .update({ status: newStatus, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;

    // Purge flags when removing so the log stays clean
    if (action === 'remove') {
      await sb.from('resource_flags').delete().eq('submission_id', id);
    }

    return NextResponse.json({
      message: `Submission ${action === 'remove' ? 'removed' : newStatus}.`,
    });
  } catch (err) {
    console.error('[PATCH /api/resources/review]', err);
    return serverError('Failed to update submission');
  }
}
