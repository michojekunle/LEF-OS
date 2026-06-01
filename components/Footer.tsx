import Link from 'next/link';
import { Github, Twitter, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-12">
      <div className="mx-auto max-w-content px-4 md:px-6 py-10 text-sm text-text-secondary">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-display text-xl tracking-tight text-text-primary">
              Law · Economics · Finance
            </p>
            <p className="mt-1 text-xs">A 4-month founder's curriculum. Learned in public.</p>
            <p className="mt-3 text-xs text-text-muted">
              June 1 – September 30, 2026 · 122 days · 3 domains
            </p>
          </div>
          <ul className="flex items-center gap-4">
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
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary transition-colors inline-flex items-center gap-1"
                aria-label="GitHub"
              >
                <Github size={14} />
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary transition-colors inline-flex items-center gap-1"
                aria-label="Twitter"
              >
                <Twitter size={14} />
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-text-primary transition-colors inline-flex items-center gap-1"
                aria-label="Website"
              >
                <Globe size={14} />
              </a>
            </li>
          </ul>
        </div>
        <p className="mt-8 text-[11px] text-text-muted">
          © 2026 — built for personal use. Learned in public, shared without ego.
        </p>
      </div>
    </footer>
  );
}
