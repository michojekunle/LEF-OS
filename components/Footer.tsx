import Link from 'next/link';
import { Github, Twitter, Globe, GitFork, ArrowUpRight } from 'lucide-react';

const GITHUB_URL = 'https://github.com/michojekunle/lef-os';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--border-subtle)]">
      {/* ── Contribute band ─────────────────────────────────────────── */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="flex items-start gap-4">
            <div className="bg-gold/10 border-gold/30 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
              <GitFork size={16} className="text-gold" />
            </div>
            <div>
              <p className="font-display text-base leading-snug text-text-primary">
                Contribute to this curriculum
              </p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-text-secondary">
                Fix an error, add a Nigerian case study, suggest resources, or improve the economics
                syllabus. All welcome on GitHub.
              </p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-text-muted transition-colors hover:text-gold"
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
            className="btn btn-secondary flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-xs transition-colors hover:border-gold hover:text-gold sm:self-start"
            aria-label="Contribute to LEF OS on GitHub"
          >
            <Github size={14} />
            Open on GitHub
          </a>
        </div>
      </div>

      {/* ── Brand + links + copyright ─────────────────────────────── */}
      <div className="mx-auto max-w-content px-4 py-8 text-sm text-text-secondary md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xl tracking-tight text-text-primary">
              Law · Economics · Finance
            </p>
            <p className="mt-1 text-xs">A 4-month founder's curriculum. Learned in public.</p>
            <p className="mt-2 font-mono text-xs text-text-muted">
              June 1 – September 30, 2026 · 122 days · 3 domains
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <ul className="flex items-center gap-5 text-xs">
              <li>
                <Link href="/roadmap" className="transition-colors hover:text-text-primary">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/journal" className="transition-colors hover:text-text-primary">
                  Journal
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-text-primary">
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
                  className="inline-flex items-center gap-1 transition-colors hover:text-text-primary"
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
                  className="inline-flex items-center gap-1 transition-colors hover:text-text-primary"
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
                  className="inline-flex items-center gap-1 transition-colors hover:text-text-primary"
                  aria-label="Personal website"
                >
                  <Globe size={15} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border-dim)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-text-muted">
            © 2026 — built for personal use. Learned in public, shared without ego.
          </p>
          <p className="text-[11px] text-text-muted">Code MIT licensed.</p>
        </div>
      </div>
    </footer>
  );
}
