'use client';
import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { motion, AnimatePresence } from 'motion/react';
import { useClock } from '@/hooks/use-clock';
import { calculateTime } from '@/lib/time/engine';
import { Timer } from '@/components/timer/timer';
export function LandingPreview() {
  const [past, setPast] = useState(false);
  const now = useClock();
  const base = now
    ? new Date(`${formatInTimeZone(now, 'Asia/Colombo', 'yyyy-MM-dd')}T12:00:00`)
    : null;
  const date = base ? format(addDays(base, past ? -486 : 48), 'yyyy-MM-dd') : '2027-06-18';
  const state = now
    ? calculateTime({ date, dateMode: 'date-only', timezone: 'Asia/Colombo' }, now)
    : null;
  return (
    <div className="hero-art">
      <div className="orbit-system" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />
        <span className="orbit-dot dot-one" />
        <span className="orbit-dot dot-two" />
        <span className="tiny-star star-one">✧</span>
        <span className="tiny-star star-two">✧</span>
      </div>
      <div className="floating-note top-note">
        <span className="note-emoji">🌱</span>
        <div>
          <strong>A promise to myself</strong>
          <span>120 days of showing up</span>
        </div>
        <span className="note-dot" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={String(past)}
          className="preview-card"
          initial={{ opacity: 0, y: 8, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <div className="preview-top">
            <span className="event-emoji">{past ? '📚' : '🎓'}</span>
            <span className="status-badge">
              {past ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
              {past ? 'A little look back' : 'Something to look forward to'}
            </span>
          </div>
          <p className="eyebrow">{past ? 'THE FIRST OF MANY' : 'A NEW BEGINNING'}</p>
          <h2>{past ? 'Hello, university.' : 'The next chapter.'}</h2>
          <p className="preview-description">
            {past
              ? 'The day everything started to feel possible.'
              : 'Big dreams. A little nervousness. A whole new world.'}
          </p>
          <Timer state={state} />
          <div className="preview-bottom">
            <span>{past ? 'Time since a beautiful beginning' : 'Until the adventure begins'}</span>
            <Sparkles size={16} />
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="floating-note bottom-note">
        <span className="note-emoji">🌴</span>
        <div>
          <strong>A little escape</strong>
          <span>Good things are on the horizon</span>
        </div>
        <ArrowUpRight size={16} />
      </div>
      <div className="preview-switch" role="group" aria-label="Preview timer mode">
        <button onClick={() => setPast(false)} className={!past ? 'selected' : ''}>
          <ArrowUpRight size={13} />
          Looking forward
        </button>
        <button onClick={() => setPast(true)} className={past ? 'selected' : ''}>
          <ArrowDownLeft size={13} />
          Looking back
        </button>
      </div>
    </div>
  );
}
