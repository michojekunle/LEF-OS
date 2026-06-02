'use client';

import Link from 'next/link';
import { Home, ArrowRight, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75dvh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="space-y-6 max-w-md">
        {/* Error code badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-[10px] uppercase tracking-wider font-semibold">
          <HelpCircle size={12} />
          Error 404
        </div>

        {/* Big Heading */}
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-text-primary tracking-tight leading-tight">
          Foundation Not Found
        </h1>

        {/* Academic Quote */}
        <blockquote className="border-l-2 border-gold/40 pl-4 py-1.5 my-6 text-left">
          <p className="text-xs italic text-text-secondary leading-relaxed font-serif font-medium">
            &ldquo;Law is the skeleton, economics is the muscle, and finance is the blood. Without all three, the enterprise cannot walk. If you wander off the path, return to the first principles.&rdquo;
          </p>
          <cite className="text-[10px] text-text-muted uppercase tracking-wider block mt-1.5 not-italic">
            &mdash; LEF Counsel Instruction
          </cite>
        </blockquote>

        {/* Subtitle description */}
        <p className="text-xs text-text-secondary leading-relaxed">
          The page or curriculum chapter you are looking for does not exist or has been moved. Check the URL or return to your student dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            id="back-to-dashboard-btn"
            href="/dashboard"
            className="w-full sm:w-auto btn btn-primary text-xs py-2.5 px-5 font-semibold flex items-center justify-center gap-2"
          >
            <Home size={14} />
            Go to Dashboard
          </Link>
          <Link
            id="browse-roadmap-btn"
            href="/roadmap"
            className="w-full sm:w-auto btn btn-secondary text-xs py-2.5 px-5 flex items-center justify-center gap-2 hover:border-gold hover:text-gold transition-all"
          >
            Browse Roadmap
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
