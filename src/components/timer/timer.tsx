'use client';
import type { TimeState } from '@/lib/time/engine';
import { cn } from '@/lib/utils';
export function Timer({
  state,
  compact = false,
  className,
}: {
  state: TimeState | null;
  compact?: boolean;
  className?: string;
}) {
  const units = [
    ['days', state?.days],
    ['hours', state?.hours],
    ['minutes', state?.minutes],
    ['seconds', state?.seconds],
  ] as const;
  if (state?.status === 'today' || state?.status === 'present')
    return (
      <div className={cn('present-timer', compact && 'compact', className)}>
        <span className="present-spark">✧</span>
        <strong>{state.status === 'today' ? 'Today is the day.' : 'The Moment Is Here.'}</strong>
        <span>Be here. Take it all in.</span>
      </div>
    );
  return (
    <div
      className={cn('timer', compact && 'timer-compact', className)}
      aria-label={
        state
          ? `${state.days} days, ${state.hours} hours, ${state.minutes} minutes, ${state.seconds} seconds ${state.status === 'future' ? 'remaining' : 'elapsed'}`
          : 'Loading timer'
      }
    >
      {units.map(([label, value]) => (
        <div className="timer-unit" key={label}>
          <span className="timer-number">
            {value === undefined ? (
              '—'
            ) : label === 'days' && value >= 10000 ? (
              <span style={{ fontSize: `${4 / String(value).length}em` }}>{value}</span>
            ) : (
              String(value).padStart(2, '0')
            )}
          </span>
          <span className="timer-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
