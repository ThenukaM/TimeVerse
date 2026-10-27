import {
  eventSchema,
  eventInputSchema,
  type EventInput,
  type TimeVerseEvent,
} from '@/features/events/model';
export const STORAGE_KEY = 'timeverse:events:v1';
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface EventRepository {
  getAll(): TimeVerseEvent[];
  getById(id: string): TimeVerseEvent | undefined;
  create(input: EventInput, isDemo?: boolean): TimeVerseEvent;
  update(id: string, input: EventInput): TimeVerseEvent;
  delete(id: string): void;
  clearDemo(): void;
  getWarning(): string | null;
}
export function createEventRepository(getStorage: () => StorageAdapter | null): EventRepository {
  let memory: TimeVerseEvent[] = [];
  let warning: string | null = null;
  let volatile = false;
  const write = (events: TimeVerseEvent[]) => {
    memory = events;
    try {
      const storage = getStorage();
      if (!storage) throw new Error('Unavailable');
      storage.setItem(STORAGE_KEY, JSON.stringify(events));
      warning = null;
      volatile = false;
    } catch {
      volatile = true;
      warning = 'Browser storage is unavailable. Your moments will only last for this session.';
    }
  };
  const getAll = () => {
    if (volatile) return memory;
    try {
      const storage = getStorage();
      if (!storage) throw new Error('Unavailable');
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        memory = [];
        warning = null;
        return memory;
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Invalid storage');
      const results = parsed.map((record) => eventSchema.safeParse(record));
      memory = results.flatMap((result) => (result.success ? [result.data] : []));
      warning = results.some((result) => !result.success)
        ? 'Some saved moments could not be read. Valid moments have been recovered.'
        : null;
      return memory;
    } catch {
      warning =
        'Saved data could not be read. You can keep tracking in this session; check that browser storage is enabled.';
      return memory;
    }
  };
  return {
    getAll,
    getById: (id) => getAll().find((event) => event.id === id),
    create(input, isDemo = false) {
      const data = eventInputSchema.parse(input);
      const now = new Date().toISOString();
      const event: TimeVerseEvent = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...(isDemo ? { isDemo: true } : {}),
      };
      write([...getAll(), event]);
      return event;
    },
    update(id, input) {
      const events = getAll();
      const existing = events.find((event) => event.id === id);
      if (!existing) throw new Error('This moment no longer exists.');
      const event = {
        ...existing,
        ...eventInputSchema.parse(input),
        updatedAt: new Date().toISOString(),
      };
      write(events.map((item) => (item.id === id ? event : item)));
      return event;
    },
    delete(id) {
      write(getAll().filter((event) => event.id !== id));
    },
    clearDemo() {
      write(getAll().filter((event) => !event.isDemo));
    },
    getWarning: () => warning,
  };
}
export const eventRepository = createEventRepository(() =>
  typeof window === 'undefined' ? null : window.localStorage,
);
