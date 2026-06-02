export type AccentColor = 'gold' | 'sage' | 'slate-blue';

export type TourStep = {
  id: string;
  index: number;
  page: '/' | '/roadmap' | '/dashboard' | '*';
  target: string | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  title: string;
  body: string;
  nudge?: string;
  interactionId?: string;
  actionLabel: string;
  accentColor: AccentColor;
  navigatesTo?: string;
  fullscreen?: boolean;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    index: 0,
    page: '*',
    target: null,
    position: 'auto',
    title: 'Welcome.',
    body: "This is LEF OS — a personal learning system for one founder's 122-day deep dive into Law, Economics, and Finance. You're about to see how it all fits together. It takes 90 seconds.",
    actionLabel: 'Show me around →',
    accentColor: 'gold',
    fullscreen: true,
  },
  {
    id: 'hero-progress',
    index: 1,
    page: '/',
    target: 'hero-progress-bar',
    position: 'bottom',
    title: 'This bar tracks the whole journey.',
    body: '122 days. One bar. As each day is logged, it fills. **The bar is public** — anyone who visits sees exactly how far the journey has gone. No hiding. No faking.',
    actionLabel: 'Got it →',
    accentColor: 'gold',
  },
  {
    id: 'domain-cards',
    index: 2,
    page: '/',
    target: 'domain-cards-row',
    position: 'bottom',
    title: 'Three domains. Every single day.',
    body: 'Law. Economics. Finance. Each domain has its own 111-day track inside the 122-day calendar. They overlap by design — every week, they reinforce each other.',
    nudge: 'Try it: Tap any domain card.',
    interactionId: 'domain-card',
    actionLabel: 'Next →',
    accentColor: 'sage',
  },
  {
    id: 'explore-cta',
    index: 3,
    page: '/',
    target: 'explore-cta',
    position: 'bottom',
    title: 'The full 122-day roadmap is public.',
    body: "Every day, every week, every domain topic — all mapped out and visible to anyone. This isn't just a tracker. It's a full curriculum anyone can follow.",
    actionLabel: 'Open the Roadmap →',
    accentColor: 'sage',
    navigatesTo: '/roadmap',
  },
  {
    id: 'month-tabs',
    index: 4,
    page: '/roadmap',
    target: 'month-tabs',
    position: 'bottom',
    title: '4 months. 4 phases of depth.',
    body: 'Month 1 is foundations. Month 2 goes deeper. Month 3 applies. Month 4 synthesises. Each tab shows a completely different phase of the curriculum.',
    nudge: 'Try it: Switch to Month 2.',
    interactionId: 'month-tab',
    actionLabel: 'Next →',
    accentColor: 'sage',
  },
  {
    id: 'week-accordions',
    index: 5,
    page: '/roadmap',
    target: 'week-accordions',
    position: 'top',
    title: 'Drill into any week.',
    body: "Every domain in every week is mapped. Tap a week to expand it and see each day's exact topic.",
    nudge: 'Try it: Open any week.',
    interactionId: 'week-accordion',
    actionLabel: "Now let's see the tracker →",
    accentColor: 'sage',
    navigatesTo: '/dashboard',
  },
  {
    id: 'today-topics',
    index: 6,
    page: '/dashboard',
    target: 'today-topics',
    position: 'bottom',
    title: "Today's topics — always waiting.",
    body: 'The app knows what day of the 122-day journey it is. These three topics are yours today. No decisions needed.',
    actionLabel: 'Got it →',
    accentColor: 'slate-blue',
  },
  {
    id: 'daily-log-form',
    index: 7,
    page: '/dashboard',
    target: 'daily-log-form',
    position: 'top',
    title: 'Log it in 60 seconds.',
    body: 'Check which domains you studied. Rate how deep you went. Write one insight in your own words. That insight becomes your daily post.',
    nudge: 'Try it: Give today a rating.',
    interactionId: 'star-rating',
    actionLabel: 'Next →',
    accentColor: 'slate-blue',
  },
  {
    id: 'domain-progress',
    index: 8,
    page: '/dashboard',
    target: 'domain-progress',
    position: 'top',
    title: 'Track each domain separately.',
    body: "Law. Economics. Finance. Each bar shows how many days you've completed in that domain. They compound.",
    actionLabel: 'Next →',
    accentColor: 'slate-blue',
  },
  {
    id: 'streak-stats',
    index: 9,
    page: '/dashboard',
    target: 'streak-stats',
    position: 'bottom',
    title: 'The streak is the game.',
    body: 'Every consecutive day you log at least one domain, your streak grows. That number — yours and anyone who follows — is the most honest signal of commitment.',
    actionLabel: "I'm ready. Let's go. →",
    accentColor: 'gold',
  },
  {
    id: 'complete',
    index: 10,
    page: '*',
    target: null,
    position: 'auto',
    title: "You're ready.",
    body: "You've seen the whole system. The roadmap is public. The tracker is yours. The journey is 122 days. **Day 1 is today.** Go log it.",
    actionLabel: 'Log Day 1 →',
    accentColor: 'gold',
    fullscreen: true,
    navigatesTo: '/dashboard',
  },
];

export const TOTAL_TOUR_STEPS = TOUR_STEPS.length;
