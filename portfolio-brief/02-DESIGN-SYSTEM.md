---
version: 1.1.0
name: Digitize Ventures VC Template (bilingual — AR via Thmanyah)
description: Sophisticated investment-grade aesthetic — blur-heavy glassmorphism, italic serif display headings, strict monochrome. Bilingual AR/EN; Arabic uses خط ثمانية (Thmanyah), sourced from thmanyah.com exactly like the `eddah` & `jamal-v2` projects.
colors:
  black: "#000000"
  white: "#FFFFFF"
  white-transparent-10: "rgba(255, 255, 255, 0.1)"
  white-transparent-40: "rgba(255, 255, 255, 0.4)"
  white-transparent-60: "rgba(255, 255, 255, 0.6)"
  glass-bg: "rgba(255, 255, 255, 0.01)"
  glass-border: "rgba(255, 255, 255, 0.45)"
  primary: "hsl(0, 0%, 100%)"
  muted: "hsl(213, 35%, 60%)"
typography:
  heading-latin:
    family: "'Instrument Serif', serif"
    weight: "400"
    style: "italic"
    letterSpacing: "-0.05em"
  heading-arabic:                       # خط ثمانية — display
    family: "'Thmanyah Serif Display', serif"
    weight: "400, 500, 700"
    style: "normal"                     # Arabic is NOT italicized
    letterSpacing: "normal"             # do NOT apply -0.05em to Arabic
  body-latin:
    family: "'Barlow', sans-serif"
    weight: "300, 400, 500"
    lineHeight: "1.6"
  body-arabic:                          # خط ثمانية — sans
    family: "'Thmanyah Sans', sans-serif"
    weight: "300, 400, 500"
    lineHeight: "1.7"                    # Arabic benefits from extra leading
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "128px"
rounded:
  none: "0px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
components:
  navbar:
    type: "fixed-floating"
    blur: "12px"
    z-index: "50"
  liquid-card:
    type: "glassmorphic"
    border: "1.4px gradient"
    blur: "4px"
  hero:
    type: "immersive-video"
    height: "1000px"
    overlay: "black/40"
  cta-button:
    type: "rounded-pill"
    transition: "300ms ease"
motion:
  stagger: "0.05s"
  blur-reveal: "10px to 0px"
  y-offset: "40px"
---

> **Note / ملاحظة:** This is the canonical **design system** for the portfolio
> (provided by the owner). It pairs with `01-CONTENT.md` (what the page says).
> The only adaptation made for this repo is the **Arabic typography layer** (خط
> ثمانية / Thmanyah) and the **bilingual + RTL** rules — see §Typography, §Bilingual
> & RTL, and §Build below. Everything else is the original Digitize Ventures spec.

## Overview
The Digitize Ventures visual system is defined by "Liquid Glass"—a combination of deep black backgrounds, extreme edge-blurring, and high-quality video textures. It is designed to convey technical excellence and institutional trust.

