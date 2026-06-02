/** @type {import('next').NextConfig} */

// ─── Cache TTL constants ──────────────────────────────────────────────────────
const DAY = 24 * 60 * 60;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * IMPORTANT: Providing a custom `runtimeCaching` array to next-pwa v5 REPLACES
 * the built-in defaultCache entirely (the option uses `= defaultCache` default
 * assignment). We must explicitly merge our overrides with the defaultCache so
 * that the catch-all rules for /login, /signup, cross-origin requests, and the
 * critical `/_next/data/*.json` RSC payload route (client-side navigation) are
 * preserved.
 *
 * Our custom rules are listed FIRST — Workbox evaluates top-to-bottom and stops
 * at the first match, so our specific patterns take priority over the defaults.
 */
const defaultCache = require('next-pwa/cache');

/**
 * Runtime caching strategies:
 *
 *  CacheFirst           — serve from cache; only hit network if not cached.
 *                         Use for: immutable assets (fonts, icons, hashed JS/CSS).
 *  StaleWhileRevalidate — serve from cache immediately; refresh cache in background.
 *                         Use for: curriculum pages (data is baked into the bundle).
 *  NetworkFirst         — try network first; fall back to cache on failure/timeout.
 *                         Use for: authenticated pages, live data, APIs.
 */
const customRules = [
  // ── Self-hosted fonts (/_next/static/media/*.woff2) ────────────────────────
  // next/font downloads and serves fonts from the bundle — no Google Fonts CDN.
  // Content-hash in filename means they're truly immutable.
  {
    urlPattern: /\/_next\/static\/media\/.+\.(woff|woff2|ttf|otf)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'lef-fonts',
      expiration: { maxEntries: 20, maxAgeSeconds: YEAR },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── Next.js hashed JS / CSS chunks ──────────────────────────────────────────
  // Content-hash in filename; safe to keep forever. next-pwa precaches these
  // too, but this rule covers any lazily-fetched chunks not in the precache.
  {
    urlPattern: /\/_next\/static\/.+\.(js|css)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'lef-static-assets',
      expiration: { maxEntries: 256, maxAgeSeconds: YEAR },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── /_next/data/*.json — RSC payload for client-side navigation ─────────────
  // Next.js App Router sends server component payloads via these routes during
  // soft navigation. Without caching them, pressing Back/Forward offline breaks.
  // Must come BEFORE the defaultCache rule 9 (same pattern) to upgrade to SWR.
  {
    urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'lef-next-data',
      expiration: { maxEntries: 128, maxAgeSeconds: DAY },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── Curriculum / roadmap pages ───────────────────────────────────────────────
  // /roadmap and /day/* render from static curriculum data embedded in the JS
  // bundle — they work fully offline once cached. StaleWhileRevalidate means
  // the user gets an instant response from cache while the SW refreshes quietly.
  {
    urlPattern: /^https?:\/\/[^/]+\/roadmap(\/.*)?(\?.*)?$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'lef-roadmap',
      expiration: { maxEntries: 4, maxAgeSeconds: WEEK },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    urlPattern: /^https?:\/\/[^/]+\/day\/\d+(\/.*)?(\?.*)?$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'lef-day-pages',
      // 122 days × 1 cached version each
      expiration: { maxEntries: 130, maxAgeSeconds: WEEK },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── Landing page ─────────────────────────────────────────────────────────────
  {
    urlPattern: /^https?:\/\/[^/]+\/?$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'lef-shell',
      expiration: { maxEntries: 2, maxAgeSeconds: DAY },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── Public journal ───────────────────────────────────────────────────────────
  // Live data but should be readable offline from cache.
  {
    urlPattern: /^https?:\/\/[^/]+\/journal(\/.*)?(\?.*)?$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'lef-journal',
      networkTimeoutSeconds: 5,
      expiration: { maxEntries: 32, maxAgeSeconds: DAY },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── Auth-gated app pages (dashboard, stats, settings) ───────────────────────
  // force-dynamic pages send Cache-Control: no-store. Workbox honours our
  // explicit cacheableResponse override and stores the response anyway,
  // enabling offline viewing of the last-loaded session data.
  {
    urlPattern: /^https?:\/\/[^/]+\/(dashboard|stats|settings)(\/.*)?(\?.*)?$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'lef-app-pages',
      networkTimeoutSeconds: 8,
      expiration: { maxEntries: 16, maxAgeSeconds: DAY },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── Supabase REST API ────────────────────────────────────────────────────────
  // Cache GET responses so the UI shows last-known data while offline.
  // POST/PATCH/DELETE are not matched by this GET-only route handler.
  {
    urlPattern: /^https:\/\/[^/]+\.supabase\.co\/rest\//,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'lef-supabase-rest',
      networkTimeoutSeconds: 6,
      expiration: { maxEntries: 256, maxAgeSeconds: DAY },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── In-app notification API ──────────────────────────────────────────────────
  // Safe to cache; stale notifications are better than nothing offline.
  // 7-day TTL — a month-old cached notification is confusing and misleading.
  {
    urlPattern: /^https?:\/\/[^/]+\/api\/notifications(\/.*)?$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'lef-api-notifications',
      networkTimeoutSeconds: 5,
      expiration: { maxEntries: 16, maxAgeSeconds: WEEK },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── PWA assets (icons, manifest) ─────────────────────────────────────────────
  {
    urlPattern: /\/(icon-\d+\.png|manifest\.json|og-image\.png)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'lef-pwa-assets',
      expiration: { maxEntries: 16, maxAgeSeconds: MONTH },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // ── Export routes — never cache ──────────────────────────────────────────────
  // Streaming file downloads. Caching would serve stale exports or break the
  // Content-Disposition header. Let these fall through to the network only.
  {
    urlPattern: /^https?:\/\/[^/]+\/export\/(markdown|csv)$/,
    handler: 'NetworkOnly',
    options: { cacheName: 'lef-never' },
  },

  // ── AI chat — never cache ────────────────────────────────────────────────────
  // Each request is unique; a cached AI response is wrong-context noise.
  {
    urlPattern: /^https?:\/\/[^/]+\/api\/ai\//,
    handler: 'NetworkOnly',
    options: { cacheName: 'lef-never' },
  },
];

// Merge: our specific rules take priority; defaultCache handles everything else
// (login, signup, /u/[username], cross-origin, generic same-origin catch-all).
const runtimeCaching = [...customRules, ...defaultCache];

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Temporarily set to false so you can test Web Push locally
  importScripts: ['/sw-push.js'],
  fallbacks: {
    // Served when both network and cache fail for a navigation request
    document: '/offline',
  },
  runtimeCaching,
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com ws: wss:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
