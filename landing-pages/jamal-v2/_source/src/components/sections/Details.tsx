import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '../../lib/motion';
import { asset } from '../../lib/asset';
import { useContent } from '../../lib/content';

gsap.registerPlugin(ScrollTrigger);

/**
 * DETAILS — a cinematic full-bleed band (parallax) plus a craft note column.
 * Bridges the product and the gallery; on-brand, transforms only.
 */
export default function Details() {
  const root = useRef<HTMLDivElement>(null);
  const bandImg = useRef<HTMLImageElement>(null);
  const c = useContent();

  useLayoutEffect(() => {
    const section = root.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(MEDIA.motionOk, () => {
        if (bandImg.current) {
          gsap.fromTo(
            bandImg.current,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: '.details-band',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          );
        }

        gsap.from('[data-note]', {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '.details-notes', start: 'top 78%' },
        });
      });

      mm.add(MEDIA.motionReduce, () => {
        gsap.set('[data-note]', { autoAlpha: 1, y: 0 });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="details" ref={root} className="section-frame bg-ink">
      {/* Full-bleed cinematic band with parallax */}
      <figure className="details-band relative h-[72vh] w-full overflow-hidden md:h-[92vh]">
        <img
          ref={bandImg}
          src={asset('/assets/editorial-01.webp')}
          alt="Two men in the JAMAL linen set, seated together in warm light"
          width={2000}
          height={1126}
          loading="lazy"
          decoding="async"
          className="absolute -top-[8%] left-0 h-[116%] w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
        <div className="absolute inset-x-[var(--gutter)] top-10 h-px bg-line/80" aria-hidden />
        <figcaption className="absolute bottom-0 left-0 grid w-full gap-8 p-6 md:grid-cols-[0.6fr_1fr] md:p-10">
          <span className="kicker self-end">{c.details.index}</span>
          <p className="max-w-3xl justify-self-end font-display text-[var(--text-h1)] font-normal leading-[0.9] tracking-tight text-cream md:text-right rtl:md:text-left">
            {c.details.band}
          </p>
        </figcaption>
      </figure>

      {/* Craft notes */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-[var(--section-y)] md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-10">
        <div className="image-shell relative aspect-[3/4] overflow-hidden border border-line bg-surface md:translate-y-12" data-note>
          <img
            src={asset('/assets/detail-02.webp')}
            alt="Close detail — the grandad collar against the skin"
            width={941}
            height={1672}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="details-notes flex flex-col justify-center">
          <span className="kicker" data-note>
            {c.details.kicker}
          </span>
          <h2
            data-note
            className="mt-4 max-w-xl font-display text-[var(--text-h1)] font-normal leading-[0.9] tracking-tight text-cream"
          >
            {c.details.title}
          </h2>
          <ul className="mt-10 grid gap-3">
            {c.details.notes.map((note, i) => (
              <li
                key={note}
                data-note
                className="luxury-panel flex items-baseline gap-5 px-5 py-5 text-cream"
              >
                <span className="num-ltr kicker w-8 shrink-0 text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[var(--text-lead)] leading-snug">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