## Colors
- **Primary Surface**: Pure black (#000000) used for the base layer to maximize contrast.
- **Accents**: Pure white (#FFFFFF) for text and core CTA elements.
- **Glass Layers**: Low-opacity whites (1% to 10%) with heavy backdrop filters create the depth-of-field effect.
- **Interactive**: Hover states often involve scaling or increasing opacity rather than color shifts.
- **Strictly monochrome** — color comes only from the video/imagery, never from UI accents.

## Typography

### Latin (English mode)
- **Display Serif**: `Instrument Serif`, used **exclusively italic** for headings — editorial feel. Tracking tightened severely to `-0.05em`.
- **Functional Sans**: `Barlow` (300/400/500) for navigation, labels, and body.

### Arabic (Arabic mode) — خط ثمانية / Thmanyah
The Arabic counterpart of the serif/sans pairing, **sourced from `thmanyah.com`** (the same files already used by `eddah` and `jamal-v2` in this repo):
- **Display**: `Thmanyah Serif Display` (400/500/700) — the Arabic equivalent of Instrument Serif for all headings. **Upright, not italic** (Arabic is never synthetically italicized).
- **Functional**: `Thmanyah Sans` (300/400/500) — the Arabic equivalent of Barlow for nav, labels, body.
- **Arabic tracking exception**: do **NOT** apply the `-0.05em` letter-spacing to Arabic — keep `letter-spacing: normal` so cursive joining stays intact. Use `line-height: 1.7` for Arabic body.

### Bilingual font mapping
| Role | English | Arabic |
|---|---|---|
| Headings / display | Instrument Serif *(italic, -0.05em)* | Thmanyah Serif Display *(upright, normal tracking)* |
| Body / UI | Barlow | Thmanyah Sans |

### `@font-face` — self-host خط ثمانية (copy the repo's pattern)
The repo self-hosts the Thmanyah `.woff2` files (originals from thmanyah.com). Copy
`landing-pages/eddah/fonts/thmanyah/*.woff2` (or `jamal-v2/assets/fonts/thmanyah/`)
into the new project at `assets/fonts/thmanyah/`, then declare — mirroring
`landing-pages/jamal-v2/_source/src/index.css`:

```css
/* Thmanyah typeface (Arabic) — same family used on thmanyah.com */
@font-face { font-family:'Thmanyah Sans'; src:url('./assets/fonts/thmanyah/thmanyahsans-Light.woff2')   format('woff2'); font-weight:300; font-style:normal; font-display:swap; }
@font-face { font-family:'Thmanyah Sans'; src:url('./assets/fonts/thmanyah/thmanyahsans-Regular.woff2') format('woff2'); font-weight:400; font-style:normal; font-display:swap; }
@font-face { font-family:'Thmanyah Sans'; src:url('./assets/fonts/thmanyah/thmanyahsans-Medium.woff2')  format('woff2'); font-weight:500; font-style:normal; font-display:swap; }
@font-face { font-family:'Thmanyah Sans'; src:url('./assets/fonts/thmanyah/thmanyahsans-Bold.woff2')    format('woff2'); font-weight:600 700; font-style:normal; font-display:swap; }
@font-face { font-family:'Thmanyah Serif Display'; src:url('./assets/fonts/thmanyah/thmanyahserifdisplay-Regular.woff2') format('woff2'); font-weight:400; font-style:normal; font-display:swap; }
@font-face { font-family:'Thmanyah Serif Display'; src:url('./assets/fonts/thmanyah/thmanyahserifdisplay-Medium.woff2')  format('woff2'); font-weight:500; font-style:normal; font-display:swap; }
@font-face { font-family:'Thmanyah Serif Display'; src:url('./assets/fonts/thmanyah/thmanyahserifdisplay-Bold.woff2')    format('woff2'); font-weight:600 700; font-style:normal; font-display:swap; }
```
Available weights in the repo's font folder: `Light, Regular, Medium, Bold, Black`
for **both** `thmanyahsans-*` and `thmanyahserifdisplay-*`.

Latin faces load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet">
```

## Spacing
A generous 8pt grid system. Section padding is aggressive (128px+) to allow the video backgrounds and glass elements to breathe.

## Layout
- **Depth Stacks**: Video (Background) → Gradient Fades (Midground) → Content/Liquid Glass (Foreground).
- **Asymmetry**: Uses a "Chess" pattern (alternating left/right alignment) in feature sections to maintain visual interest. *(Mirrors automatically in RTL.)*
- **Fixed Elements**: Navigation is fixed with a 16px top offset to create a floating appearance.

## Elevation & Depth
- **Backdrop Blur**: 4px (standard liquid-glass) up to 50px (liquid-glass-strong).
- **Inner Glow**: Buttons and cards use a 1.4px white gradient border to simulate light catching the edge of the glass.
- **Gradients**: Top and bottom black-to-transparent masks isolate content sections against continuous video backgrounds.

## Shapes
- **Pills**: All primary buttons and small status badges use `rounded-full` (9999px).
- **Soft Rectangles**: Content cards and feature images use `2xl` (16px) or `3xl` rounding.

## Components
- **Floating Navbar**: A composite pill-shaped bar with separate logo and link modules. *(Add the AR/EN language toggle here.)*
- **Video Hero**: Full-bleed background video with a blur-reveal text entry.
- **Stats Bar**: A centered glass panel featuring large italic (EN) / display (AR) numbers.
- **Pillar Cards**: Vertical layouts with iconify-icons in strong glass circles. *(Use for the 6 services.)*
- **Application / Process Steps**: Sequential glass cards with tracking numbers (01, 02, …).
- **Liquid-glass project cards**: Use for the portfolio gallery (image + title + 1-line desc).

## Motion
- **Blur Reveal**: Text transitions from 10px blur + 40px Y-offset to sharp focus.
- **Springs**: High-stiffness, moderate-damping spring physics for snappy transitions.
- **Video Playback**: HLS streaming for immediate texture without long loads.
- Respect `prefers-reduced-motion: reduce`.

## Bilingual & RTL — ثنائية اللغة والاتجاه
- Default locale **Arabic / RTL**; toggle swaps `<html lang dir>` (`ar`/`rtl` ↔ `en`/`ltr`), copy, **and the font stack** (Thmanyah ↔ Instrument/Barlow), persisted in `localStorage` — same mechanism as `jamal-v2` (`LangToggle`).
- Locale CSS hook (mirrors `jamal-v2/_source/src/index.css`):
  ```css
  html[lang='ar'] body { font-family:'Thmanyah Sans', system-ui, sans-serif; line-height:1.7; }
  html[lang='ar'] h1, html[lang='ar'] h2, html[lang='ar'] h3, html[lang='ar'] .font-display {
    font-family:'Thmanyah Serif Display', 'Thmanyah Sans', serif; font-style:normal; letter-spacing:normal;
  }
  ```
- Use logical properties (`margin-inline`, `inset-inline-start`) so the "Chess" asymmetry, floating navbar, and gradients mirror automatically. Flip directional icons with `dir`.

## Do's and Don'ts
- **Do**: Use *italic* Instrument Serif for Latin headings; **upright** Thmanyah Serif Display for Arabic headings.
- **Do**: Apply `backdrop-blur` to all overlapping UI elements.
- **Do**: Self-host خط ثمانية from the originals (thmanyah.com / the repo's existing files).
- **Don't**: Apply negative `letter-spacing` to Arabic text.
- **Don't**: Use solid borders; always use the transparent mask border-padding trick for liquid glass.
- **Don't**: Introduce accent colors (blue/green/gold); keep the palette strictly monochrome — color comes from the video/imagery only.

## Accessibility
- **Contrast**: White on black/dark-video, high contrast throughout.
- **Motion**: `whileInView` with `-100px` margin; honor reduced-motion.
- **Readability**: Body weights 300/400, minimum 14px. Arabic body min 15px + line-height 1.7 for comfortable reading.

## Build & deployment (this repo) — البناء والنشر
- Project lives in `landing-pages/{{slug}}/`; served from a sub-path, so use **relative
  asset paths** (Vite `base:'./'`). Copy Thmanyah `.woff2` into `assets/fonts/thmanyah/`.
- Provide a hero **video** (HLS/MP4) and a poster image; the owner will supply imagery ("الصور كامل بعدين").
- Per `CLAUDE.md`, delivery isn't done until a **card for this page is added to the root `index.html` gallery**.
