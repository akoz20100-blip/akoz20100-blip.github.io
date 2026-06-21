# PROGRESS — durable build memory

Update after EVERY iteration. This file is the source of truth that survives
`/compact`. Before compacting context, write your full current state here first.

## Status: LIVE on GitHub Pages — re-themed to the REAL oxblood/burgundy brand identity

### Brand re-theme (2026-06-22, from the official brand image the user supplied)
Real identity = deep wine linen + cream serif wordmark (NOT the old gold placeholder).
Instagram: instagram.com/jamal.atelier. New palette (mirrored in `src/index.css` :root +
`tailwind.config.js`; verified zero old colors leak into the built CSS):
`--ink #1a0b10` · `--surface #2a1620` · `--line #422835` · `--cream #f3ece5` ·
`--muted #a98a90` (dusty mauve) · `--accent #c97f86` (antique rose, single accent,
light enough for kicker text) · `--accent-soft #dda3a8` · `--wine #4a1f2a`.
Also: faint fixed oxblood body wash + wine hero-vignette glow; wordmark now cream
(Nav + Footer); favicon → burgundy field + cream "J"; theme-color #1A0B10. DESIGN_TOKENS.md
updated. Hero verified visually (rose accents + burgundy frame); deeper sections verified
via clean built CSS (Tailwind config changes need a dev-server restart to show in preview).

## Status: LIVE on GitHub Pages (akoz20100-blip.github.io/landing-pages/jamal/) — gallery black-fix shipped

### Desktop gallery black-fix (user-reported on live site)
User saw black around the desktop gallery images. Three compounding causes, all fixed:
1. The clip-path curtain reveal turned figures pure black until revealed (worsened by
   scrub:1 lag) → REMOVED. Images now always visible with a subtle always-on horizontal
   parallax (Studio-Freight/duyucare feel), baseline scale 1.16 so the shift shows no gap.
2. `loading="lazy"` gallery images rendered as the near-black `--surface #111` until loaded
   → switched to `loading="eager"` (all 7 share one vertical band; bounded cost).
3. Figures `md:h-[72vh]` left a big vertical letterbox → enlarged to `md:h-[84vh]`
   (intro/outro panels too).
Note: the headless Claude_Preview can't visually verify the pinned+scrubbed gallery
(frozen rAF during pin; screenshots only paint at scrollY 0; raster doesn't composite
under the `#root` transform trick). Verified instead via DOM state: imgs load (eager,
naturalWidth>0), `opacity:1`/visible, `elementFromPoint` hits the IMG, no clip, parallax
bounded ±26px. Real-hardware confirmation is the user's.

## Status: COMPLETE — DoD 100% + final elevation audit GO (zero CRITICAL/HIGH), all MEDIUMs remediated

### Elevation pass (to match/exceed duyucare reference)
Reference duyucare.dops.agency analysed from source: scroll-scrubbed `<video>` hero
(currentTime + GSAP ScrollTrigger scrub), Lenis, Swiper gallery, counter preloader,
LIGHT theme — confirms JAMAL's dark identity is correct (borrow technique, not layout).
Installed skill `awwwards-animations` (global) for GSAP/Lenis motion patterns.

Added (GSAP/Lenis only, reduced-motion + touch safe):
- `CustomCursor.tsx` — lagging ring + snappy dot, difference blend, grows over
  links/buttons (ring scale 1.8 / labelled 2.8), "view" label over gallery; gated to
  (pointer:fine)+no-reduced-motion; sets `body.cursor-custom{cursor:none}`. Label written
  imperatively (textContent + classList) → zero React re-render on hover.
- `Magnetic.tsx` — wraps CTAs; quickTo pull (strength 0.25, power3.out) toward cursor;
  no-op on touch/reduce; `will-change` set imperatively only while the branch is live.
- `Marquee.tsx` — velocity-reactive infinite band (ScrollTrigger.getVelocity) between
  Showcase and Details; `aria-hidden` on the track wrapper; static under reduced motion.
- Nav rewritten as accessible modal drawer: role=dialog/aria-modal, focus trap
  (toggle↔links), focus restore to toggle, `inert` when closed, Escape close, scroll lock.
- Anchor nav unified via `lenisStore.scrollToHash` (offset-aware) in Nav + Footer +
  Showcase/Gallery CTAs; native fallback via CSS scroll-margin-top.

### Clip-path curtain reveals (the duyucare differentiator — varies the reveal grammar)
- **Gallery figures**: clip-path `inset(bottom)` + Ken-Burns scale (1.12→1) driven
  DETERMINISTICALLY off the pin scrub's `onUpdate` as a pure function of progress
  (per-figure left-edge vs viewport band 0.92vw→0.6vw). NOT per-element containerAnimation
  triggers — those don't fire on instant jumps and risk stranding a figure closed. The
  onUpdate model can't strand (all figures verified `inset(0%)` at progress 1) and behaves
  identically on smooth scroll + jumps. Verified across p0/0.25/0.5/0.75/1.
- **Showcase product image**: clip-path curtain + scale 1.1 on a vertical trigger
  (`top 78%`), a different reveal grammar from the copy's rise+fade. Verified open+restore.

