import { describe, expect, it } from 'vitest';
import { calculateTime, eventInstant, formatEventDate, type TimedEvent } from '@/lib/time/engine';
import { eventInputSchema } from '@/features/events/model';
const exact = (date: string, time = '12:00', timezone = 'UTC'): TimedEvent => ({
  date,
  time,
  timezone,
  dateMode: 'date-time',
});
const day = (date: string, timezone = 'Asia/Colombo'): TimedEvent => ({
  date,
  timezone,
  dateMode: 'date-only',
});
const timestamp = (date: string) => new Date(date).getTime();
const valid = {
  title: 'My moment',
  description: '',
  category: 'personal',
  emoji: '✨',
  accentColor: '#8b7bec',
  date: '2026-10-27',
  dateMode: 'date-only',
  timezone: 'Asia/Colombo',
};

describe('bidirectional time engine', () => {
  it('derives units from a stable future difference', () => {
    expect(calculateTime(exact('2026-10-29'), timestamp('2026-10-27T10:58:57Z'))).toMatchObject({
      status: 'future',
      days: 2,
      hours: 1,
      minutes: 1,
      seconds: 3,
      totalSeconds: 176463,
    });
  });
  it('counts up since a past event', () => {
    expect(calculateTime(exact('2026-10-25'), timestamp('2026-10-27T13:01:02Z'))).toMatchObject({
      status: 'past',
      days: 2,
      hours: 1,
      minutes: 1,
      seconds: 2,
    });
  });
  it('transitions through the exact instant without mutating the event', () => {
    const event = exact('2026-10-27');
    const target = eventInstant(event);
    expect(calculateTime(event, target - 1000).status).toBe('future');
    expect(calculateTime(event, target).status).toBe('present');
    expect(calculateTime(event, target + 1000)).toMatchObject({ status: 'past', seconds: 1 });
  });
  it('handles leap days without month approximations', () => {
    expect(
      calculateTime(exact('2024-03-01', '00:00'), timestamp('2024-02-28T00:00:00Z')).days,
    ).toBe(2);
    expect(
      calculateTime(exact('2023-03-01', '00:00'), timestamp('2023-02-28T00:00:00Z')).days,
    ).toBe(1);
  });
  it('crosses midnight and year boundaries precisely', () => {
    expect(
      calculateTime(exact('2027-01-01', '00:00'), timestamp('2026-12-31T23:59:59Z')),
    ).toMatchObject({ days: 0, seconds: 1 });
  });
  it('preserves Colombo local dates instead of serializing them as UTC', () => {
    expect(eventInstant(exact('2026-10-27', '12:00', 'Asia/Colombo'))).toBe(
      timestamp('2026-10-27T06:30:00Z'),
    );
    expect(eventInstant(day('2026-10-27'))).toBe(timestamp('2026-10-26T18:30:00Z'));
  });
  it('handles DST offsets for exact instants', () => {
    expect(eventInstant(exact('2026-01-15', '12:00', 'America/New_York'))).toBe(
      timestamp('2026-01-15T17:00:00Z'),
    );
    expect(eventInstant(exact('2026-07-15', '12:00', 'America/New_York'))).toBe(
      timestamp('2026-07-15T16:00:00Z'),
    );
  });
  it('shows Today throughout the event day, then becomes a memory', () => {
    const event = day('2026-10-27');
    expect(calculateTime(event, timestamp('2026-10-26T18:29:59Z')).status).toBe('future');
    expect(calculateTime(event, timestamp('2026-10-26T18:30:00Z')).status).toBe('today');
    expect(calculateTime(event, timestamp('2026-10-27T18:29:59Z')).status).toBe('today');
    expect(calculateTime(event, timestamp('2026-10-27T18:30:00Z'))).toMatchObject({
      status: 'past',
      days: 1,
    });
  });
  it('uses the saved zone for Today even across the international date line', () => {
    expect(
      calculateTime(day('2026-10-28', 'Pacific/Auckland'), timestamp('2026-10-27T12:00:00Z'))
        .status,
    ).toBe('today');
    expect(
      calculateTime(day('2026-10-27', 'America/Los_Angeles'), timestamp('2026-10-28T06:59:59Z'))
        .status,
    ).toBe('today');
  });
  it('handles 23- and 25-hour calendar days across DST', () => {
    const spring = day('2026-03-08', 'America/New_York');
    expect(calculateTime(spring, timestamp('2026-03-09T03:59:59Z')).status).toBe('today');
    expect(calculateTime(spring, timestamp('2026-03-09T04:00:00Z'))).toMatchObject({
      status: 'past',
      hours: 23,
    });
    const fall = day('2026-11-01', 'America/New_York');
    expect(calculateTime(fall, timestamp('2026-11-02T04:59:59Z')).status).toBe('today');
    expect(calculateTime(fall, timestamp('2026-11-02T05:00:00Z'))).toMatchObject({
      status: 'past',
      days: 1,
      hours: 1,
    });
  });
  it('handles very old and far-future moments', () => {
    expect(
      calculateTime(exact('1900-01-01', '00:00'), timestamp('2026-01-01T00:00:00Z')).days,
    ).toBe(46021);
    expect(
      calculateTime(exact('2500-01-01', '00:00'), timestamp('2026-01-01T00:00:00Z')).status,
    ).toBe('future');
  });
  it('remains deterministic after JSON serialization and refresh', () => {
    const event = day('2026-10-27');
    const now = timestamp('2026-10-27T06:00:00Z');
    expect(calculateTime(JSON.parse(JSON.stringify(event)), now)).toEqual(
      calculateTime(event, now),
    );
    expect(formatEventDate(event)).toBe('Oct 27, 2026');
  });
  it('rejects invalid current times and unparseable targets', () => {
    expect(() => calculateTime(exact('nope'), Date.now())).toThrow();
    expect(() => calculateTime(day('2026-10-27'), NaN)).toThrow();
  });
});
describe('event validation', () => {
  it.each(['2026-02-29', '2026-02-30', '2026-13-01', 'wrong', '2026-2-1'])(
    'rejects invalid date %s',
    (date) => {
      expect(eventInputSchema.safeParse({ ...valid, date }).success).toBe(false);
    },
  );
  it('accepts real leap dates and trims titles', () => {
    expect(eventInputSchema.parse({ ...valid, date: '2024-02-29', title: '  A day  ' }).title).toBe(
      'A day',
    );
  });
  it('rejects blank titles, invalid zones and invalid accent values', () => {
    for (const change of [
      { title: '   ' },
      { timezone: 'Mars/Olympus' },
      { accentColor: 'url(x)' },
    ])
      expect(eventInputSchema.safeParse({ ...valid, ...change }).success).toBe(false);
  });
  it('requires time only for exact moments', () => {
    expect(eventInputSchema.safeParse(valid).success).toBe(true);
    expect(eventInputSchema.safeParse({ ...valid, dateMode: 'date-time', time: '' }).success).toBe(
      false,
    );
    expect(
      eventInputSchema.safeParse({ ...valid, dateMode: 'date-time', time: '25:90' }).success,
    ).toBe(false);
    expect(
      eventInputSchema.safeParse({ ...valid, dateMode: 'date-time', time: '14:30' }).success,
    ).toBe(true);
  });
  it('rejects nonexistent local times at the spring-forward boundary', () => {
    expect(
      eventInputSchema.safeParse({
        ...valid,
        date: '2026-03-08',
        dateMode: 'date-time',
        time: '02:30',
        timezone: 'America/New_York',
      }).success,
    ).toBe(false);
  });
  it('resolves a repeated autumn hour deterministically', () => {
    expect(
      eventInputSchema.safeParse({
        ...valid,
        date: '2026-11-01',
        dateMode: 'date-time',
        time: '01:30',
        timezone: 'America/New_York',
      }).success,
    ).toBe(true);
    expect(eventInstant(exact('2026-11-01', '01:30', 'America/New_York'))).toBe(
      timestamp('2026-11-01T05:30:00Z'),
    );
  });
});

