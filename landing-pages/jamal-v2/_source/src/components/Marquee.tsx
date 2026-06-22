import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '../lib/motion';
import { useContent } from '../lib/content';

gsap.registerPlugin(ScrollTrigger);

/**
 * Editorial running band. Loops infinitely and reacts to scroll velocity —
 * faster and direction-aware as you scroll (the Studio Freight touch).
 * Reduced motion: a single static row.
 */
export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const WORDS = useContent().marquee;

  useLayoutEffect(() => {
    const section = root.current;
    const t = track.current;
    if (!section || !t) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        const loop = gsap.to(t, {
          xPercent: -50,
          ease: 'none',
          duration: 28,
          repeat: -1,
        });
        let direction = 1;

        const st = ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = self.getVelocity();
            if (v !== 0) direction = v < 0 ? -1 : 1;
            const boost = gsap.utils.clamp(0, 5, Math.abs(v) / 350);
            gsap.to(loop, {
              timeScale: direction * (1 + boost),
              duration: 0.4,
              overwrite: true,
              ease: 'power2.out',
            });
          },
        });

        return () => {
          st.kill();
          loop.kill();
          gsap.set(t, { xPercent: 0 });
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Two identical groups → seamless -50% loop.
  const group = (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex shrink-0 items-center">
          <span className="px-[0.4em] font-display text-[var(--text-h1)] font-normal tracking-tight text-cream">
            {w}
          </span>
          <span className="px-[0.4em] text-[clamp(1rem,2vw,2rem)] text-accent">&#9702;</span>
        </span>
      ))}
    </div>
  );

  return (
    <section
      ref={root}
      aria-label="JAMAL — garment-washed linen, made by hand"
      className="overflow-hidden border-y border-line bg-ink py-8 md:py-12"
    >
      <div ref={track} className="marquee-track flex w-max flex-nowrap" aria-hidden>
        {group}
        {group}
      </div>
    </section>
  );
}
