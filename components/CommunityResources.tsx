'use client';

import { ExternalLink, PlayCircle, Wrench, Link2 } from 'lucide-react';
import type { ResourceSubmission, ResourceType, LefDomain } from '@/lib/database.types';

type Props = {
  resources: ResourceSubmission[];
};

const TYPE_ICON: Record<ResourceType, React.ReactNode> = {
  video: <PlayCircle size={13} className="shrink-0" />,
  article: <ExternalLink size={13} className="shrink-0" />,
  tool: <Wrench size={13} className="shrink-0" />,
  other: <Link2 size={13} className="shrink-0" />,
};

const DOMAIN_LABELS: Record<LefDomain, string> = {
  law: '⚖️ Law',
  economics: '📊 Econ',
  finance: '💰 Finance',
};

export function CommunityResources({ resources }: Props) {
  if (resources.length === 0) return null;

  // Group by domain
  const byDomain = resources.reduce<Partial<Record<LefDomain, ResourceSubmission[]>>>(
    (acc, r) => {
      const list = acc[r.domain] ?? [];
      list.push(r);
      acc[r.domain] = list;
      return acc;
    },
    {},
  );

  return (
    <section className="card space-y-4 p-6">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
          Community Resources
        </h2>
        <p className="mt-0.5 text-xs text-text-secondary">
          Reviewed and approved links submitted by learners.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {(Object.keys(DOMAIN_LABELS) as LefDomain[]).map((d) => {
          const list = byDomain[d];
          if (!list?.length) return null;

          return (
            <div key={d} className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                {DOMAIN_LABELS[d]}
              </span>
              <ul className="space-y-1.5">
                {list.map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={r.note ?? undefined}
                      className="inline-flex items-start gap-1.5 text-xs leading-snug text-gold transition-colors hover:underline hover:opacity-80"
                    >
                      {TYPE_ICON[r.type]}
                      <span>{r.title}</span>
                      <span className="text-xs opacity-60">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
