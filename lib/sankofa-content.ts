import seedData from '@/data/sankofa/seed.json';

export type SankofaDomain = 'africa' | 'world' | 'economies' | 'politics' | 'people' | 'ideas';

export type SankofaSource = { label: string; url: string };

export type SankofaStory = {
  id: string;
  domain: SankofaDomain;
  era: string;
  title: string;
  tldr: string;
  body: string;
  figures: string[];
  connections: string[];
  sources: SankofaSource[];
  coverImage?: string;
};

export const SANKOFA_DOMAIN_META: Record<SankofaDomain, { label: string; colour: string; icon: string }> = {
  africa:    { label: 'Africa',    colour: '#c9ab70', icon: '🌍' },
  world:     { label: 'World',     colour: '#80a394', icon: '🌐' },
  economies: { label: 'Economies', colour: '#8fa3d0', icon: '⚖️' },
  politics:  { label: 'Politics',  colour: '#a07070', icon: '🏛️' },
  people:    { label: 'People',    colour: '#9a8fa0', icon: '👤' },
  ideas:     { label: 'Ideas',     colour: '#a09060', icon: '💡' },
};

const stories: SankofaStory[] = seedData as SankofaStory[];

export function getAllStories(): SankofaStory[] {
  return stories;
}

export function getStoryById(id: string): SankofaStory | undefined {
  return stories.find((s) => s.id === id);
}

export function getStoriesByDomain(domain: SankofaDomain): SankofaStory[] {
  return stories.filter((s) => s.domain === domain);
}

export function getRelatedStories(id: string): SankofaStory[] {
  const story = getStoryById(id);
  if (!story) return [];
  return story.connections
    .map((cid) => getStoryById(cid))
    .filter((s): s is SankofaStory => s !== undefined);
}

export function getFeaturedStory(): SankofaStory {
  // Rotate featured story by day of year so it changes daily
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return stories[dayOfYear % stories.length];
}
