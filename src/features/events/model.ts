import { z } from 'zod';
import { format, isValid, parseISO } from 'date-fns';
import { resolveZonedInstant } from '@/lib/time/zoned';

export const categories = [
  'birthday',
  'anniversary',
  'education',
  'career',
  'travel',
  'personal',
  'celebration',
  'other',
] as const;
export type EventCategory = (typeof categories)[number];
export const accents = [
  { name: 'Iris', value: '#8b7bec' },
  { name: 'Ocean', value: '#4d9bbc' },
  { name: 'Sage', value: '#649a7d' },
  { name: 'Rose', value: '#cf8094' },
  { name: 'Amber', value: '#c7984b' },
  { name: 'Lavender', value: '#aa83cd' },
] as const;
export const emojis = ['✨', '🎓', '🌴', '🎂', '🤍', '🚀', '🌱', '🎉', '☀️', '🏡', '✈️', '🏆'];
export function validTimezone(value: string) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
export function validDate(value: string) {
  const parsed = parseISO(value);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parsed) && format(parsed, 'yyyy-MM-dd') === value
  );
}
export const eventInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Give your moment a name.')
      .max(80, 'Keep the title under 80 characters.'),
    description: z.string().max(1000, 'Keep your story under 1,000 characters.'),
    category: z.enum(categories),
    emoji: z.string().trim().min(1).max(12),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Choose a valid accent color.'),
    date: z.string().refine(validDate, 'Choose a valid calendar date.'),
    time: z.string().optional(),
    timezone: z.string().refine(validTimezone, 'Choose a valid IANA timezone.'),
    dateMode: z.enum(['date-only', 'date-time']),
  })
  .superRefine((event, ctx) => {
    if (
      event.dateMode === 'date-time' &&
      (!event.time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time))
    ) {
      ctx.addIssue({ code: 'custom', path: ['time'], message: 'Choose a time for this moment.' });
      return;
    }
    if (!validDate(event.date) || !validTimezone(event.timezone)) return;
    try {
      resolveZonedInstant(
        event.date,
        event.dateMode === 'date-only' ? '00:00' : event.time!,
        event.timezone,
        event.dateMode === 'date-only',
      );
    } catch (error) {
      ctx.addIssue({
        code: 'custom',
        path: [event.dateMode === 'date-only' ? 'date' : 'time'],
        message: error instanceof Error ? error.message : 'Choose a valid date and time.',
      });
    }
  });
export const eventSchema = eventInputSchema.safeExtend({
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  isDemo: z.boolean().optional(),
});
export type EventInput = z.infer<typeof eventInputSchema>;
export type TimeVerseEvent = z.infer<typeof eventSchema>;
export function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
