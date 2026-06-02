import Link from 'next/link';
import { Github, Twitter, Globe, GitFork, ArrowUpRight } from 'lucide-react';

const GITHUB_URL = 'https://github.com/michojekunle/lef-os';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] mt-12">
      {/* ── Contribute band ─────────────────────────────────────────── */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="mx-auto max-w-content px-4 md:px-6 py-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
              <GitFork size={16} className="text-gold" />
            </div>
            <div>
              <p className="font-display text-base text-text-primary leading-snug">
                Contribute to this curriculum
              </p>
              <p className="text-xs text-text-secondary mt-1 max-w-sm leading-relaxed">
                Fix an error, add a Nigerian case study, suggest resources, or improve
                the economics syllabus. All welcome on GitHub.
              </p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-[11px] text-text-muted hover:text-gold transition-colors font-mono"
              >
                github.com/michojekunle/lef-os
                <ArrowUpRight size={11} />
              </a>
            </div>
          </div>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-xs px-4 py-2.5 flex items-center justify-center gap-2 hover:border-gold hover:text-gold transition-colors shrink-0 sm:self-start"
            aria-label="Contribute to LEF OS on GitHub"
          >
            <Github size={14} />
            Open on GitHub
          </a>
        </div>
      </div>

      {/* ── Brand + links + copyright ─────────────────────────────── */}
      <div className="mx-auto max-w-content px-4 md:px-6 py-8 text-sm text-text-secondary">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-display text-xl tracking-tight text-text-primary">
              Law · Economics · Finance
            </p>
            <p className="mt-1 text-xs">A 4-month founder's curriculum. Learned in public.</p>
            <p className="mt-2 text-xs text-text-muted font-mono">
              June 1 – September 30, 2026 · 122 days · 3 domains
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <ul className="flex items-center gap-5 text-xs">
              <li>
                <Link href="/roadmap" className="hover:text-text-primary transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-text-primary transition-colors">
                  Journal
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
            <ul className="flex items-center gap-3">
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors inline-flex items-center gap-1"
                  aria-label="GitHub"
                >
                  <Github size={15} />
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/devvmichael"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors inline-flex items-center gap-1"
                  aria-label="Twitter / X"
                >
                  <Twitter size={15} />
                </a>
              </li>
              <li>
                <a
                  href="https://michaelojekunle.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors inline-flex items-center gap-1"
                  aria-label="Personal website"
                >
                  <Globe size={15} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[var(--border-dim)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-text-muted">
            © 2026 — built for personal use. Learned in public, shared without ego.
          </p>
          <p className="text-[11px] text-text-muted">
            Code MIT licensed.
          </p>
        </div>
      </div>
    </footer>
  );
}
