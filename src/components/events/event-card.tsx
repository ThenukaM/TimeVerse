'use client';
import { memo, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'motion/react';
import type { TimeVerseEvent } from '@/features/events/model';
import { categoryLabel } from '@/features/events/model';
import { useClock } from '@/hooks/use-clock';
import { calculateTime, formatEventDate, statusLabel } from '@/lib/time/engine';
import { Timer } from '@/components/timer/timer';
import { EventActions } from './event-actions';
export const EventCard = memo(function EventCard({
  event,
  index = 0,
}: {
  event: TimeVerseEvent;
  index?: number;
}) {
  const now = useClock();
  const state = now !== null ? calculateTime(event, now) : null;
  const past = state?.status === 'past';
  return (
    <motion.article
      className="event-card"
      style={{ '--event-accent': event.accentColor } as CSSProperties}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04 }}
      whileHover={{ y: -3 }}
    >
      <div className="card-top">
        <span className="event-emoji">{event.emoji}</span>
        <EventActions event={event} />
      </div>
      <Link className="event-card-link" href={`/events/${event.id}`}>
        <span className="card-category">
          {categoryLabel(event.category)}
          {event.isDemo && <span className="sample-label">SAMPLE</span>}
        </span>
        <h3>{event.title}</h3>
        <p className="card-date">{formatEventDate(event)}</p>
        <div className="card-timer-wrap">
          <div className={`card-timer-label ${past ? 'past-label' : ''}`}>
            {past ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
            {state ? statusLabel(state.status) : 'A moment in time'}
          </div>
          <Timer compact state={state} />
        </div>
        <div className="card-footer">
          <span>
            {past
              ? 'A little part of your story'
              : state?.status === 'today'
                ? 'Make a memory today'
                : 'Good things take a little time'}
          </span>
          <ArrowUpRight size={15} />
        </div>
      </Link>
    </motion.article>
  );
});
