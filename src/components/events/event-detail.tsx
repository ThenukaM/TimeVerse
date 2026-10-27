'use client';
import Link from 'next/link';
import { type CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Globe2,
  Heart,
  Sparkles,
  Clock3,
} from 'lucide-react';
import { useEvents } from '@/stores/events';
import { categoryLabel } from '@/features/events/model';
import { calculateTime, formatEventDate } from '@/lib/time/engine';
import { useClock } from '@/hooks/use-clock';
import { EventActions } from './event-actions';
import dynamic from 'next/dynamic';
const EventForm = dynamic(() => import('./event-form').then((module) => module.EventForm));
import { Timer } from '@/components/timer/timer';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/layout/reveal';
export function EventDetail({ id, edit = false }: { id: string; edit?: boolean }) {
  const event = useEvents((state) => state.events.find((event) => event.id === id));
  const hydrated = useEvents((state) => state.hydrated);
  const now = useClock();
  if (!hydrated)
    return (
      <div className="loading-state" role="status">
        <div className="loading-orbit" />
        <p>Finding your moment…</p>
      </div>
    );
  if (!event)
    return (
      <div className="empty-state standalone">
        <Heart size={36} strokeWidth={1.3} />
        <h1>This moment has moved on.</h1>
        <p>
          It may have been deleted, or saved in a different browser.
          <br />
          Your moments stay on the device where you create them.
        </p>
        <Button asChild>
          <Link href="/dashboard">
            Back to your moments
            <ArrowLeft size={15} />
          </Link>
        </Button>
      </div>
    );
  if (edit) return <EventForm event={event} />;
  const state = now !== null ? calculateTime(event, now) : null;
  const past = state?.status === 'past';
  const current = state?.status === 'today' || state?.status === 'present';
  return (
    <div
      className="detail-page page-container"
      style={{ '--event-accent': event.accentColor } as CSSProperties}
    >
      <div className="detail-navigation">
        <Link href="/dashboard" className="back-link">
          <ArrowLeft size={16} />
          Back to your moments
        </Link>
        <EventActions event={event} full />
      </div>
      <Reveal className="detail-intro">
        <span className="detail-emoji">{event.emoji}</span>
        <div className="detail-badges">
          <span>{categoryLabel(event.category)}</span>
          {event.isDemo && <span>Sample moment</span>}
          <span>
            <span className="live-dot" />
            {state
              ? current
                ? 'The moment is here'
                : past
                  ? 'A memory worth keeping'
                  : 'Something to look forward to'
              : 'A meaningful moment'}
          </span>
        </div>
        <h1>{event.title}</h1>
        {event.description && <p>{event.description}</p>}
      </Reveal>
      <Reveal className="detail-timer-panel" delay={0.08}>
        <div className="detail-orbits" aria-hidden="true">
          <div />
          <div />
          <span>✧</span>
        </div>
        <div className="detail-timer-label">
          <span className="live-dot" />
          {current ? 'BE HERE, RIGHT NOW' : past ? 'TIME SINCE' : 'TIME REMAINING'}
        </div>
        <Timer state={state} />
        <p className="detail-human">
          {state
            ? current
              ? 'Some days are worth slowing down for.'
              : `${state.days.toLocaleString()} ${state.days === 1 ? 'day' : 'days'}, ${state.hours} ${state.hours === 1 ? 'hour' : 'hours'} ${past ? 'since this part of your story began.' : 'until a new part of your story begins.'}`
            : 'Every second is part of your story.'}
        </p>
        <span className="detail-timer-bottom">
          <Sparkles size={14} />
          {past ? 'Look how far you’ve come.' : 'A little closer with every second.'}
        </span>
      </Reveal>
      <div className="detail-facts">
        <div>
          <CalendarDays size={19} />
          <span>THE DATE</span>
          <strong>{formatEventDate(event, true)}</strong>
          <small>
            {event.dateMode === 'date-only'
              ? 'A whole day to celebrate'
              : 'An exact moment in time'}
          </small>
        </div>
        <div>
          <Globe2 size={19} />
          <span>YOUR CORNER OF THE WORLD</span>
          <strong>{event.timezone.replaceAll('_', ' ')}</strong>
          <small>Always tracked in this timezone</small>
        </div>
        <div>
          <Clock3 size={19} />
          <span>{past ? 'TOTAL DAYS ELAPSED' : 'TOTAL DAYS REMAINING'}</span>
          <strong>
            {current
              ? 'Here. Now.'
              : state
                ? `${state.totalDays.toLocaleString('en-US', { maximumFractionDigits: 2 })} days`
                : '—'}
          </strong>
          <small>{current ? 'Make a beautiful memory' : 'Every little fraction counts'}</small>
        </div>
      </div>
      <div className="detail-reflection">
        <Heart size={18} strokeWidth={1.5} />
        <p>
          {past
            ? 'You can’t go back to a moment. But you can keep a little piece of it.'
            : 'The best part of looking forward is knowing there’s a story still to come.'}
        </p>
      </div>
      <Link className="text-link detail-back" href="/dashboard">
        There’s more to your story
        <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
