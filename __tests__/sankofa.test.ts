import { describe, it, expect } from 'vitest';
import {
  getAllStories,
  getStoriesByDomain,
  getStoryById,
  SANKOFA_DOMAIN_META,
  type SankofaDomain,
} from '../lib/sankofa-content';

const ALL_DOMAINS: SankofaDomain[] = [
  'africa',
  'world',
  'economies',
  'politics',
  'people',
  'ideas',
  'heritage',
];

describe('Sankofa Archive content and domain integrity', () => {
  it('defines metadata for all 7 sectors including heritage', () => {
    expect(Object.keys(SANKOFA_DOMAIN_META)).toHaveLength(7);
    for (const d of ALL_DOMAINS) {
      const meta = SANKOFA_DOMAIN_META[d];
      expect(meta).toBeDefined();
      expect(meta.label).toBeTruthy();
      expect(meta.colour).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(meta.icon).toBeTruthy();
    }
  });

  it('contains valid stories for every domain', () => {
    const all = getAllStories();
    expect(all.length).toBeGreaterThan(0);

    for (const d of ALL_DOMAINS) {
      const domainStories = getStoriesByDomain(d);
      expect(domainStories.length).toBeGreaterThanOrEqual(1);

      for (const s of domainStories) {
        expect(s.id).toBeTruthy();
        expect(s.domain).toBe(d);
        expect(s.title).toBeTruthy();
        expect(s.tldr).toBeTruthy();
        expect(s.body).toBeTruthy();
        expect(Array.isArray(s.figures)).toBe(true);
        expect(Array.isArray(s.connections)).toBe(true);
        expect(Array.isArray(s.sources)).toBe(true);
      }
    }
  });

  it('retrieves story by id correctly', () => {
    const all = getAllStories();
    const first = all[0];
    const retrieved = getStoryById(first.id);
    expect(retrieved).toEqual(first);

    const nonExistent = getStoryById('non-existent-id-999');
    expect(nonExistent).toBeUndefined();
  });
});
