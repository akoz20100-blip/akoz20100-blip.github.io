# Handoff — Atheer Al-Zahrani landing page (continue in a new session)

## What this is
A bilingual (Arabic default/RTL, English/LTR) portfolio landing page for **أثير الزهراني** —
an AI creative designer (video, AI imagery, pro photo enhancement, logo/identity,
interior design, content/marketing). Audience: local & Gulf businesses. Primary CTA: WhatsApp.

## Repo / branch
- Repo: `akoz20100-blip/Landing-page-` (only repo in scope).
- Work branch: `claude/portfolio-landing-page-planning-4e8fbi`. Open **draft PR #3**.
- Page lives in: `landing-pages/atheer/`.

## Design identity (APPROVED — matches the owner's "Codex" design)
- **DARK theme** `#0e0b0e` with **rose/gold** accents (`--rose:#ef8ab0`, `--rose-deep:#e2638f`, `--gold:#f3c98a`, `--peach:#ffb89b`). Color comes from the **hero video** + **pink-floral imagery**, not the background.
- Font = **خط ثمانية / Thmanyah** (`Thmanyah Serif Display` for headings, `Thmanyah Sans` for body), embedded from the repo's eddah `.woff2` files. Latin = Instrument Serif + Barlow. **Keep Thmanyah — do not change.**
- Glassmorphism, soft motion: tilt, scroll-reveal (blur), count-up, marquee, CTA sheen, hero idea→WhatsApp input, mobile hamburger menu, AR/EN toggle. Respect `prefers-reduced-motion`.
- Copy (already in the page, keep): hero «تصميمٌ بصري يوقف التمرير من أول ثانية»; stats ٦٠+ / ٥ / ٢٤·٧ / ١٠٠٪; «الذكاء الاصطناعي بدون ذوق… مجرد ضجيج»; «كل ما تحتاجه علامتك لتظهر باحتراف»; «الصورة العادية… تصير مادة بيع»; «اتجاهات بصرية جاهزة لحملات حقيقية»; «حركة سهلة، هدف واضح، نتيجة قابلة للاستخدام»; CTA «خلّينا نطلّع مشروعك بشكل يليق فيه».

## Files
- `landing-pages/atheer/index.html` — **self-contained** build (base64 fonts + video). Renders anywhere/offline. ~2.2MB.
- `landing-pages/atheer/index.source.html` — clean build (external font URLs + `assets/hero.mp4`). ~37KB.
- `landing-pages/atheer/assets/hero.mp4` — the owner's hero video (pink/floral). Used as hero background.
- `landing-pages/atheer/_source/template.html` — **edit this** (tokenized: `__F_*__` fonts, `__VIDEO__`).
- `landing-pages/atheer/_source/build.js` — run `node landing-pages/atheer/_source/build.js` to regenerate both index files from the template.
- Older spec (now superseded by this pink-floral Codex identity): `portfolio-brief/ATHEER-MASTER-BRIEF.md`.

## ⚠️ Still needed / TODO (priority order)
1. **The 5 pink-floral images** the owner shared are NOT on disk (they were pasted inline in chat, only the video was saved as a file). **Ask the owner to re-upload the 5 images as FILE attachments**, then place them: `#about` `.media`, `#enhance` `.media` (before/after), and the six `#work` `.gal .tile`s. In `_source/template.html` add `<img>` into `.media`/`.tile` (replace the gradient `.bgp`/`.bg` placeholders), add `__IMG_*__` tokens, and extend `build.js` to embed them (base64 for index.html, `assets/img/...` for source). Pattern for embedding is already in build.js (see the old image-handling commits).
2. **Real WhatsApp number**: replace `9665XXXXXXXX` everywhere (hero idea form JS + CTA link).
3. Confirm **name/bio/stats** with the owner (currently ٦٠+ projects etc. are reasonable placeholders).
4. **Live link for mobile testing**: Vercel needs the owner's auth (no CLI/token in the sandbox — `deploy_to_vercel` only prints CLI instructions). Options: (a) owner runs `vercel deploy` from repo root (a `vercel.json` already serves the atheer page at `/`), or (b) merge PR #3 to `main` → GitHub Pages serves it at `https://akoz20100-blip.github.io/Landing-page-/landing-pages/atheer/` (ASK before merging — it publishes to main).
5. Per repo `CLAUDE.md`: when finalized, **add a card for this page to the root `index.html` gallery**.

## Important notes for the next session
- **The bundled ffmpeg AND headless Chromium here cannot decode the H.264 video** — you can't preview the video or extract frames in-sandbox. It is a valid MP4 and **plays fine on real phones/browsers**. Don't waste time trying to render it; verify layout with the gradient fallback and trust the video on-device.
- Verify screenshots at **window width ≥ 500px** — headless floors the layout viewport at 500px, so a 390px canvas crops the right side (false "overflow"). The page itself has no overflow (checked: scrollWidth == clientWidth).
- To see settled visuals in a screenshot, inject an override: `.reveal{opacity:1!important;transform:none!important;filter:none!important}` and `.hero h1 .w{opacity:1!important;transform:none!important}` (reveal/word animations don't fire under headless without scroll).
- Bilingual: every text node uses `data-ar`/`data-en`; the H1 uses `::word::` to mark the gradient-highlighted word. Count-up is locale-aware (Arabic-Indic digits + `٪`/`%`). Don't re-introduce the bugs already fixed (H1 wiping on toggle, count double-fire).
- Commit to the work branch and push with `-u origin <branch>`; keep PR #3 updated.