describe('rare timezone transitions', () => {
  it('finds the real beginning of a date whose midnight is skipped', () => {
    const event = day('2018-11-04', 'America/Sao_Paulo');
    expect(eventInstant(event)).toBe(timestamp('2018-11-04T03:00:00Z'));
    expect(calculateTime(event, timestamp('2018-11-04T02:59:59Z')).status).toBe('future');
    expect(calculateTime(event, timestamp('2018-11-04T03:00:00Z')).status).toBe('today');
  });
  it('chooses the first repeated instant for positive and negative offsets', () => {
    expect(eventInstant(exact('2026-10-25', '01:30', 'Europe/London'))).toBe(
      timestamp('2026-10-25T00:30:00Z'),
    );
    expect(eventInstant(exact('2026-11-01', '01:30', 'America/New_York'))).toBe(
      timestamp('2026-11-01T05:30:00Z'),
    );
  });
  it('handles half-hour DST transitions', () => {
    expect(eventInstant(exact('2026-04-05', '01:45', 'Australia/Lord_Howe'))).toBe(
      timestamp('2026-04-04T14:45:00Z'),
    );
  });
  it('rejects entirely skipped local calendar days', () => {
    expect(
      eventInputSchema.safeParse({ ...valid, date: '2011-12-30', timezone: 'Pacific/Apia' })
        .success,
    ).toBe(false);
  });
  it('rejects invalid inputs even when bypassing form validation', () => {
    expect(() => eventInstant(exact('2026-02-30'))).toThrow();
    expect(() => eventInstant(exact('2026-03-08', '02:30', 'America/New_York'))).toThrow();
  });
});
