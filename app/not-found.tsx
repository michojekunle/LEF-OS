'use client';

import Link from 'next/link';
import { Home, ArrowRight, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[75dvh] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md space-y-6">
        {/* Error code badge */}
        <div className="border-gold/30 bg-gold/5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold">
          <HelpCircle size={12} />
          Error 404
        </div>

        {/* Big Heading */}
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-text-primary md:text-5xl">
          Foundation Not Found
        </h1>

        {/* Academic Quote */}
        <blockquote className="border-gold/40 my-6 border-l-2 py-1.5 pl-4 text-left">
          <p className="font-serif text-xs font-medium italic leading-relaxed text-text-secondary">
            &ldquo;Law is the skeleton, economics is the muscle, and finance is the blood. Without
            all three, the enterprise cannot walk. If you wander off the path, return to the first
            principles.&rdquo;
          </p>
          <cite className="mt-1.5 block text-[10px] uppercase not-italic tracking-wider text-text-muted">
            &mdash; LEF Counsel Instruction
          </cite>
        </blockquote>

        {/* Subtitle description */}
        <p className="text-xs leading-relaxed text-text-secondary">
          The page or curriculum chapter you are looking for does not exist or has been moved. Check
          the URL or return to your student dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
          <Link
            id="back-to-dashboard-btn"
            href="/dashboard"
            className="btn btn-primary flex w-full items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold sm:w-auto"
          >
            <Home size={14} />
            Go to Dashboard
          </Link>
          <Link
            id="browse-roadmap-btn"
            href="/roadmap"
            className="btn btn-secondary flex w-full items-center justify-center gap-2 px-5 py-2.5 text-xs transition-all hover:border-gold hover:text-gold sm:w-auto"
          >
            Browse Roadmap
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
