'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Coins, TrendingUp, CheckCircle, Flame } from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';

type Props = {
  isAuthed: boolean;
  subheadLine: string;
  metaLine: string;
  progressLabel: string;
  dayShown: number;
  totalDays: number;
};

type SyllabusFeature = {
  title: string;
  day: number;
  summary: string;
  terms: string[];
  duration: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
};

const DOMAIN_FEATURES: Record<'law' | 'economics' | 'finance', SyllabusFeature> = {
  law: {
    title: 'CAMA 2020 & Corporate Formations',
    day: 5,
    summary: 'Dissecting the legal structures of company incorporation in Nigeria, liability shields, and foreign participation frameworks.',
    terms: ['Authorized Share Capital', 'Form CAC 1.1', 'Corporate Veil'],
    duration: '6 min read',
    difficulty: 'Foundation',
  },
  economics: {
    title: 'CBN Monetary Policy & Inflation Mechanics',
    day: 28,
    summary: 'An audit of the central bank interest rate interventions, foreign exchange windows, and inflation pressures in informal markets.',
    terms: ['MPR (Policy Rate)', 'Parallel FX Premium', 'Liquidity Ratio'],
    duration: '8 min read',
    difficulty: 'Intermediate',
  },
  finance: {
    title: 'Venture Debt & Local Term Sheets',
    day: 62,
    summary: 'Navigating debt capital structures, convertible notes, warrants, and valuation covenants for high-growth African startups.',
    terms: ['Convertible Debt', 'Liquidation Preference', 'Warrant Coverage'],
    duration: '7 min read',
    difficulty: 'Advanced',
  },
};

