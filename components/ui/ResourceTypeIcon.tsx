/**
 * components/ui/ResourceTypeIcon.tsx
 * Single icon component for resource types (video/article/tool/other).
 * Eliminates the TYPE_ICON record defined independently in multiple files.
 */

import { PlayCircle, ExternalLink, Wrench, Link2 } from 'lucide-react';
import type { ResourceType } from '@/lib/database.types';

type Props = {
  type: ResourceType;
  size?: number;
  className?: string;
};

export function ResourceTypeIcon({ type, size = 13, className = 'shrink-0' }: Props) {
  switch (type) {
    case 'video':
      return <PlayCircle size={size} className={className} />;
    case 'article':
      return <ExternalLink size={size} className={className} />;
    case 'tool':
      return <Wrench size={size} className={className} />;
    default:
      return <Link2 size={size} className={className} />;
  }
}

/** Plain-text label for a resource type. */
export function resourceTypeLabel(type: ResourceType): string {
  return { video: 'Video', article: 'Article', tool: 'Tool', other: 'Other' }[type];
}
