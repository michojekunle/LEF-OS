import { DomainBadge } from './DomainBadge';
import { findDayMeta, type Domain } from './curriculum-data';

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
    <div className="card reveal flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <DomainBadge domain={domain} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
          Week · {meta.weekTitle}
        </span>
      </div>
      <p
        className={`font-display text-lg leading-snug ${meta.isReview ? 'review-day' : 'text-text-primary'}`}
      >
        {meta.topic}
      </p>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className={`btn ${completed ? 'btn-primary' : 'btn-secondary'} self-start text-xs`}
        >
          {completed ? '✓ Completed' : 'Mark complete'}
        </button>
      )}
    </div>
  );
}