export function InteractiveHero({
  isAuthed,
  subheadLine,
  metaLine,
  progressLabel,
  dayShown,
  totalDays,
}: Props) {
  const [activeTab, setActiveTab] = useState<'law' | 'economics' | 'finance'>('law');

  const activeFeature = DOMAIN_FEATURES[activeTab];

  const domainStyles = {
    law: {
      accent: 'text-gold',
      border: 'border-gold/30',
      bgGlow: 'from-gold/5 via-transparent to-transparent',
      hover: 'hover:border-gold/60',
      badgeBg: 'bg-gold/10 text-gold border-gold/20',
      lineAccent: 'bg-gold',
      icon: <Shield size={14} className="text-gold" />,
    },
    economics: {
      accent: 'text-blue-400',
      border: 'border-blue-400/30',
      bgGlow: 'from-blue-400/5 via-transparent to-transparent',
      hover: 'hover:border-blue-400/60',
      badgeBg: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
      lineAccent: 'bg-blue-400',
      icon: <Coins size={14} className="text-blue-400" />,
    },
    finance: {
      accent: 'text-emerald-400',
      border: 'border-emerald-400/30',
      bgGlow: 'from-emerald-400/5 via-transparent to-transparent',
      hover: 'hover:border-emerald-400/60',
      badgeBg: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
      lineAccent: 'bg-emerald-400',
      icon: <TrendingUp size={14} className="text-emerald-400" />,
    },
  }[activeTab];

  return (
    <section className="relative pb-16 pt-12 md:pb-24 md:pt-20 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -left-20 top-0 -z-10 h-[300px] w-[300px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute right-0 top-10 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      <div className="grid gap-12 lg:grid-cols-12 items-center">
        {/* Left Column - Hero Copy & CTAs */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="reveal mb-6 flex w-fit items-center gap-2 rounded-full border border-border/80 bg-surface-2/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-text-secondary">
            <Sparkles size={11} className="text-gold animate-pulse" />
            <span>Founder&apos;s Learning OS</span>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.0] tracking-tight text-text-primary">
            Law
            <span className="text-text-muted"> · </span>
            <span className="accent-econ transition-colors duration-300">Economics</span>
            <span className="text-text-muted"> · </span>
            <span className="accent-finance transition-colors duration-300">Finance</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
            {subheadLine}
          </p>

          <p className="mt-3 font-mono text-[11px] tracking-wider text-text-muted">{metaLine}</p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/brief"
              className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold shadow-lg shadow-gold/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              data-tour="brief-cta"
            >
              Read Today&apos;s Lesson — 5 min <ArrowRight size={16} />
            </Link>
            <Link 
              href="/roadmap" 
              className="btn btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm transition-all hover:bg-surface-2" 
              data-tour="explore-cta"
            >
              Explore Curriculum <ArrowRight size={14} />
            </Link>
          </div>

          <p className="mt-2 text-xs text-text-muted">
            No signup required — open today&apos;s brief and start reading.
          </p>

          {/* PROGRESS */}
          <div className="mt-12 max-w-md" data-tour="hero-progress-bar">
            <ProgressBar value={dayShown} max={totalDays} label={progressLabel} />
          </div>

          {!isAuthed && (
            <p className="mt-4 text-[11px] leading-relaxed text-text-muted max-w-md">
              <Link href="/login" className="text-gold hover:underline font-semibold">
                Sign in
              </Link>{' '}
              to set your own start date, duration (4–12 months), and track your completed modules.
            </p>
          )}
        </div>

        {/* Right Column - Live Syllabus Console */}
        <div className="lg:col-span-5 relative w-full">
          {/* Glassmorphic border glow container */}
          <div className={`relative w-full rounded-2xl border ${domainStyles.border} bg-surface/40 p-5 md:p-6 backdrop-blur-xl shadow-2xl transition-all duration-500`}>
            {/* Ambient Background Gradient for the Console */}
            <div className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${domainStyles.bgGlow} opacity-30 blur-sm pointer-events-none transition-all duration-500`} />

            {/* Console Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red animate-pulse" />
                <span className="font-mono text-[10px] tracking-widest text-text-muted uppercase">Syllabus.Preview</span>
              </div>
              {isAuthed && (
                <div className="flex items-center gap-1.5 text-xs text-gold">
                  <Flame size={12} className="animate-pulse" />
                  <span className="font-mono text-[11px] font-bold">STREAK ACTIVE</span>
                </div>
              )}
            </div>

            {/* Domain Switchers */}
            <div className="flex gap-2 mb-6">
              {(['law', 'economics', 'finance'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const tabMeta = {
                  law: { label: 'Law', style: 'hover:text-gold active:bg-gold/10' },
                  economics: { label: 'Econ', style: 'hover:text-blue-400 active:bg-blue-400/10' },
                  finance: { label: 'Finance', style: 'hover:text-emerald-400 active:bg-emerald-400/10' },
                }[tab];

                const activeStyles = {
                  law: 'bg-gold/15 text-gold border-gold/30',
                  economics: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
                  finance: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
                }[tab];

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 border text-xs font-mono py-2 rounded-lg transition-all ${
                      isActive 
                        ? `${activeStyles} font-bold shadow-md shadow-black/20` 
                        : 'border-border bg-surface-2/30 text-text-secondary hover:border-border-hover ' + tabMeta.style
                    }`}
                  >
                    {tabMeta.label}
                  </button>
                );
              })}
            </div>

            {/* Syllabus Topic Display */}
            <div className="space-y-4 min-h-[170px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-text-muted">DAY {activeFeature.day.toString().padStart(3, '0')}</span>
                  <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-mono tracking-wide ${domainStyles.badgeBg}`}>
                    {domainStyles.icon}
                    {activeFeature.difficulty}
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-bold text-text-primary leading-tight tracking-tight mb-2.5">
                  {activeFeature.title}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {activeFeature.summary}
                </p>
              </div>

              {/* Tags & Meta */}
              <div className="border-t border-border/80 pt-4 mt-2">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {activeFeature.terms.map((t) => (
                    <span key={t} className="bg-surface-2/60 border border-border/60 text-[10px] font-mono text-text-secondary px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted font-mono">
                  <span>Syllabus Target</span>
                  <span className="flex items-center gap-1 text-text-secondary">
                    <CheckCircle size={11} className={domainStyles.accent} /> {activeFeature.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
