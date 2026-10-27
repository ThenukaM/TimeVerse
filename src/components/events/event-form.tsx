'use client';
import { useSyncExternalStore, type CSSProperties } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Globe2,
  Check,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  eventInputSchema,
  categories,
  categoryLabel,
  accents,
  emojis,
  type EventInput,
  type TimeVerseEvent,
} from '@/features/events/model';
import { useEvents } from '@/stores/events';
import { EventPreview } from './event-preview';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/layout/reveal';
const noop = () => () => {};
function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} role="alert" className="field-error">
      {message}
    </p>
  ) : null;
}
export function EventForm({ event }: { event?: TimeVerseEvent }) {
  const router = useRouter();
  const create = useEvents((state) => state.create);
  const update = useEvents((state) => state.update);
  const browserTimezone = useSyncExternalStore(
    noop,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => '',
  );
  const form = useForm<EventInput>({
    resolver: zodResolver(eventInputSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time || '',
          timezone: event.timezone,
          dateMode: event.dateMode,
          category: event.category,
          emoji: event.emoji,
          accentColor: event.accentColor,
        }
      : {
          title: '',
          description: '',
          date: '',
          time: '',
          timezone: 'Asia/Colombo',
          dateMode: 'date-only',
          category: 'personal',
          emoji: '✨',
          accentColor: '#8b7bec',
        },
    mode: 'onBlur',
  });
  const values = useWatch({ control: form.control });
  const { errors, isSubmitting } = form.formState;
  const submit = form.handleSubmit((input) => {
    try {
      let id: string;
      if (event) {
        update(event.id, input);
        id = event.id;
      } else id = create(input).id;
      const warning = useEvents.getState().warning;
      if (warning) toast.warning(warning);
      else
        toast.success(
          event
            ? 'Moment updated. The story continues.'
            : 'A new moment, a new story. Saved just for you.',
        );
      router.push(`/events/${id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'This moment couldn’t be saved. Please try again.',
      );
    }
  });
  const timezones = [
    ...new Set([
      'Asia/Colombo',
      browserTimezone,
      'UTC',
      'America/New_York',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Singapore',
      'Australia/Sydney',
      ...Intl.supportedValuesOf('timeZone'),
    ]),
  ].filter(Boolean);
  return (
    <div className="form-page page-container">
      <Link href={event ? `/events/${event.id}` : '/dashboard'} className="back-link">
        <ArrowLeft size={16} />
        {event ? 'Back to your moment' : 'Back to your moments'}
      </Link>
      <Reveal className="form-heading">
        <p className="eyebrow">
          {event ? 'THE STORY IS STILL UNFOLDING' : 'BIG OR SMALL, IT BELONGS HERE'}
        </p>
        <h1>{event ? 'A little refinement.' : 'Make it a moment.'}</h1>
        <p>
          {event
            ? 'Life changes. Your moments can, too.'
            : 'A date to dream about. A day to remember. Let’s give it a home.'}
        </p>
      </Reveal>
      <div className="form-layout">
        <form noValidate onSubmit={submit} className="event-form">
          <section className="form-section">
            <div className="form-section-heading">
              <span>01</span>
              <div>
                <h2>The little details</h2>
                <p>Every good story starts with a name.</p>
              </div>
            </div>
            <div className="field">
              <label htmlFor="title">
                Name your moment <span>*</span>
              </label>
              <input
                id="title"
                placeholder="e.g. The beginning of something good"
                maxLength={80}
                autoFocus
                {...form.register('title')}
                aria-invalid={!!errors.title}
                aria-describedby="title-error"
              />
              <FieldError id="title-error" message={errors.title?.message} />
            </div>
            <div className="field">
              <label htmlFor="description">
                A little story <span className="optional">optional</span>
              </label>
              <textarea
                id="description"
                placeholder="Why does this moment matter to you?"
                rows={3}
                maxLength={1000}
                {...form.register('description')}
                aria-invalid={!!errors.description}
                aria-describedby="description-error"
              />
              <FieldError id="description-error" message={errors.description?.message} />
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" {...form.register('category')}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>
          </section>
          <section className="form-section">
            <div className="form-section-heading">
              <span>02</span>
              <div>
                <h2>A place in time</h2>
                <p>Looking forward or looking back? We’ll work it out.</p>
              </div>
            </div>
            <fieldset className="mode-fieldset">
              <legend className="field-label">How precise is your moment?</legend>
              <div className="date-mode-controls">
                <label className={values.dateMode === 'date-only' ? 'chosen' : ''}>
                  <input type="radio" value="date-only" {...form.register('dateMode')} />
                  <CalendarDays size={17} />
                  <span>
                    Just the day<small>Celebrate the whole calendar day</small>
                  </span>
                  <span className="radio-indicator" />
                </label>
                <label className={values.dateMode === 'date-time' ? 'chosen' : ''}>
                  <input type="radio" value="date-time" {...form.register('dateMode')} />
                  <Clock3 size={17} />
                  <span>
                    The exact moment<small>Down to the minute</small>
                  </span>
                  <span className="radio-indicator" />
                </label>
              </div>
            </fieldset>
            <div className="date-time-fields">
              <div className="field">
                <label htmlFor="date">
                  The date <span>*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  min="0001-01-01"
                  max="9999-12-31"
                  {...form.register('date')}
                  aria-invalid={!!errors.date}
                  aria-describedby="date-error"
                />
                <FieldError id="date-error" message={errors.date?.message} />
              </div>
              {values.dateMode === 'date-time' && (
                <div className="field">
                  <label htmlFor="time">
                    The time <span>*</span>
                  </label>
                  <input
                    id="time"
                    type="time"
                    {...form.register('time')}
                    aria-invalid={!!errors.time}
                    aria-describedby="time-error"
                  />
                  <FieldError id="time-error" message={errors.time?.message} />
                </div>
              )}
            </div>
            <div className="field">
              <label htmlFor="timezone">
                <Globe2 size={14} />
                Timezone
              </label>
              <input
                id="timezone"
                list="timezones"
                {...form.register('timezone')}
                aria-invalid={!!errors.timezone}
                aria-describedby="timezone-error timezone-help"
              />
              <datalist id="timezones">
                {timezones.map((zone) => (
                  <option key={zone} value={zone} />
                ))}
              </datalist>
              <FieldError id="timezone-error" message={errors.timezone?.message} />
              <div className="field-help" id="timezone-help">
                <span>Saved with your moment, wherever life takes you.</span>
                {browserTimezone && browserTimezone !== values.timezone && (
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue('timezone', browserTimezone, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  >
                    Use my timezone ({browserTimezone})
                  </button>
                )}
              </div>
            </div>
            <p className="form-info">
              <Info size={15} />
              {values.dateMode === 'date-only'
                ? 'Date-only moments show “Today” for the entire day in their saved timezone.'
                : 'The timer follows the exact instant in your saved timezone. During a repeated daylight-saving hour, the first matching instant is used.'}
            </p>
          </section>
          <section className="form-section">
            <div className="form-section-heading">
              <span>03</span>
              <div>
                <h2>A little personality</h2>
                <p>Make this corner of time feel like you.</p>
              </div>
            </div>
            <fieldset className="personality-field">
              <legend>Pick a little character</legend>
              <div className="emoji-picker">
                {emojis.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    aria-label={`Choose ${emoji} icon`}
                    aria-pressed={values.emoji === emoji}
                    className={values.emoji === emoji ? 'selected' : ''}
                    onClick={() => form.setValue('emoji', emoji, { shouldDirty: true })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="personality-field">
              <legend>Set the mood</legend>
              <div className="accent-picker">
                {accents.map((accent) => (
                  <label key={accent.value} style={{ '--swatch': accent.value } as CSSProperties}>
                    <input
                      type="radio"
                      value={accent.value}
                      {...form.register('accentColor')}
                      aria-label={accent.name}
                    />
                    <span className="color-swatch">
                      {values.accentColor === accent.value && <Check size={16} />}
                    </span>
                    <small>{accent.name}</small>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
          <div className="form-actions">
            <Button asChild variant="secondary">
              <Link href={event ? `/events/${event.id}` : '/dashboard'}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : event ? 'Save changes' : 'Save this moment'}
              <ArrowRight size={16} />
            </Button>
          </div>
          <p className="privacy-note">
            <ShieldCheck size={13} />
            Stored on this device. A space that’s entirely yours.
          </p>
        </form>
        <EventPreview values={values} />
      </div>
    </div>
  );
}
