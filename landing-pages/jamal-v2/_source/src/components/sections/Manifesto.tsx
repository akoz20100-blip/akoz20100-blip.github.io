import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { MEDIA } from '../../lib/motion';
import { asset } from '../../lib/asset';
import { useContent } from '../../lib/content';
import { useLang } from '../../lib/i18n';

gsap.registerPlugin(ScrollTrigger);

/**
 * MANIFESTO — the editorial statement. The large line splits into words that
 * rise and fade as the section enters (split-type + ScrollTrigger). Reduced
 * motion shows the full statement immediately.
 */
export default function Manifesto() {
  const root = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const c = useContent();
  const lang = useLang();

  useLayoutEffect(() => {
    const root_ = root.current;
    const statement = statementRef.current;
    if (!root_ || !statement) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(MEDIA.motionOk, () => {
        const split = new SplitType(statement, { types: 'words', tagName: 'span' });

        gsap.set(split.words, { yPercent: 110, autoAlpha: 0 });
        gsap.to(split.words, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.025,
          scrollTrigger: { trigger: statement, start: 'top 85%' },
        });

        gsap.from('[data-reveal-soft]', {
          y: 30,
          autoAlpha: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: root_, start: 'top 65%' },
        });

        return () => split.revert();
      });
    }, root_);

    return () => ctx.revert();
    // Re-split + re-reveal when the language (and therefore the statement) changes.
  }, [lang]);

  return (
    <section
      id="atelier"
      ref={root}
      aria-labelledby="manifesto-heading"
      className="section-frame relative px-6 py-[var(--section-y)] md:px-10"
    >
      <div className="num-ltr pointer-events-none absolute right-[var(--gutter)] top-20 hidden font-display text-[18vw] leading-none text-surface/60 md:block">
        01
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.55fr_1.45fr] md:gap-16">
        <div className="flex flex-col justify-between gap-10">
          <div className="flex items-center gap-4 md:flex-col md:items-start">
            <span className="kicker" data-reveal-soft>
              {c.manifesto.index}
            </span>
            <span className="h-px flex-1 bg-line md:h-24 md:w-px md:flex-none" data-reveal-soft />
          </div>
          <p className="hidden max-w-[18rem] text-sm leading-relaxed text-muted md:block" data-reveal-soft>
            {c.manifesto.brief}
          </p>
        </div>

        <div>
          <h2
            id="manifesto-heading"
            ref={statementRef}
            className="font-display text-[var(--text-h1)] font-normal leading-[0.96] tracking-tight text-cream"
          >
            {c.manifesto.statementPre}
            <span className="text-accent">{c.manifesto.statementAccent}</span>
            {c.manifesto.statementPost}
          </h2>

          <div className="mt-12 grid gap-6 border-t border-line pt-8 md:grid-cols-[0.58fr_1fr] md:gap-12">
            <p className="kicker text-muted md:hidden" data-reveal-soft>
              {c.manifesto.brief}
            </p>
            <figure className="luxury-panel hidden overflow-hidden md:block" data-reveal-soft>
              <img
                src={asset('/assets/detail-01.webp')}
                alt="Close detail of garment-washed linen weave"
                width={1100}
                height={1375}
                loading="lazy"
                decoding="async"
                className="image-shell h-36 w-full object-cover object-center"
              />
              <figcaption className="kicker px-4 py-3 text-muted">
                {c.manifesto.figCaption}
              </figcaption>
            </figure>
            <p
              className="measure text-[var(--text-lead)] leading-relaxed text-muted"
              data-reveal-soft
            >
              {c.manifesto.lead}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
