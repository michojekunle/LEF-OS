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

  const [
    { data: profile },
    { data: settings },
    { data: reminders },
    { data: subscriptions }
  ] = await Promise.all([
    sb.from('profiles').select('*').eq('id', userData.user.id).maybeSingle(),
    sb.from('user_settings').select('*').eq('user_id', userData.user.id).maybeSingle(),
    sb.from('custom_reminders').select('*').eq('user_id', userData.user.id).order('reminder_time', { ascending: true }),
    sb.from('push_subscriptions').select('id').eq('user_id', userData.user.id)
  ]);

  return (
    <SettingsClient
      userId={userData.user.id}
      email={userData.user.email ?? ''}
      displayName={profile?.display_name ?? null}
      initialSettings={settings ?? { daily_reminder_enabled: true, timezone: 'Africa/Lagos' }}
      initialReminders={reminders ?? []}
      hasActivePush={Boolean(subscriptions && subscriptions.length > 0)}
    />
  );
}

function NotConfigured() {
  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-16 text-center">
      <h1 className="font-display text-3xl mb-3">Supabase not configured</h1>
      <p className="text-text-secondary max-w-md mx-auto text-sm">
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
