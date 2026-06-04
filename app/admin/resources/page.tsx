import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Flag } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase-server';
import { hasSupabaseConfig } from '@/lib/supabase';
import { ResourceReviewPanel } from './ResourceReviewPanel';
import type { ResourceSubmission } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

export default async function AdminResourcesPage() {
  if (!hasSupabaseConfig()) redirect('/');

  const sb = await supabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) redirect('/login?next=/admin/resources');

  const { data: profile } = await sb
    .from('profiles')
    .select('is_primary_user')
    .eq('id', userData.user.id)
    .single();

  if (!profile?.is_primary_user) redirect('/dashboard');

  const [{ data: pending }, { data: flagged }, { data: recent }] = await Promise.all([
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

  // Attach flag counts to flagged submissions
  const flaggedIds = (flagged ?? []).map((s) => s.id);
  let flagCounts: Record<string, number> = {};
  if (flaggedIds.length > 0) {
    const { data: counts } = await sb
      .from('resource_flags')
      .select('submission_id')
      .in('submission_id', flaggedIds);
    (counts ?? []).forEach((r) => {
      flagCounts[r.submission_id] = (flagCounts[r.submission_id] ?? 0) + 1;
    });
  }

  const flaggedWithCounts = (flagged ?? []).map((s) => ({
    ...s,
    flag_count: flagCounts[s.id] ?? 0,
  })) as (ResourceSubmission & { flag_count: number })[];

  const pendingCount = (pending ?? []).length;
  const flaggedCount = flaggedWithCounts.length;

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-8 md:px-6">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-tight">Resource Review</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Approve submissions, remove flagged content, and keep the curriculum resources clean.
            </p>
          </div>
          <Link
            href="/admin/content-flags"
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-red hover:text-red"
          >
            <Flag size={13} />
            Flagged study content
          </Link>
        </div>
        {(pendingCount > 0 || flaggedCount > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {flaggedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-red/30 bg-red/10 px-2.5 py-1 text-xs font-semibold text-red">
                ⚑ {flaggedCount} flagged
              </span>
            )}
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
                {pendingCount} pending
              </span>
            )}
          </div>
        )}
      </header>

      <ResourceReviewPanel
        pending={(pending ?? []) as ResourceSubmission[]}
        flagged={flaggedWithCounts}
        recent={(recent ?? []) as ResourceSubmission[]}
      />
    </div>
  );
}
