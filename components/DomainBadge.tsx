import { DOMAIN_META, type Domain } from '../data/curriculum-data';

const accentMap: Record<string, { bg: string; border: string; text: string }> = {
  law: { bg: 'bg-accent-law', border: 'border-accent-law', text: 'accent-law' },
  econ: { bg: 'bg-accent-econ', border: 'border-accent-econ', text: 'accent-econ' },
  finance: {
    bg: 'bg-accent-finance',
    border: 'border-accent-finance',
    text: 'accent-finance',
  },
  synthesis: {
    bg: 'bg-accent-synthesis',
    border: 'border-accent-synthesis',
    text: 'accent-synthesis',
  },
};

type Props = {
  domain: Domain;
  size?: 'sm' | 'md';
  className?: string;
};

export function DomainBadge({ domain, size = 'md', className = '' }: Props) {
  const meta = DOMAIN_META[domain];
  const a = accentMap[meta.accent];
  const sz = size === 'sm' ? 'text-sm px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${a.bg} ${a.border} ${a.text} ${sz} font-medium tracking-wide ${className}`}
    >
      <span aria-hidden>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}

export function LevelBadge({
  level,
  className = '',
}: {
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Synthesis';
  className?: string;
}) {
  const key =
    level === 'Synthesis'
      ? 'synthesis'
      : level === 'Advanced'
        ? 'law'
        : level === 'Intermediate'
          ? 'econ'
          : 'finance';
  const a = accentMap[key];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs uppercase tracking-[0.15em] ${a.border} ${a.text} ${className}`}
    >
      {level}
    </span>
  );
}
