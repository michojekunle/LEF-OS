'use client';

import type { ResourceSubmission, LefDomain } from '@/lib/database.types';
import { DOMAIN_LABELS_SHORT } from '@/lib/domain';
import { ResourceTypeIcon } from './ui/ResourceTypeIcon';
import { SectionHeader } from './ui/SectionHeader';
import { FlagButton } from './FlagButton';

type Props = {
  resources: ResourceSubmission[];
  userId?: string;
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

  const domains = Object.keys(DOMAIN_LABELS_SHORT) as LefDomain[];

  return (
    <section className="card space-y-4 p-6">
      <SectionHeader
        title="Community Resources"
        subtitle="Reviewed and approved links submitted by learners. Flag anything that seems wrong."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {domains.map((d) => {
          const list = byDomain[d];
          if (!list?.length) return null;

          return (
            <div key={d} className="space-y-2">
              <span className="label-caps block text-text-muted">
                {DOMAIN_LABELS_SHORT[d]}
              </span>
              <ul className="space-y-2">
                {list.map((r) => (
                  <li key={r.id} className="group relative flex items-start justify-between gap-2">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={r.note ?? undefined}
                      className="inline-flex min-w-0 items-start gap-1.5 text-xs leading-snug text-gold transition-colors hover:underline hover:opacity-80"
                    >
                      <span className="mt-px shrink-0">
                        <ResourceTypeIcon type={r.type} size={12} />
                      </span>
                      <span className="min-w-0 break-words">{r.title}</span>
                      <span className="shrink-0 opacity-60">↗</span>
                    </a>
                    <FlagButton submissionId={r.id} userId={userId} />
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
