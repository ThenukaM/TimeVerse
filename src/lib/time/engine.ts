import { formatInTimeZone } from 'date-fns-tz';
import { resolveZonedInstant } from './zoned';
import { validDate, validTimezone } from '@/features/events/model';
import { parseISO, format } from 'date-fns';
import type { TimeVerseEvent } from '@/features/events/model';

export type MomentStatus = 'future' | 'past' | 'present' | 'today';
export type TimedEvent = Pick<TimeVerseEvent, 'date' | 'time' | 'dateMode' | 'timezone'>;
export type TimeState = {
  status: MomentStatus;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  totalDays: number;
  target: number;
  difference: number;
};
export function eventInstant(event: TimedEvent): number {
  if (
    !validDate(event.date) ||
    !validTimezone(event.timezone) ||
    (event.dateMode === 'date-time' &&
      (!event.time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time)))
  )
    throw new RangeError('Invalid event date, time or timezone');
  return resolveZonedInstant(
    event.date,
    event.dateMode === 'date-only' ? '00:00' : event.time!,
    event.timezone,
    event.dateMode === 'date-only',
  );
}
export function calculateTime(event: TimedEvent, now: number): TimeState {
  if (!Number.isFinite(now)) throw new RangeError('Invalid current time');
  const target = eventInstant(event);
  const difference = target - now;
  let status: MomentStatus = difference > 0 ? 'future' : difference < 0 ? 'past' : 'present';
  if (
    event.dateMode === 'date-only' &&
    formatInTimeZone(now, event.timezone, 'yyyy-MM-dd') === event.date
  )
    status = 'today';
  const absolute = Math.abs(difference);
  const totalSeconds = Math.floor(absolute / 1000);
  return {
    status,
    target,
    difference,
    totalSeconds,
    totalDays: absolute / 86_400_000,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
  };
}
export function formatEventDate(event: TimedEvent, long = false) {
  const date = format(parseISO(event.date), long ? 'EEEE, MMMM d, yyyy' : 'MMM d, yyyy');
  return event.dateMode === 'date-time' ? `${date} · ${event.time}` : date;
}
export function statusLabel(status: MomentStatus) {
  return { future: 'Upcoming', past: 'Memory', present: 'Right now', today: 'Today' }[status];
}
