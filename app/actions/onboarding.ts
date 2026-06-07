'use server';

import { supabaseServer } from '@/lib/supabase-server';

export type OnboardingPayload = {
  preferredDomains: string[];
  courseStartDate: string;
  courseDurationMonths: number;
  dailyReminderEnabled: boolean;
  timezone: string;
};

export async function completeOnboardingAction(
  payload: OnboardingPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const sb = await supabaseServer();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return { ok: false, error: 'Not signed in' };

    // Use upsert so the action works whether the row already exists or not.
    // New users who sign up before a settings row is seeded won't silently fail.
    const { error } = await sb
      .from('user_settings')
      .upsert({
        user_id: u.user.id,
        email: u.user.email ?? '',
        onboarding_completed: true,
        preferred_domains: payload.preferredDomains,
        course_start_date: payload.courseStartDate || null,
        course_duration_months: Math.min(Math.max(payload.courseDurationMonths, 4), 12),
        daily_reminder_enabled: payload.dailyReminderEnabled,
        timezone: payload.timezone,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('user_id', u.user.id);

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error('[onboarding]', err);
    return { ok: false, error: 'Failed to save onboarding. Please try again.' };
  }
}
