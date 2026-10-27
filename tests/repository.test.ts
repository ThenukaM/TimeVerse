import { beforeEach, describe, expect, it } from 'vitest';
import {
  createEventRepository,
  STORAGE_KEY,
  type StorageAdapter,
} from '@/lib/storage/event-repository';
import type { EventInput } from '@/features/events/model';
const input: EventInput = {
  title: 'Graduation',
  description: 'A beginning',
  category: 'education',
  emoji: '🎓',
  accentColor: '#8b7bec',
  date: '2027-06-18',
  dateMode: 'date-only',
  timezone: 'Asia/Colombo',
};
let entries: Map<string, string>;
let storage: StorageAdapter;
beforeEach(() => {
  entries = new Map();
  storage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value);
    },
  };
});
describe('local event repository', () => {
  it('starts empty without silently inserting demo events', () => {
    expect(createEventRepository(() => storage).getAll()).toEqual([]);
  });
  it('creates, persists and reads a valid event after a fresh repository instance', () => {
    const repository = createEventRepository(() => storage);
    const event = repository.create(input);
    expect(event.id).toMatch(/^[a-f0-9-]{36}$/);
    expect(entries.has(STORAGE_KEY)).toBe(true);
    expect(createEventRepository(() => storage).getById(event.id)).toEqual(event);
  });
  it('updates all fields while preserving identity and original creation time', () => {
    const repository = createEventRepository(() => storage);
    const original = repository.create(input);
    const updated = repository.update(original.id, {
      ...input,
      title: 'I did it',
      date: '2020-01-01',
      dateMode: 'date-time',
      time: '10:45',
      timezone: 'Europe/London',
      accentColor: '#649a7d',
    });
    expect(updated).toMatchObject({
      id: original.id,
      createdAt: original.createdAt,
      title: 'I did it',
      time: '10:45',
      timezone: 'Europe/London',
    });
    expect(repository.getAll()).toHaveLength(1);
  });
  it('deletes events and keeps them deleted after refresh', () => {
    const repository = createEventRepository(() => storage);
    const event = repository.create(input);
    repository.delete(event.id);
    expect(createEventRepository(() => storage).getAll()).toEqual([]);
  });
  it('does not allow missing events to be edited or invalid records to be saved', () => {
    const repository = createEventRepository(() => storage);
    expect(() => repository.update('missing', input)).toThrow('no longer exists');
    expect(() => repository.create({ ...input, title: '' })).toThrow();
    expect(repository.getAll()).toHaveLength(0);
  });
  it.each(['{broken', 'null', '{}', '42'])('recovers from malformed storage %s', (raw) => {
    entries.set(STORAGE_KEY, raw);
    const repository = createEventRepository(() => storage);
    expect(repository.getAll()).toEqual([]);
    expect(repository.getWarning()).toBeTruthy();
    const event = repository.create(input);
    expect(repository.getById(event.id)).toEqual(event);
  });
  it('recovers valid records from a partially invalid array', () => {
    const repository = createEventRepository(() => storage);
    const event = repository.create(input);
    entries.set(
      STORAGE_KEY,
      JSON.stringify([
        event,
        { title: 'Bad record' },
        { ...event, id: 'bad-zone', timezone: 'Mars/Base' },
      ]),
    );
    expect(repository.getAll()).toEqual([event]);
    expect(repository.getWarning()).toContain('recovered');
  });
  it('retains CRUD in memory when storage cannot be accessed', () => {
    const repository = createEventRepository(() => {
      throw new Error('SecurityError');
    });
    const event = repository.create(input);
    expect(repository.getAll()).toEqual([event]);
    repository.update(event.id, { ...input, title: 'Changed' });
    expect(repository.getById(event.id)?.title).toBe('Changed');
    repository.delete(event.id);
    expect(repository.getAll()).toEqual([]);
    expect(repository.getWarning()).toContain('session');
  });
  it('does not lose an event when reads work but writes exceed quota', () => {
    const repository = createEventRepository(() => ({
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    }));
    const event = repository.create(input);
    expect(repository.getById(event.id)).toEqual(event);
    expect(repository.getWarning()).toContain('session');
  });
  it('clears only demo events, preserving personal moments', () => {
    const repository = createEventRepository(() => storage);
    const own = repository.create(input);
    repository.create({ ...input, title: 'Demo' }, true);
    repository.clearDemo();
    expect(repository.getAll()).toEqual([own]);
  });
  it('reads storage changes from another tab', () => {
    const a = createEventRepository(() => storage);
    const b = createEventRepository(() => storage);
    const event = a.create(input);
    expect(b.getById(event.id)).toEqual(event);
    a.delete(event.id);
    expect(b.getAll()).toEqual([]);
  });
});
