import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sankofa — Be the Griot | Coming Soon',
  description:
    'A daily practice in world history. Africa, civilizations, empires, economies, and the people who shaped them all. Every day, one true story.',
  openGraph: {
    title: 'Sankofa — Be the Griot',
    description:
      'Every day, one true story. Go back. Fetch it. Carry it forward.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sankofa — Be the Griot',
    description:
      'Every day, one true story. Go back. Fetch it. Carry it forward.',
  },
};

export default function SankofaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
