import { notFound } from 'next/navigation';
import { getStoryById, getRelatedStories } from '@/lib/sankofa-content';
import { StoryReader } from '@/components/sankofa/StoryReader';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const story = getStoryById(id);
  if (!story) return {};
  return {
    title: `${story.title} — Sankofa Archive`,
    description: story.tldr,
  };
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  const story = getStoryById(id);
  if (!story) notFound();

  const related = getRelatedStories(id);

  return <StoryReader story={story} related={related} />;
}
