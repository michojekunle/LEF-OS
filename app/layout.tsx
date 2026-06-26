import type { Metadata, Viewport } from 'next';
import { Montserrat, Lexend } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { MobileTabBar } from '@/components/MobileTabBar';
import { ToastProvider } from '@/components/Toast';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import { InstallPrompt } from '@/components/InstallPrompt';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TourShell } from '@/components/TourShell';
import { OfflineBanner } from '@/components/OfflineBanner';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { getDayNumber, clampDay, getCourseWindow } from '@/lib/utils';
import { LEFCounselPanel } from '@/components/LEFCounselPanel';
import { CourseProvider } from '@/components/CourseContext';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { AchievementProvider } from '@/components/AchievementProvider';

// Montserrat: geometric sans for display headings — authoritative, editorial, strong
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

// Lexend: designed by reading research to reduce visual stress — ideal for dense study content
const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
        ? process.env.NEXT_PUBLIC_SITE_URL
        : `https://${process.env.NEXT_PUBLIC_SITE_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000',
  ),
  title: "Law · Economics · Finance — A Founder's 4-Month Curriculum",
  description:
    'A 4-month personal learning OS for studying Nigerian and global Law, Economics, and Finance. Learned in public.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-32.png',
    shortcut: '/icon-32.png',
    apple: '/icon-192.png',
  },
  applicationName: 'LEF OS',
  appleWebApp: {
    capable: true,
    title: 'LEF OS',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Law · Economics · Finance',
    description: "A Founder's 4-Month Curriculum. Learned in public.",
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 1200,
        alt: 'Law Economics Finance Curriculum',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Law · Economics · Finance',
    description: "A Founder's 4-Month Curriculum. Learned in public.",
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0D0D0D' },
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

// Inline script: sets data-theme on <html> before first paint to avoid flash
const themeScript = `(function(){try{var t=localStorage.getItem('lef-theme');var resolved=t==='light'?'light':t==='dark'?'dark':window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.setAttribute('data-theme',resolved);}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let activeDay = 1;
  let userId: string | undefined = undefined;
  let courseStartDate: string | null = null;
  let courseDurationMonths: number | null = null;
  let preferredDomains: string[] | null = null;
  let needsOnboarding = false;

  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data } = await sb.auth.getUser();
      if (data.user) {
        userId = data.user.id;
        const { data: settings } = await sb
          .from('user_settings')
          .select(
            'course_start_date, course_duration_months, onboarding_completed, preferred_domains',
          )
          .eq('user_id', data.user.id)
          .maybeSingle();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = settings as any;
        courseStartDate = s?.course_start_date ?? null;
        courseDurationMonths = s?.course_duration_months ?? null;
        preferredDomains = s?.preferred_domains ?? null;
        needsOnboarding = s ? s.onboarding_completed === false : true;
        activeDay = clampDay(
          getDayNumber(new Date(), getCourseWindow(courseStartDate, courseDurationMonths)),
        );
      }
    } catch {
      // Ignored — Supabase may not be configured in dev
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Law · Economics · Finance',
    description:
      'A 4-month personal learning OS for studying Nigerian and global Law, Economics, and Finance. Learned in public.',
    provider: {
      '@type': 'Organization',
      name: 'LEF OS',
      sameAs: 'https://github.com/michojekunle/lef-os',
    },
  };

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${lexend.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of wrong theme — must run synchronously before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Sankofa fonts — Cormorant Garamond (headings), Source Serif 4 (body), DM Mono (metadata) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <CourseProvider
            startDate={courseStartDate}
            durationMonths={courseDurationMonths}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            preferredDomains={preferredDomains as any}
          >
            <TourShell>
              <ToastProvider>
                <CommandPaletteProvider>
                  <OfflineBanner />
                  {/* Immersive onboarding — shown once to new authenticated users */}
                  {userId && <OnboardingShell userId={userId} needsOnboarding={needsOnboarding} />}
                  <Nav />
                  <main className="min-h-[calc(100dvh-120px)] pb-24 md:pb-12">{children}</main>
                  <Footer
                    courseStartDate={courseStartDate}
                    courseTotalDays={
                      courseStartDate || courseDurationMonths
                        ? getCourseWindow(courseStartDate, courseDurationMonths).totalDays
                        : null
                    }
                    preferredDomainsCount={
                      preferredDomains && preferredDomains.length > 0
                        ? preferredDomains.length
                        : null
                    }
                  />
                  <MobileTabBar />
                  <InstallPrompt />
                  <LEFCounselPanel day={activeDay} isFloating={true} userId={userId} />
                  {/* Global achievement modal — any page can fire window 'lef-achievement' event */}
                  <AchievementProvider />
                </CommandPaletteProvider>
              </ToastProvider>
            </TourShell>
          </CourseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
