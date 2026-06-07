'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { getCourseWindow, type CourseWindow } from '@/lib/utils';
import type { Domain } from '@/data/curriculum-data';

export type CourseContextValue = CourseWindow & {
  /** Domains the user chose to study. Defaults to all three. */
  preferredDomains: Domain[];
};

const ALL_DOMAINS: Domain[] = ['law', 'economics', 'finance'];

const defaultContext: CourseContextValue = {
  ...getCourseWindow(),
  preferredDomains: ALL_DOMAINS,
};

const CourseContext = createContext<CourseContextValue>(defaultContext);

export function CourseProvider({
  startDate,
  durationMonths,
  preferredDomains,
  children,
}: {
  startDate?: string | null;
  durationMonths?: number | null;
  preferredDomains?: Domain[] | null;
  children: ReactNode;
}) {
  const window = getCourseWindow(startDate, durationMonths);
  // Validate against known domain values — reject anything else from DB
  const VALID: Domain[] = ['law', 'economics', 'finance'];
  const validated =
    preferredDomains?.filter((d): d is Domain => (VALID as string[]).includes(d)).filter(Boolean) ??
    [];
  const domains: Domain[] = validated.length > 0 ? validated : ALL_DOMAINS;

  return (
    <CourseContext.Provider value={{ ...window, preferredDomains: domains }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse(): CourseContextValue {
  return useContext(CourseContext);
}
