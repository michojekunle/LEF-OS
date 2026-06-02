import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { MobileTabBar } from '@/components/MobileTabBar';
import { ToastProvider } from '@/components/Toast';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import { InstallPrompt } from '@/components/InstallPrompt';
import { ThemeProvider } from '@/components/ThemeProvider';
import { hasSupabaseConfig } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { getDayNumber, clampDay } from '@/lib/utils';
import { LEFCounselPanel } from '@/components/LEFCounselPanel';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
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

  if (hasSupabaseConfig()) {
    try {
      const sb = await supabaseServer();
      const { data } = await sb.auth.getUser();
      if (data.user) {
        userId = data.user.id;
        activeDay = clampDay(getDayNumber(new Date()));
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
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — must run synchronously before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <CommandPaletteProvider>
              <Nav />
              <main className="min-h-[calc(100dvh-120px)] pb-24 md:pb-12">{children}</main>
              <Footer />
              <MobileTabBar />
              <InstallPrompt />
              <LEFCounselPanel day={activeDay} isFloating={true} userId={userId} />
            </CommandPaletteProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
