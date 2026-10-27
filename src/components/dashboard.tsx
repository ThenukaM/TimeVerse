'use client';
import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import * as Tabs from '@radix-ui/react-tabs';
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Heart,
  Layers3,
  CalendarDays,
  X,
  ShieldCheck,
  Trash2,
  Orbit,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEvents } from '@/stores/events';
import { categories, categoryLabel } from '@/features/events/model';
import { useClock } from '@/hooks/use-clock';
import { calculateTime, eventInstant, formatEventDate } from '@/lib/time/engine';
import { EventCard } from '@/components/events/event-card';
import { Timer } from '@/components/timer/timer';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/layout/reveal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function DashboardDate() {
  const now = useClock();
  return (
    <div className="dashboard-date">
      <CalendarDays size={15} />
      <span>
        {now
          ? new Intl.DateTimeFormat('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'Asia/Colombo',
            }).format(now)
          : 'A new day, a new possibility'}
      </span>
    </div>
  );
}
function Statistics() {
  const events = useEvents((state) => state.events);
  const now = useClock();
  const past =
    now === null ? 0 : events.filter((event) => calculateTime(event, now).status === 'past').length;
  const stats = [
    {
      label: 'Total moments',
      number: events.length,
      icon: Layers3,
      caption: 'Little pieces of your life',
      style: 'lilac',
    },
    {
      label: 'Looking forward',
      number: events.length - past,
      icon: ArrowUpRight,
      caption: 'Good things on the horizon',
      style: 'blue',
    },
    {
      label: 'Looking back',
      number: past,
      icon: Heart,
      caption: 'Memories worth keeping',
      style: 'sage',
    },
  ];
  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div className={`stat-card ${stat.style}`} key={stat.label}>
          <span className="stat-icon">
            <stat.icon size={18} />
          </span>
          <div>
            <span className="stat-label">{stat.label}</span>
            <strong>{String(stat.number).padStart(2, '0')}</strong>
          </div>
          <span className="stat-caption">{stat.caption}</span>
        </div>
      ))}
    </div>
  );
}
function FeaturedMoment() {
  const events = useEvents((state) => state.events);
  const now = useClock();
  if (!events.length || now === null) return null;
  const ordered = [...events].sort((a, b) => eventInstant(a) - eventInstant(b));
  const event =
    ordered.find((event) => ['today', 'present'].includes(calculateTime(event, now).status)) ||
    ordered.find((event) => calculateTime(event, now).status === 'future') ||
    ordered.at(-1)!;
  const state = calculateTime(event, now);
  const past = state.status === 'past';
  return (
    <section
      className="featured-moment"
      style={{ '--event-accent': event.accentColor } as CSSProperties}
    >
      <div className="featured-decoration" aria-hidden="true">
        <div />
        <div />
        <span>✧</span>
      </div>
      <div className="featured-copy">
        <div className="featured-eyebrow">
          <Sparkles size={13} />
          {past
            ? 'A MEMORY TO KEEP CLOSE'
            : state.status === 'today' || state.status === 'present'
              ? 'THIS IS YOUR MOMENT'
              : 'YOUR NEXT LITTLE BIG THING'}
        </div>
        <span className="featured-emoji">{event.emoji}</span>
        <h2>{event.title}</h2>
        <p>
          {formatEventDate(event)}
          <span>·</span>
          {categoryLabel(event.category)}
          {event.isDemo && <span className="sample-label">SAMPLE</span>}
        </p>
        <Link href={`/events/${event.id}`} className="text-link">
          Spend a moment here
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="featured-timer">
        <span className="eyebrow">
          {past ? 'LOOK HOW FAR YOU’VE COME' : 'A LITTLE CLOSER EVERY SECOND'}
        </span>
        <Timer state={state} />
        <p>
          {past
            ? 'And the story is still unfolding.'
            : state.status === 'today'
              ? 'Some days are worth being present for.'
              : 'There’s something beautiful about having a date to dream about.'}
        </p>
      </div>
    </section>
  );
}
function EmptyDashboard() {
  const seedDemo = useEvents((state) => state.seedDemo);
  return (
    <Reveal className="empty-dashboard">
      <div className="empty-orbits" aria-hidden="true">
        <Orbit size={48} strokeWidth={1} />
        <span>✧</span>
      </div>
      <p className="eyebrow">EVERY STORY STARTS SOMEWHERE</p>
      <h2>
        Make a little room
        <br />
        for what <span className="serif-accent">matters.</span>
      </h2>
      <p>
        A day you’re dreaming of. A beginning you still remember.
        <br />
        Your first moment is the start of something lovely.
      </p>
      <div className="empty-actions">
        <Button asChild>
          <Link href="/events/new">
            <Plus size={17} />
            Add your first moment
          </Link>
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            seedDemo();
            toast.success('Four sample moments added. Make yourself at home.');
          }}
        >
          <Sparkles size={16} />
          Try demo events
        </Button>
      </div>
      <span className="privacy-note">
        <ShieldCheck size={14} />
        Private by design. Saved only in this browser.
      </span>
    </Reveal>
  );
}
function Collection() {
  const events = useEvents((state) => state.events);
  const clearDemo = useEvents((state) => state.clearDemo);
  const now = useClock();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('nearest');
  const [clearing, setClearing] = useState(false);
  const filtered = events
    .filter((event) => {
      const past = now !== null && calculateTime(event, now).status === 'past';
      return (
        (tab === 'all' || (tab === 'memories' ? past : !past)) &&
        (category === 'all' || event.category === category) &&
        event.title.toLowerCase().includes(query.trim().toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sort === 'newest' || sort === 'oldest')
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          (sort === 'newest' ? -1 : 1)
        );
      const distance =
        Math.abs(eventInstant(a) - (now || 0)) - Math.abs(eventInstant(b) - (now || 0));
      return sort === 'farthest' ? -distance : distance;
    });
  return (
    <section className="collection">
      <div className="collection-heading">
        <div>
          <p className="eyebrow">YOUR PERSONAL TIME CAPSULE</p>
          <h2>
            Every moment matters<span className="heading-dot">.</span>
          </h2>
        </div>
        {events.some((e) => e.isDemo) && (
          <button className="text-link muted-link" onClick={() => setClearing(true)}>
            <Trash2 size={13} />
            Clear demo events
          </button>
        )}
      </div>
      <Tabs.Root value={tab} onValueChange={setTab}>
        <div className="collection-controls">
          <Tabs.List className="segmented-control" aria-label="Moment collection">
            <Tabs.Trigger value="all">
              All moments<span>{events.length}</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="upcoming">Upcoming</Tabs.Trigger>
            <Tabs.Trigger value="memories">Memories</Tabs.Trigger>
          </Tabs.List>
          <div className="collection-tools">
            <label className="search-input">
              <Search size={16} />
              <input
                aria-label="Search moments"
                placeholder="Find a moment…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery('')}>
                  <X size={13} />
                </button>
              )}
            </label>
            <label className="filter-select">
              <SlidersHorizontal size={14} />
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
            </label>
            <select
              className="sort-select"
              aria-label="Sort moments"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="nearest">Nearest first</option>
              <option value="farthest">Farthest first</option>
              <option value="newest">Newest added</option>
              <option value="oldest">Oldest added</option>
            </select>
          </div>
        </div>
        {['all', 'upcoming', 'memories'].map((value) => (
          <Tabs.Content key={value} value={value}>
            {filtered.length ? (
              <div className="events-grid">
                {filtered.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
                <Link className="add-moment-card" href="/events/new">
                  <span>
                    <Plus size={24} strokeWidth={1.4} />
                  </span>
                  <strong>There’s always another story.</strong>
                  <p>
                    Add a new moment
                    <ArrowRight size={13} />
                  </p>
                </Link>
              </div>
            ) : (
              <div className="empty-state">
                <Search size={28} strokeWidth={1.3} />
                <h3>
                  {query || category !== 'all'
                    ? 'No moments found.'
                    : tab === 'upcoming'
                      ? 'A little space for what’s next.'
                      : 'Your memories will live here.'}
                </h3>
                <p>
                  {query || category !== 'all'
                    ? 'Try a different search or give another category a look.'
                    : 'Add a moment from your past or a date to look forward to.'}
                </p>
                {query || category !== 'all' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery('');
                      setCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button asChild variant="secondary">
                    <Link href="/events/new">
                      Add a moment
                      <Plus size={15} />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </Tabs.Content>
        ))}
      </Tabs.Root>
      <Dialog open={clearing} onOpenChange={setClearing}>
        <DialogContent>
          <DialogTitle className="dialog-title">Clear sample moments?</DialogTitle>
          <DialogDescription className="dialog-description">
            This removes only the labeled demo events, including any edits to them. Your own moments
            will stay right here.
          </DialogDescription>
          <div className="dialog-actions">
            <Button variant="secondary" onClick={() => setClearing(false)}>
              Keep them
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearDemo();
                setClearing(false);
                toast.success('Demo moments cleared. Ready for your story.');
              }}
            >
              Clear demo events
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
export function Dashboard() {
  const hydrated = useEvents((state) => state.hydrated);
  const hasEvents = useEvents((state) => state.events.length > 0);
  const warning = useEvents((state) => state.warning);
  return (
    <div className="dashboard page-container">
      <Reveal className="dashboard-heading">
        <div>
          <div className="page-eyebrow">
            <span className="live-dot" /> A LITTLE TIME, JUST FOR YOU
          </div>
          <h1>
            Your moments<span className="heading-dot">.</span>
          </h1>
          <p>Good things ahead. Beautiful things behind. All yours to keep.</p>
        </div>
        <div className="dashboard-heading-actions">
          <DashboardDate />
          <Button asChild>
            <Link href="/events/new">
              <Plus size={16} />
              New moment
            </Link>
          </Button>
        </div>
      </Reveal>
      {warning && (
        <div role="status" className="storage-warning">
          {warning}
        </div>
      )}
      {!hydrated ? (
        <div className="loading-state" role="status">
          <div className="loading-orbit" />
          <p>Opening your time capsule…</p>
        </div>
      ) : (
        <>
          <Statistics />
          {hasEvents ? (
            <>
              <FeaturedMoment />
              <Collection />
              <div className="dashboard-bottom">
                <span>
                  <ShieldCheck size={14} />
                  Your moments stay in this browser. No account, no cloud.
                </span>
                <span>One extraordinary life. So many little moments.</span>
              </div>
            </>
          ) : (
            <EmptyDashboard />
          )}
        </>
      )}
    </div>
  );
}
