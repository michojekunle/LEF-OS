import { notFound } from 'next/navigation';
import { getStoryById, getRelatedStories } from '@/lib/sankofa-content';
import { StoryReader } from '@/components/sankofa/StoryReader';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://lef-os.vercel.app';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const story = getStoryById(id);
  if (!story) return {};

  const ogImageUrl = `${SITE_URL}/api/og/sankofa?id=${id}`;

  return {
    title: `${story.title} — Sankofa Archive`,
    description: story.tldr,
    openGraph: {
      title: story.title,
      description: story.tldr,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: story.title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: story.tldr,
      images: [ogImageUrl],
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  const story = getStoryById(id);
  if (!story) notFound();

  const related = getRelatedStories(id);

  return <StoryReader story={story} related={related} />;
}
