import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { hasSupabaseConfig } from '@/lib/supabase';
import { ContentFlagsPanel } from './ContentFlagsPanel';
import type { ContentFlag } from '@/lib/database.types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminContentFlagsPage() {
  if (!hasSupabaseConfig()) redirect('/');

  const sb = await supabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) redirect('/login?next=/admin/content-flags');

  const { data: profile } = await sb
    .from('profiles')
    .select('is_primary_user')
    .eq('id', userData.user.id)
    .single();

  if (!profile?.is_primary_user) redirect('/dashboard');

  const [{ data: open }, { data: resolved }] = await Promise.all([
    sb
      .from('content_flags')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false }),
    sb
      .from('content_flags')
      .select('*')
      .eq('resolved', true)
      .order('resolved_at', { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-8 md:px-6">
      <header className="space-y-3">
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={11} /> Resource Review
        </Link>
        <h1 className="font-display text-3xl tracking-tight">Flagged Study Content</h1>
        <p className="text-sm text-text-secondary">
          Broken videos, wrong articles, or outdated links flagged by users in the enriched study
          content. Fix the relevant entry in{' '}
          <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">
            data/enriched-content.json
          </code>{' '}
          then mark the flag resolved.
        </p>
        {(open ?? []).length > 0 && (
          <span className="border-red/30 bg-red/10 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold text-red">
            ⚑ {(open ?? []).length} open
          </span>
        )}
      </header>

      <ContentFlagsPanel
        open={(open ?? []) as ContentFlag[]}
        resolved={(resolved ?? []) as ContentFlag[]}
      />
    </div>
  );
}
