'use client';
import { create } from 'zustand';
import { addDays, format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import type { EventInput, TimeVerseEvent } from '@/features/events/model';
import { eventRepository } from '@/lib/storage/event-repository';

type EventsStore = {
  events: TimeVerseEvent[];
  hydrated: boolean;
  warning: string | null;
  hydrate: () => void;
  create: (input: EventInput) => TimeVerseEvent;
  update: (id: string, input: EventInput) => void;
  remove: (id: string) => void;
  seedDemo: () => void;
  clearDemo: () => void;
};
const snapshot = () => ({
  events: eventRepository.getAll(),
  warning: eventRepository.getWarning(),
});
export const useEvents = create<EventsStore>((set) => ({
  events: [],
  hydrated: false,
  warning: null,
  hydrate() {
    set({ ...snapshot(), hydrated: true });
  },
  create(input) {
    const event = eventRepository.create(input);
    set(snapshot());
    return event;
  },
  update(id, input) {
    eventRepository.update(id, input);
    set(snapshot());
  },
  remove(id) {
    eventRepository.delete(id);
    set(snapshot());
  },
  seedDemo() {
    const existing = eventRepository.getAll();
    if (existing.some((e) => e.isDemo)) return;
    const today = new Date(
      `${formatInTimeZone(Date.now(), 'Asia/Colombo', 'yyyy-MM-dd')}T12:00:00`,
    );
    const demos = [
      {
        title: 'The next chapter',
        category: 'education',
        emoji: '🎓',
        days: 48,
        description:
          'Graduation day. Here’s to everything it took to get here, and everything still to come.',
        accentColor: '#8b7bec',
      },
      {
        title: 'Hello, university',
        category: 'education',
        emoji: '📚',
        days: -486,
        description:
          'The first day of a whole new world. New faces, big dreams, and a very full notebook.',
        accentColor: '#649a7d',
      },
      {
        title: 'A little escape',
        category: 'travel',
        emoji: '🌴',
        days: 23,
        description:
          'An upcoming vacation. Slow mornings, salt air, and nowhere in particular to be.',
        accentColor: '#4d9bbc',
      },
      {
        title: 'A promise to myself',
        category: 'personal',
        emoji: '🌱',
        days: -120,
        description:
          'A personal milestone: the day I started making a little more room for myself.',
        accentColor: '#cf8094',
      },
    ] as const;
    demos.forEach((demo) =>
      eventRepository.create(
        {
          title: demo.title,
          category: demo.category,
          emoji: demo.emoji,
          description: demo.description,
          accentColor: demo.accentColor,
          date: format(addDays(today, demo.days), 'yyyy-MM-dd'),
          dateMode: 'date-only',
          timezone: 'Asia/Colombo',
          time: '',
        },
        true,
      ),
    );
    set(snapshot());
  },
  clearDemo() {
    eventRepository.clearDemo();
    set(snapshot());
  },
}));
