import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Resolve a wall-clock time independently of the machine's own timezone.
// Sampling both sides of a transition lets us choose the earlier repeated instant.
const cache = new Map<string, number>();
export function resolveZonedInstant(
  date: string,
  time: string,
  timezone: string,
  dateOnly = false,
): number {
  const key = `${date}|${time}|${timezone}|${dateOnly}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const local = `${date}T${time}:00`;
  const wall = parseISO(`${local}Z`).getTime();
  if (!Number.isFinite(wall)) throw new RangeError('Invalid event date');
  const offsets = new Set<number>();
  for (const delta of [-36, 0, 36]) {
    const offset = formatInTimeZone(wall + delta * 3600000, timezone, 'xxxxx');
    if (offset === 'Z') {
      offsets.add(0);
      continue;
    }
    const match = /^([+-])(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(offset);
    if (!match) throw new RangeError('Invalid timezone offset');
    offsets.add(
      (Number(match[2]) * 3600 + Number(match[3]) * 60 + Number(match[4] || 0)) *
        1000 *
        (match[1] === '-' ? -1 : 1),
    );
  }
  const candidates = [...offsets]
    .map((offset) => wall - offset)
    .filter((instant) => formatInTimeZone(instant, timezone, "yyyy-MM-dd'T'HH:mm:ss") === local);
  let instant: number;
  if (candidates.length) instant = Math.min(...candidates);
  else if (dateOnly) {
    // Some zones skip midnight. Find the first actual instant of the calendar day.
    let low = wall - 48 * 3600000,
      high = wall + 48 * 3600000;
    while (high - low > 1) {
      const midpoint = Math.floor((low + high) / 2);
      if (formatInTimeZone(midpoint, timezone, 'yyyy-MM-dd') < date) low = midpoint;
      else high = midpoint;
    }
    instant = high;
    if (formatInTimeZone(instant, timezone, 'yyyy-MM-dd') !== date)
      throw new RangeError('This calendar day does not exist in the selected timezone.');
  } else
    throw new RangeError(
      'This local time does not exist due to a daylight-saving change. Choose another time.',
    );
  if (cache.size > 2000) cache.clear();
  cache.set(key, instant);
  return instant;
}
