'use client';

import { ExternalLink, PlayCircle, Wrench, Link2 } from 'lucide-react';
import type { ResourceSubmission, ResourceType, LefDomain } from '@/lib/database.types';
import { FlagButton } from './FlagButton';

type Props = {
  resources: ResourceSubmission[];
  userId?: string;
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

export function CommunityResources({ resources, userId }: Props) {
  if (resources.length === 0) return null;

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
        <h2 className="text-sm font-semibold text-text-primary">Community Resources</h2>
        <p className="mt-0.5 text-xs text-text-secondary">
          Reviewed and approved links submitted by learners. Flag anything that seems wrong.
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
              <ul className="space-y-2">
                {list.map((r) => (
                  <li key={r.id} className="group relative">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={r.note ?? undefined}
                        className="inline-flex min-w-0 items-start gap-1.5 text-xs leading-snug text-gold transition-colors hover:underline hover:opacity-80"
                      >
                        <span className="mt-px shrink-0">{TYPE_ICON[r.type]}</span>
                        <span className="min-w-0 break-words">{r.title}</span>
                        <span className="shrink-0 opacity-60">↗</span>
                      </a>
                      <FlagButton submissionId={r.id} userId={userId} />
                    </div>
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
