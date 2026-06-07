-- Allow users to set their own course start date and pace (4–12 months).
-- Null values fall back to the app defaults (June 1 2026, 4 months).

alter table user_settings
  add column if not exists course_start_date     date,
  add column if not exists course_duration_months integer
    default 4
    check (course_duration_months between 4 and 12);
