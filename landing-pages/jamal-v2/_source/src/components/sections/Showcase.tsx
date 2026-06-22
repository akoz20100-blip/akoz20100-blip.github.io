import { useLayoutEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToHash } from '../../lib/lenisStore';
import { asset } from '../../lib/asset';
import { useContent } from '../../lib/content';
import Magnetic from '../Magnetic';

gsap.registerPlugin(ScrollTrigger);

function onAnchorClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  if (scrollToHash(href)) e.preventDefault();
}

/**
 * SHOWCASE — the single product. On desktop the image column pins while the copy
 * scrolls past it (pinSpacing:false), and a small detail plate parallaxes for
 * depth. On mobile it stacks with simple reveals. Reduced motion → static.
 */
export default function Showcase() {
  const root = useRef<HTMLDivElement>(null);
  const imageCol = useRef<HTMLDivElement>(null);
  const detail = useRef<HTMLImageElement>(null);
  const c = useContent();

  useLayoutEffect(() => {
    const section = root.current;
    const col = imageCol.current;
    if (!section || !col) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        { isDesktop: '(min-width: 768px)', reduce: '(prefers-reduced-motion: reduce)' },
        (self) => {
          const { isDesktop, reduce } = self.conditions as {
            isDesktop: boolean;
            reduce: boolean;
          };

          // The image column holds via CSS `position: sticky` (see markup) — far
          // more robust than a GSAP pin with pinSpacing:false, which reserved no
          // space and let earlier pinned sections bleed through this section's
          // transparent column. Here we only add the detail-plate parallax.
          if (isDesktop && !reduce && detail.current) {
            gsap.fromTo(
              detail.current,
              { yPercent: 12 },
              {
                yPercent: -12,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1,
                },
              },
            );
          }

          if (reduce) {
            gsap.set('[data-show]', { autoAlpha: 1, y: 0 });
          } else {
            // Product plates rise in sequence while staying on compositor-friendly
            // transform/opacity for the scroll choreography.
            gsap.from('.showcase-layer', {
              yPercent: 10,
              autoAlpha: 0,
              scale: 1.04,
              duration: 1.3,
              ease: 'power4.out',
              stagger: 0.12,
              scrollTrigger: { trigger: section, start: 'top 78%' },
            });

            gsap.from('[data-show]', {
              y: 36,
              autoAlpha: 0,
              duration: 1,
              ease: 'power3.out',
              stagger: 0.1,
              scrollTrigger: { trigger: '.showcase-copy', start: 'top 75%' },
            });
          }
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="collection"
      ref={root}
      className="section-frame relative grid bg-ink md:grid-cols-[1.08fr_0.92fr]"
    >
      {/* Pinned image column */}
      <div ref={imageCol} className="relative h-[76vh] bg-surface md:sticky md:top-0 md:h-screen md:self-start">
        <div className="relative h-full w-full overflow-hidden px-6 py-16 md:px-10 md:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,127,134,0.18),transparent_42%)]" />
          <div className="showcase-layer image-shell absolute left-4 top-[18%] hidden aspect-[4/5] w-[36%] border border-line/70 md:block lg:left-8">
            <img
              src={asset('/assets/product-back.webp')}
              alt="The Atelier Set — back view"
              width={1122}
              height={1402}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center opacity-80"
            />
          </div>
          <div className="showcase-layer image-shell relative z-[1] mx-auto h-full max-h-[82vh] w-full max-w-[34rem] border border-line/70">
          <img
            src={asset('/assets/product-front.webp')}
            alt="The Atelier Set — grandad-collar linen shirt with relaxed trouser, front view"
            width={1122}
            height={1402}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center"
          />
          </div>
          <div className="hero-vignette pointer-events-none absolute inset-0 opacity-70" />
        </div>

        {/* Overlapping detail plate for depth */}
        <img
          ref={detail}
          src={asset('/assets/detail-01.webp')}
          alt="Close detail — buttoning the linen shirt"
          width={1100}
          height={1338}
          loading="lazy"
          decoding="async"
          className="showcase-layer absolute bottom-8 right-6 z-[2] hidden h-44 w-32 border border-line object-cover shadow-2xl shadow-black/60 md:block lg:h-56 lg:w-40"
        />

        <span className="kicker absolute left-6 top-6 z-[3] [text-shadow:0_1px_10px_rgba(26,11,16,0.7)] md:left-10 md:top-10">
          {c.showcase.piece}
        </span>
      </div>

      {/* Scrolling copy column — taller than the viewport so the pinned image
          column has real travel to scroll past on desktop. */}
      <div className="showcase-copy flex flex-col justify-center gap-8 px-6 py-24 md:min-h-[135vh] md:px-12 md:py-40 lg:px-16">
        <div className="flex items-center gap-4" data-show>
          <span className="kicker">{c.showcase.index}</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <h2
          data-show
          className="max-w-[7ch] font-display text-[var(--text-h1)] font-normal leading-[0.86] tracking-tight text-cream"
        >
          {c.showcase.title}
        </h2>

        <p data-show className="measure text-[var(--text-lead)] leading-relaxed text-muted">
          {c.showcase.lead}
        </p>

        <dl
          data-show
          className="grid max-w-xl grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2"
        >
          {c.showcase.specs.map((spec) => (
            <div key={spec.label} className="bg-ink/95 px-5 py-5">
              <dt className="kicker text-muted">{spec.label}</dt>
              <dd className="mt-1.5 text-sm text-cream">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div data-show className="flex flex-wrap items-center gap-6 pt-2">
          <span className="num-ltr font-display text-2xl text-accent">{c.showcase.price}</span>
          <Magnetic>
            <a
              href="#contact"
              onClick={(e) => onAnchorClick(e, '#contact')}
              data-cursor="link"
              className="btn"
            >
              {c.showcase.enquire}
              <span className="btn__arrow" aria-hidden>
                {'→'}
              </span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
