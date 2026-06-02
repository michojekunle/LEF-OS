import { DomainBadge } from './DomainBadge';
import { findDayMeta, type Domain } from '../data/curriculum-data';

type Props = {
  domain: Domain;
  day: number;
  completed?: boolean;
  onToggle?: () => void;
};

export function DayCard({ domain, day, completed, onToggle }: Props) {
  const meta = findDayMeta(domain, day);
  if (!meta) {
    return (
      <div className="card p-5">
        <DomainBadge domain={domain} />
        <p className="mt-3 text-sm text-text-secondary">
          Integration & sharing day — no curriculum topic. Use today to review, write, or publish.
        </p>
      </div>
    );
  }
  return (
    <div className="card reveal flex h-full flex-col justify-between p-5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DomainBadge domain={domain} size="md" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
            {meta.weekTitle}
          </span>
        </div>

        <div>
          <p
            className={`font-display text-[1.1rem] leading-snug ${meta.isReview ? 'review-day text-gold' : 'text-text-primary'}`}
          >
            {meta.topic}
          </p>
          <p className="mt-1.5 text-xs text-text-secondary">{meta.weekTitle}</p>
        </div>
      </div>

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className={`btn mt-6 w-full justify-center text-xs ${completed ? 'btn-primary bg-gold text-bg' : 'btn-secondary'}`}
        >
          {completed ? '✓ Completed' : 'Mark complete'}
        </button>
      )}
    </div>
  );
}
