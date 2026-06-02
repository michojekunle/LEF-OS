import { redirect } from 'next/navigation';
import { clampDay, getDayNumber, isBeforeCourse, isAfterCourse } from '@/lib/utils';
import { TOTAL_CALENDAR_DAYS } from '@/data/curriculum-data';

export const dynamic = 'force-dynamic';

export default function TodayRedirect() {
  if (isBeforeCourse()) redirect('/day/1');
  if (isAfterCourse()) redirect(`/day/${TOTAL_CALENDAR_DAYS}`);
  redirect(`/day/${clampDay(getDayNumber())}`);
}
