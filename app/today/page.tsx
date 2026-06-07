import { redirect } from 'next/navigation';
import {
  clampDay,
  getDayNumber,
  isBeforeCourse,
  isAfterCourse,
  getCourseWindow,
  toCurriculumDay,
} from '@/lib/utils';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function TodayRedirect() {
  // Load the user's personal course window so the redirect respects
  // their custom start date and pacing.
  let startDate: string | null = null;
  let durationMonths: number | null = null;

  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data: u } = await sb.auth.getUser();
      if (u.user) {
        const { data: s } = await sb
          .from('user_settings')
          .select('course_start_date, course_duration_months')
          .eq('user_id', u.user.id)
          .maybeSingle();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings = s as any;
        startDate = settings?.course_start_date ?? null;
        durationMonths = settings?.course_duration_months ?? null;
      }
    } catch {
      // ignore — fall back to defaults
    }
  }

  const courseWindow = getCourseWindow(startDate, durationMonths);
  const today = new Date();

  if (isBeforeCourse(today, courseWindow)) redirect('/day/1');
  if (isAfterCourse(today, courseWindow)) redirect('/day/111');

  const calendarDay = clampDay(getDayNumber(today, courseWindow));
  const curriculumDay = toCurriculumDay(calendarDay, courseWindow.totalDays);
  redirect(`/day/${curriculumDay}`);
}
