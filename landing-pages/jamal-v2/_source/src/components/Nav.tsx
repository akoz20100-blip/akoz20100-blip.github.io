import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import Logo from './Logo';
import LangToggle from './LangToggle';
import { lenisStore, scrollToHash } from '../lib/lenisStore';
import { useContent } from '../lib/content';

/**
 * Fixed nav. A faint top scrim (not mix-blend) keeps the marks legible over any
 * frame while letting the gold accent render true on hover. Desktop shows inline
 * links; below `md` it collapses to an accessible modal drawer (focus-trapped,
 * Escape-to-close, focus restored to the toggle, scroll-locked).
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const prevOpen = useRef(false);
  const c = useContent();
  const LINKS = c.nav.items;

  // Scroll-lock, inert toggling, and focus management on open/close.
  useEffect(() => {
    const lenis = lenisStore.current;
    const drawer = drawerRef.current;
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = 'hidden';
      if (drawer) drawer.inert = false;
      requestAnimationFrame(() => firstLinkRef.current?.focus());
    } else {
      lenis?.start();
      document.documentElement.style.overflow = '';
      if (drawer) drawer.inert = true;
      if (prevOpen.current) toggleRef.current?.focus();
    }
    prevOpen.current = open;
    return () => {
      lenisStore.current?.start();
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  // Escape to close + Tab focus trap (cycles toggle ↔ drawer links).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const focusables = [
        toggleRef.current,
        ...Array.from(drawerRef.current.querySelectorAll<HTMLElement>('a[href]')),
      ].filter(Boolean) as HTMLElement[];
      if (focusables.length < 2) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setOpen(false);
      // Wait a frame so the open-effect restarts Lenis (the drawer stopped it)
      // before scrolling — otherwise scrollTo fires while Lenis is paused.
      requestAnimationFrame(() => {
        lenisStore.current?.start();
        if (!scrollToHash(href)) {
          document.querySelector(href)?.scrollIntoView();
        }
      });
    } else {
      setOpen(false);
    }
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/80 to-transparent" aria-hidden />

      <div className="relative flex items-center justify-between px-5 py-4 md:px-8 md:py-6">
        <a
          href="#hero"
          onClick={(e) => go(e, '#hero')}
          aria-label={c.nav.toAria}
          data-cursor="link"
          className="pointer-events-auto relative z-50 block text-cream transition-opacity duration-200 hover:opacity-70"
        >
          <Logo className="h-6 w-auto md:h-7" />
        </a>

        {/* Right cluster: language toggle (always visible), desktop links, mobile toggle */}
        <div className="flex items-center gap-2 md:gap-3">
          <LangToggle />

          {/* Desktop links */}
          <nav
            aria-label={c.nav.primary}
            className="pointer-events-auto hidden items-center gap-1 border border-line/80 bg-ink/50 px-2 py-1 backdrop-blur-xl md:flex"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => go(e, link.href)}
                data-cursor="link"
                className="inline-flex min-h-[40px] items-center px-4 py-2 font-body text-sm text-cream transition-colors duration-200 hover:bg-surface hover:text-accent focus-visible:bg-surface focus-visible:text-accent"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile toggle (44px target) */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            data-cursor="link"
            className="pointer-events-auto relative z-50 flex h-11 w-11 items-center justify-center border border-line bg-ink/50 text-cream backdrop-blur md:hidden"
          >
            <span className="sr-only">{open ? c.nav.close : c.nav.open}</span>
          <span className="relative block h-3 w-6" aria-hidden>
            <span
              className={`absolute left-0 top-0 h-px w-full bg-current transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? 'top-1.5 rotate-45' : ''
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-full bg-current transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? 'bottom-1.5 -rotate-45' : ''
              }`}
            />
          </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer (modal) */}
      <div
        id="mobile-menu"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={c.nav.primary}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-ink/95 px-6 pb-10 pt-28 backdrop-blur-sm transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav aria-label={c.nav.mobile} className="flex flex-col">
          {LINKS.map((link, i) => (
            <a
              key={link.href}
              ref={i === 0 ? firstLinkRef : undefined}
              href={link.href}
              onClick={(e) => go(e, link.href)}
              className="flex items-center justify-between border-b border-line py-5 font-display text-3xl font-normal tracking-tight text-cream transition-colors duration-200 hover:text-accent focus-visible:text-accent"
            >
              {link.label}
              <span className="kicker text-muted">{String(i + 1).padStart(2, '0')}</span>
            </a>
          ))}
        </nav>
        <span className="kicker mt-auto pt-10 text-muted">
          <span className="font-serif">JAMAL</span> — {c.nav.tagline}
        </span>
      </div>
    </header>
  );
}
