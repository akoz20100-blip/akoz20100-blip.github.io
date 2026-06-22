import { useEffect, useRef, useState } from 'react';
import type Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll } from './lib/smoothScroll';
import { IS_FLAT } from './lib/flags';
import { lenisStore } from './lib/lenisStore';
import { prefersReducedMotion } from './lib/motion';
import { useReveal } from './hooks/useReveal';
import { useLang } from './lib/i18n';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import Nav from './components/Nav';
import Hero from './components/sections/Hero';
import Manifesto from './components/sections/Manifesto';
import Showcase from './components/sections/Showcase';
import Marquee from './components/Marquee';
import Details from './components/sections/Details';
import Gallery from './components/sections/Gallery';
import Footer from './components/sections/Footer';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const scope = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lang = useLang();

  // Drive <html lang/dir> from the language store, and recalc all pin geometry
  // once the new (RTL/Arabic) layout settles — section heights + the gallery
  // track width can change with the script.
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    );
    return () => cancelAnimationFrame(raf);
  }, [lang]);

  // Boot the smooth-scroll backbone once. Hold scroll while the preloader runs.
  // Skip it for reduced-motion (WCAG 2.3.3 — no animated scroll interpolation)
  // and for the ?flat QA path so headless screenshots use native scroll.
  useEffect(() => {
    if (IS_FLAT || prefersReducedMotion()) return;
    const lenis = initSmoothScroll();
    lenisRef.current = lenis;
    lenisStore.current = lenis;
    lenis.stop();
    return () => {
      lenis.destroy();
      lenisRef.current = null;
      lenisStore.current = null;
    };
  }, []);

  // Release scroll, recalc pins, and move focus past the curtain once the
  // preloader finishes and fonts/images settle.
  useEffect(() => {
    if (!loaded) return;
    const lenis = lenisRef.current;
    lenis?.start();
    lenis?.scrollTo(0, { immediate: true });
    document.getElementById('hero-heading')?.focus({ preventScroll: true });
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    );
    return () => cancelAnimationFrame(raf);
  }, [loaded]);

  // Once every image/video has finished loading, recalc all pin geometry — late
  // asset loads (hero clip, eager gallery frames) can change section heights and
  // would otherwise leave pinned sections measured against a stale layout.
  useEffect(() => {
    if (document.readyState === 'complete') return;
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useReveal(scope);

  return (
    <div ref={scope} className="relative overflow-hidden">
      {/* WCAG 2.4.1 — bypass the fixed nav / hero straight to the content. */}
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[200] focus-visible:bg-ink focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:tracking-wide focus-visible:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rtl:focus-visible:left-auto rtl:focus-visible:right-4"
      >
        {lang === 'ar' ? 'تخطٍّ إلى المحتوى' : 'Skip to content'}
      </a>
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <div
        className="pointer-events-none fixed inset-y-0 left-[var(--gutter)] z-40 hidden w-px bg-line/70 md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-y-0 right-[var(--gutter)] z-40 hidden w-px bg-line/35 md:block"
        aria-hidden
      />
      <CustomCursor />
      <Nav />
      <main id="main-content">
        <Hero />
        <Manifesto />
        <Showcase />
        <Marquee />
        <Details />
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}
