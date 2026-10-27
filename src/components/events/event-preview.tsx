'use client';
import type { CSSProperties } from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import { eventInputSchema, categoryLabel, type EventInput } from '@/features/events/model';
import { useClock } from '@/hooks/use-clock';
import { calculateTime, formatEventDate, statusLabel } from '@/lib/time/engine';
import { Timer } from '@/components/timer/timer';
export function EventPreview({ values }: { values: Partial<EventInput> }) {
  const now = useClock();
  const parsed = eventInputSchema.safeParse({
    ...values,
    title: values.title || 'Your next little big thing',
  });
  const state = parsed.success && now !== null ? calculateTime(parsed.data, now) : null;
  return (
    <aside className="preview-aside">
      <div className="preview-aside-header">
        <span className="live-dot" />A LITTLE SNEAK PEEK<span>Live preview</span>
      </div>
      <div
        className="form-preview-card"
        style={{ '--event-accent': values.accentColor } as CSSProperties}
      >
        <span className="form-preview-emoji">{values.emoji}</span>
        <span className="card-category">{categoryLabel(values.category || 'personal')}</span>
        <h2>{values.title || 'Your next little big thing'}</h2>
        <p className="preview-story">
          {values.description || 'Every moment has a story. This one is yours.'}
        </p>
        <div className="form-preview-divider" />
        <span className="eyebrow">
          {state
            ? state.status === 'future'
              ? 'SOMETHING TO LOOK FORWARD TO'
              : state.status === 'past'
                ? 'A MEMORY TO KEEP CLOSE'
                : 'THIS IS YOUR MOMENT'
            : 'PICK A DATE TO SEE IT COME TO LIFE'}
        </span>
        <Timer compact state={state} />
        <div className="form-preview-date">
          <CalendarDays size={14} />
          {parsed.success ? formatEventDate(parsed.data) : 'Your date goes here'}
        </div>
      </div>
      <div className="preview-note">
        <Sparkles size={17} />
        <p>
          {state
            ? `${statusLabel(state.status)} — automatically. No need to choose a direction. Time takes care of that.`
            : 'The big days. The small beginnings. The ones only you understand. They all belong here.'}
        </p>
      </div>
    </aside>
  );
}