Audits run: (1) full 7-dim → 17 findings, ALL fixed. (2) fix-verify → 17/17 resolved,
flagged 3 new nav regressions (focus mgmt HIGH, first-tap MED, CTA anchors MED) — ALL fixed.
(3) final elevation audit → **GO, 0 blockers**; 3 nav fixes confirmed resolved. Its 6 MEDIUMs
ALL remediated this pass: gallery "drag"→"view"/"Scroll to explore" honesty; clip-path reveals
(gallery+showcase); cursor scale 2.3/3.6→1.8/2.8 + magnetic 0.4→0.25 power3.out; `cursor:none`
input/textarea caret exception; cursor `will-change` scoped to `body.cursor-custom`; marquee
`aria-hidden` moved to track. Build clean: JS 109.9KB gzip, CSS 6.17KB gzip; console clean.

## Status: COMPLETE — all 10 Definition-of-Done checks pass

Brand realized from the supplied assets: **JAMAL — Linen Atelier** (quiet-luxury
linen menswear). Dark identity per DESIGN_TOKENS with the brand **gold accent
`#C09A62`** (from `LOGO.svg`) replacing the scaffold's placeholder red. Hero 360
= the supplied `video hero.mp4` (a clean 360° rotation of the linen set on a dark
studio backdrop) re-encoded with dense keyframes.

## Definition of Done (from AGENTS.md)
- [x] 1. `npm install` + `npm run build`: zero errors, zero TS errors
- [x] 2. `npm run dev`: zero console errors/warnings (only Vite/React-DevTools info)
- [x] 3. All sections present, in order (Preloader, Hero/360, Manifesto, Showcase, **Details**, Gallery, Footer)
- [x] 4. Hero garment rotates smoothly on scroll; pins 0→+300%; scroll→currentTime verified (scroll 1350 → videoTime 5.02 = 50%)
- [x] 5. Lenis active (`isStopped:false`); pins for hero/showcase/gallery; scrub in sync
- [x] 6. Dark identity matches DESIGN_TOKENS; gold accent via `--accent`; every link/button has hover (`.link-underline`, `.btn`)
- [x] 7. Responsive 390 / 768 / 1440; horizontal overflow = 0 at all three
- [x] 8. prefers-reduced-motion respected (gsap.matchMedia static branches; preloader instant; verified via `?flat`)
- [x] 9. No leftover TODO placeholders (grep clean; all real JAMAL copy)
- [x] 10. Images lazy-loaded (`loading="lazy"` + explicit width/height) → no CLS; hero poster preloaded

## Quality target (reference feel)
- [x] Dark identity (pcg.sa vibe) — near-black + single gold accent, heavy preloader
- [x] 360 scroll rotation (duyucare vibe) — pinned scroll-scrubbed video, magazine-cover overlay
- [x] Buttery Lenis smooth-scroll (freshman.tv vibe) — Lenis↔ScrollTrigger sync intact
- [x] Horizontal gallery (oddritual vibe) — pinned horizontal lookbook, hover-scale, native-swipe fallback

## Architecture / key files
- `src/lib/smoothScroll.ts` — Lenis↔ScrollTrigger sync (UNCHANGED logic; added only ticker-callback cleanup on destroy to stop StrictMode/HMR rAF leaks).
- `src/lib/motion.ts` — EASE/MEDIA constants + `prefersReducedMotion()`.
- `src/lib/flags.ts` + `main.tsx` — `?flat` QA flag forces the reduced-motion path + native scroll (inert without the param; used for static screenshots).
- `src/components/Logo.tsx` — inline SVG JAMAL serif wordmark (gold).
- `src/components/ScrollVideo.tsx` — pinned 360; portrait plate object-contain + `.hero-plate` edge-feather mask + vignette; reduced-motion = static poster; `onProgress` drives hero overlay fade.
- Sections: `Hero`, `Manifesto` (split-type words), `Showcase` (pinned image col, `motion-safe:` tall copy), `Details` (full-bleed parallax band + craft notes), `Gallery` (horizontal pin / native-swipe fallback), `Footer`.
- Every section wraps GSAP in `gsap.context()` + `gsap.matchMedia()` (motionOk vs motionReduce) and reverts on unmount.

## Assets (in public/assets/, all from `../photo and vidue/`)
- `model-360.mp4` (3.3MB, -g6 dense keyframes, +faststart) + `model-360-poster.jpg`
- `product-front/shirt/back.webp`, `detail-01/02.webp`, `editorial-01/02.webp`, `gallery/01–06.webp`, `og_image.jpg`, `/favicon.svg`
- Excluded off-brand plaid shots (IMG_0600/0601).

## Notes
- Preview screenshots only render at scrollY=0 AND when the tab is foregrounded; rAF is throttled while the preview tab is hidden (background-tab behavior — not a code bug). Verified motion mode by foregrounding via screenshot; verified all static layouts via `?flat` + a `#root` translateY screenshot trick.
- Bundle: CSS 5.24KB gzip (budget 30KB ✓). JS 107KB gzip = GSAP+React+Lenis floor (locked tech).

## Next up
- Done. Optional future: real product/checkout, more lookbook frames, sequence-canvas fallback if iOS scrub stutters.
