import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Infinity as InfinityIcon,
  ShieldCheck,
  Sparkles,
  Clock3,
  Heart,
  MoveUpRight,
  Plus,
  Paintbrush,
  CalendarHeart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/layout/reveal';
import { LandingPreview } from '@/components/landing-preview';
export default function Home() {
  return (
    <div className="landing">
      <section className="hero page-container">
        <Reveal className="hero-copy">
          <div className="pill">
            <span className="live-dot" /> A LITTLE SPACE FOR YOUR BIG MOMENTS
          </div>
          <h1>
            Every moment
            <br />
            has a <span className="serif-accent">story.</span>
            <span className="hero-spark" aria-hidden="true">
              ✳︎
            </span>
          </h1>
          <p className="hero-subtitle">
            Count down to what matters. Look back on what shaped you. Keep every meaningful moment
            close.
          </p>
          <div className="hero-ctas">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Start tracking moments
                <ArrowRight size={17} />
              </Link>
            </Button>
            <Link className="text-link" href="#features">
              Explore the little things
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-reassurance">
            <ShieldCheck size={15} />
            <span>Just you and your moments. No sign-up needed.</span>
          </div>
        </Reveal>
        <Reveal delay={0.12} className="hero-preview">
          <LandingPreview />
        </Reveal>
      </section>
      <div className="belief-strip">
        <p>
          Not just counting time. <span>Making time count.</span>
        </p>
        <div>
          <span>
            <Heart size={15} /> Meaningfully personal
          </span>
          <span>
            <ShieldCheck size={15} /> Private by design
          </span>
          <span>
            <Sparkles size={15} /> Beautifully simple
          </span>
        </div>
      </div>
      <section id="features" className="features-section page-container">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">TIME MOVES. YOUR MOMENTS STAY.</p>
            <h2>
              For the days ahead.
              <br />
              <span className="muted-heading">And the ones that made you.</span>
            </h2>
          </div>
          <p>
            Some moments you can’t wait for.
            <br />
            Others, you’ll never want to forget.
            <br />
            There’s a place for both.
          </p>
        </Reveal>
        <div className="feature-grid">
          <Reveal className="feature-card future-feature">
            <span className="feature-icon">
              <ArrowUpRight size={22} />
            </span>
            <div className="mini-timer" aria-hidden="true">
              <span>
                048<small>DAYS</small>
              </span>
              <span className="mini-colon">:</span>
              <span>
                12<small>HOURS</small>
              </span>
              <span className="mini-colon">:</span>
              <span>
                36<small>MINUTES</small>
              </span>
            </div>
            <span className="feature-tag">LOOKING FORWARD</span>
            <h3>
              A little anticipation.
              <br />A lot to look forward to.
            </h3>
            <p>
              The big adventure. The next birthday. That long-awaited hello. Watch the distance get
              smaller.
            </p>
          </Reveal>
          <Reveal className="feature-card past-feature" delay={0.07}>
            <span className="feature-icon">
              <ArrowDownLeft size={22} />
            </span>
            <div className="memory-visual" aria-hidden="true">
              <div>🌱</div>
              <span>
                486<small>days of becoming</small>
              </span>
              <span className="memory-star">✧</span>
            </div>
            <span className="feature-tag">LOOKING BACK</span>
            <h3>
              Some days change
              <br />
              everything after them.
            </h3>
            <p>
              Celebrate how far you’ve come. Keep the beginnings, breakthroughs, and beautiful
              ordinary days close.
            </p>
          </Reveal>
          <Reveal className="feature-card transition-feature" delay={0.14}>
            <span className="feature-icon">
              <InfinityIcon size={24} />
            </span>
            <div className="transition-visual" aria-hidden="true">
              <span>
                00<small>SECONDS TO GO</small>
              </span>
              <span className="transition-line">
                <Heart size={21} />
              </span>
              <span>
                01<small>SECOND TO KEEP</small>
              </span>
            </div>
            <span className="feature-tag">ALWAYS CONNECTED</span>
            <h3>
              The countdown ends.
              <br />
              The story keeps going.
            </h3>
            <p>
              When the moment arrives, your countdown becomes a memory. Seamlessly, without lifting
              a finger.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="personal-section page-container">
        <Reveal className="personal-art">
          <div className="small-event tilt-left">
            <span>🤍</span>
            <div>
              <small>ANNIVERSARY</small>
              <strong>Still choosing you.</strong>
              <p>730 days & counting</p>
            </div>
            <Heart size={16} />
          </div>
          <div className="small-event tilt-right">
            <span>☀️</span>
            <div>
              <small>PERSONAL</small>
              <strong>My slow morning era.</strong>
              <p>Every day is a fresh start</p>
            </div>
            <Sparkles size={16} />
          </div>
          <span className="personal-caption">your life, in your own little way.</span>
        </Reveal>
        <Reveal className="personal-copy">
          <p className="eyebrow">AS UNIQUE AS YOUR STORY</p>
          <h2>
            Not every moment
            <br />
            needs to be <span className="serif-accent">a milestone.</span>
          </h2>
          <p>
            Your first apartment. A promise to yourself. A Tuesday that felt different. Give every
            moment its own color, a little character, and a place to belong.
          </p>
          <Link className="text-link" href="/events/new">
            Make a moment yours
            <ArrowUpRight size={16} />
          </Link>
        </Reveal>
      </section>
      <section id="how-it-works" className="how-section page-container">
        <Reveal className="center-heading">
          <p className="eyebrow">LESS SETUP. MORE LIVING.</p>
          <h2>
            A moment to begin.
            <br />A lifetime to keep.
          </h2>
        </Reveal>
        <div className="steps-grid">
          {[
            {
              icon: Plus,
              title: 'Name your moment',
              text: 'Give it a name. A date. Maybe a little story. Big or small, it belongs here.',
            },
            {
              icon: Paintbrush,
              title: 'Make it feel like you',
              text: 'Pick a color and an emoji. A tiny personal touch that makes all the difference.',
            },
            {
              icon: CalendarHeart,
              title: 'Let time tell the story',
              text: 'Look forward. Look back. Your moments keep moving with you.',
            },
          ].map((step, i) => (
            <Reveal key={step.title} className="step" delay={i * 0.06}>
              <div className="step-top">
                <span className="step-number">0{i + 1}</span>
                <step.icon size={23} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <Reveal className="final-cta page-container">
        <div className="cta-orbit" aria-hidden="true">
          <Clock3 size={30} />
        </div>
        <p className="eyebrow">YOUR LIFE, MEASURED IN MOMENTS.</p>
        <h2>
          Someday is a date.
          <br />
          <span className="serif-accent">Make it a moment.</span>
        </h2>
        <p>
          A little more intention. A little more anticipation.
          <br />A beautiful place to start.
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard">
            Your first moment starts here
            <MoveUpRight size={17} />
          </Link>
        </Button>
        <span className="cta-note">Free. Private. Entirely yours.</span>
      </Reveal>
    </div>
  );
}
