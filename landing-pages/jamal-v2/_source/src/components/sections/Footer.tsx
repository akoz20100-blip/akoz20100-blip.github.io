import type { MouseEvent } from 'react';
import Logo from '../Logo';
import { scrollToHash } from '../../lib/lenisStore';
import { useContent } from '../../lib/content';

/**
 * FOOTER — the big contact line, the brand mark, and links. Dark, minimal.
 * Headline + email reveal on enter via the global [data-reveal] hook.
 */
export default function Footer() {
  const c = useContent();
  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (scrollToHash(href)) e.preventDefault();
  };

  return (
    <footer id="contact" className="section-frame relative border-t border-line bg-ink px-6 pb-10 pt-24 md:px-10 md:pt-32">
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex items-center gap-4" data-reveal>
          <span className="kicker">{c.footer.index}</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <h2
          data-reveal
          className="mt-8 max-w-[8ch] font-display text-[var(--text-hero)] font-normal leading-[0.78] tracking-tight text-cream"
        >
          {c.footer.title}
          <span className="text-accent">{c.footer.titleAccent}</span>
        </h2>

        <a
          href={`mailto:${c.footer.email}`}
          data-reveal
          dir="ltr"
          className="link-underline num-ltr mt-8 inline-block font-display text-[var(--text-h2)] font-normal tracking-tight rtl:self-end"
        >
          {c.footer.email}
        </a>

        <div className="mt-20 grid gap-12 border-t border-line pt-12 sm:grid-cols-2 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {c.footer.about}
            </p>
            <p className="kicker mt-6 text-muted">{c.footer.place}</p>
          </div>

          {c.footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="kicker text-muted">{col.title}</p>
              <ul className="mt-2 flex flex-col">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => go(e, link.href)}
                      className="link-underline inline-flex min-h-[44px] items-center text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-8 border-t border-line pt-10 md:flex-row md:items-end">
          <Logo withTagline className="h-20 w-auto text-cream md:h-24" />
          <div className="flex flex-col items-start md:items-end">
            <a
              href="#hero"
              onClick={(e) => go(e, '#hero')}
              className="link-underline inline-flex min-h-[44px] items-center text-xs text-muted"
            >
              {c.footer.backToTop}
            </a>
            <p className="mt-2 text-xs text-muted">
              {c.footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
