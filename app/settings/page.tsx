import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { SettingsClient } from './SettingsClient';

export const metadata = {
  title: 'Settings — LEF',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  if (!hasSupabaseConfig()) {
    return <NotConfigured />;
  }

  const sb = await supabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) redirect('/login?next=%2Fsettings');

  const [{ data: profile }, { data: settings }, { data: reminders }, { data: subscriptions }] =
    await Promise.all([
      sb.from('profiles').select('*').eq('id', userData.user.id).maybeSingle(),
      sb
        .from('user_settings')
        .select(
          'daily_reminder_enabled, timezone, course_start_date, course_duration_months, preferred_domains',
        )
        .eq('user_id', userData.user.id)
        .maybeSingle(),
      sb
        .from('custom_reminders')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('reminder_time', { ascending: true }),
      sb.from('push_subscriptions').select('id').eq('user_id', userData.user.id),
    ]);

  return (
    <SettingsClient
      userId={userData.user.id}
      email={userData.user.email ?? ''}
      username={profile?.username ?? null}
      displayName={profile?.display_name ?? null}
      bio={profile?.bio ?? null}
      defaultPublic={profile?.default_public ?? false}
      initialSettings={
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (settings as any) ?? {
          daily_reminder_enabled: true,
          timezone: 'Africa/Lagos',
          course_start_date: null,
          course_duration_months: 4,
        }
      }
      initialReminders={reminders ?? []}
      hasActivePush={Boolean(subscriptions && subscriptions.length > 0)}
    />
  );
}

function NotConfigured() {
  return (
    <div className="mx-auto max-w-content px-5 py-16 text-center md:px-6">
      <h1 className="mb-3 font-display text-3xl">Supabase not configured</h1>
      <p className="mx-auto max-w-md text-sm text-text-secondary">
        Add <code className="text-gold">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code className="text-gold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{' '}
        <code>.env.local</code>, then restart the dev server. See README.
      </p>
      <Link href="/" className="btn btn-secondary mt-6 inline-flex">
        Back home
      </Link>
    </div>
  );
}
