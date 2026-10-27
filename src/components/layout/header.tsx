'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ArrowUpRight, LayoutGrid, Moon, Sun, Orbit } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="TimeVerse home">
      <span className="logo-mark">
        <Orbit size={23} strokeWidth={1.7} />
      </span>
      <span>
        timeverse<span className="logo-period">.</span>
      </span>
    </Link>
  );
}
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      className="icon-button theme-toggle"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Sun size={18} className="sun-icon" />
      <Moon size={18} className="moon-icon" />
    </button>
  );
}
export function Header() {
  const path = usePathname();
  const landing = path === '/';
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav aria-label="Main navigation" className="header-nav">
          {landing ? (
            <>
              <Link className="nav-link" href="#features">
                The little things
              </Link>
              <Link className="nav-link" href="#how-it-works">
                How it works
              </Link>
            </>
          ) : (
            <Link className="nav-link active" href="/dashboard">
              <LayoutGrid size={15} /> Your moments
            </Link>
          )}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <span className="header-divider" />
          <Button asChild variant={landing ? 'default' : 'secondary'} size="sm">
            <Link href={landing ? '/dashboard' : '/events/new'}>
              {landing ? 'Open dashboard' : 'New moment'}
              <ArrowUpRight size={15} />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <Logo />
      <span>A little space for what matters.</span>
      <p>Made for your one, extraordinary life.</p>
    </footer>
  );
}
