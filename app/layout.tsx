import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { MobileTabBar } from '@/components/MobileTabBar';
import { ToastProvider } from '@/components/Toast';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import { InstallPrompt } from '@/components/InstallPrompt';

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
  title: 'Law · Economics · Finance — A Founder\'s 4-Month Curriculum',
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
    description: 'A Founder\'s 4-Month Curriculum. Learned in public.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Law · Economics · Finance',
    description: 'A Founder\'s 4-Month Curriculum. Learned in public.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <ToastProvider>
          <CommandPaletteProvider>
            <Nav />
            <main className="min-h-[calc(100dvh-120px)] pb-24 md:pb-12">{children}</main>
            <Footer />
            <MobileTabBar />
            <InstallPrompt />
          </CommandPaletteProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
