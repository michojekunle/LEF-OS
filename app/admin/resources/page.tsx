import { redirect } from 'next/navigation';
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

  const { data: pending } = await sb
    .from('resource_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const { data: recent } = await sb
    .from('resource_submissions')
    .select('*')
    .in('status', ['approved', 'rejected'])
    .order('reviewed_at', { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-8 md:px-6">
      <header>
        <h1 className="font-display text-3xl tracking-tight">Resource Review</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Review community-submitted resources. Approved links appear on the day page immediately.
        </p>
      </header>

      <ResourceReviewPanel
        pending={(pending ?? []) as ResourceSubmission[]}
        recent={(recent ?? []) as ResourceSubmission[]}
      />
    </div>
  );
}
