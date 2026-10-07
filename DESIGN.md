# Website Design & Architecture Reference

Single-file site: [index.html](index.html) — inline `<style>`, no build step, no framework yet (CLAUDE.md's Next.js stack is the future rebuild target, not current state). Exceptions, all from the launch campaign (Oct 2026): the consult form's logic lives in one shared script, [assets/consult-form.js](assets/consult-form.js), because the guides embed the same form (see **Consult form and tracking**); [privacy.html](privacy.html) (P3) and the guides under [guides/](guides/) (P5, see **Guides**) are self-contained pages; [llms.txt](llms.txt) is a plain summary for AI tools.

**CSS is mobile-first.** Base styles target phones (~375px); enhancements layer on at `min-width:720px` (tablet), `880px` (full nav appears, sticky mobile CTA hides) and `1024px` (desktop two-column layouts). Add new rules in that order — never reintroduce `max-width` overrides.

## Tokens (CSS vars in `:root`)
Oct 2026 revamp: the palette is built from the logo's one ink, navy **#10273E** (hue 210). Hex values live only in `:root`; everything else (CSS, inline SVG, chart scripts) uses a token, and alpha variants are `color-mix(in srgb, var(--token) N%, transparent)`.
- **Navy (brand):** `--brand` #10273E (the logo's navy: all text via `--ink`, primary buttons, dark sections: dashboard, consult box, Flagship head) · `--brand-deep` #0A1828 (footer; `--scrim` over the video) · `--brand-hover` #1B3753 · `--brand-2` #285F9C (harbour blue: links, selected states, focus on light, chart highlight) · `--brand-3` #5E97D8 (second chart series, projected band) · `--brand-tint` #E0E8F0 (tinted panels, Flagship band).
- **Neutrals (cool fog):** `--bg` #F1F4F7 (page) · `--paper` #FFF (cards, alternate sections) · `--wash` #E4EAF0 (tracks, segmented control) · `--line` #D8E0E8 / `--line-2` #BCC8D4 (decorative rules only) · `--edge` #71849A (every UI boundary that must read: inputs, selects, checkboxes, selected segment, "not included" dash). Cool, not warm: they continue the Sept refresh's "mist, not cream", take their tint from the navy so the page reads as one ink, and leave the golden-hour video as the only warm field.
- **Text:** `--ink` (= `--brand`), `--ink-2` #38506A, `--ink-3` #51657B; on navy `--on-dark` #FFF, `--on-dark-2` #C5D2DF, `--on-dark-3` #A3B3C3.
- **Accent (the only one): brass.** `--accent` #DDB15A is the lamp: diamond markers, eyebrows and numerals on navy, the keystone badge, focus rings on navy and over the video, the primary button on navy or video (`.on-dark .btn-primary`, navy text). `--accent-d` #94671A is the same brass dark enough for light surfaces: the price line, the dashboard target line and label, the fit-helper match outline. Never body text on light.
- **Coaches (kept once the photos went in, marketing D33):** `--allan` (= `--brand-2`) with `--allan-l`; `--jon` #8E3B34 claret with `--jon-l`.
- **Status (meanings unchanged):** `--green`/`--green-l` on track, `--amber`/`--amber-l` close, `--red`/`--red-l` stretch; red also marks the dashboard's priority badges, timing figure and form errors.
- **Charts:** `--chart-hi` (= `--brand-2`), `--chart-2` (= `--brand-3`), `--chart-total` (= `--brand`), `--chart-muted` #A7B5C4 (context bars), `--chart-ref` (= `--accent-d`). Checked with the dataviz validator: harbour vs brass ΔE 22.3, Math vs Reading and Writing ΔE 18.5 (both clear the CVD target 8 and the normal-vision floor 15); the waterfall's gain → total pair passes as a one-hue ordinal ramp.
- `--focus` is set per surface: `--brand-2` on light, `--accent` on navy, the footer and over the video.
- Fonts: `--serif` = Newsreader (headings, numbers, chips; replaced Fraunces in Sept 2026 because its hooked "f" and curly "4" read as too quirky), `--sans` = Instrument Sans (body/UI). Kept in the revamp: they sit well against the logo's spaced geometric capitals without imitating them, and the dashboard's pinned fonts (D8) cost nothing extra. Google Fonts serves Newsreader roman as the full variable font (opsz 6–72, wght 300–700) but the italic as the one instance the page sets, the hero's "by name." (`1,72,470`: 63 KB instead of 147 KB, and the hero reveal waits for it). Set italic anywhere else and you must widen that request. Scale: `--fs-h1` clamp(36→64px), `--fs-h2` clamp(30→50px), `--fs-h3` 22px; body 16.5 / 17 / 17.5px by breakpoint.
- Radius: `--r-sm` 10, `--r` 14, `--r-lg` 20. `--arch` = arched-window radius. Shadows: `--shadow`, `--shadow-lg` (navy-tinted). Easing: `--ease`
- Layout: `--wrap` 1200px, `--gutter` 20px mobile / 32px ≥720 (`.wrap` also respects the safe-area insets), `--nav-h` 64px mobile / 76px ≥880

## Signature & conventions
- **Logo** (owner's pick at Gate 2: option B). The nav sets the logo live: the vector three-stripe symbol (`.brand-mark`, an inline copy of `logo-symbol.svg` from the brand kit, `fill: currentColor`) beside "Lighthouse / Prep" (`.brand-word`) in Instrument Sans 600, uppercase with 0.34em tracking, centred on two lines, at the artwork's proportions: `--logo-h` is 36px on phones and 40px from 880, with the type at 0.39 × that height and the gap at 0.36 ×. Both parts take `currentColor`: white while the nav is over the hero, navy once the hero stage's bottom edge passes under the nav (IntersectionObserver on `.hero-end`, class `.over` on `#nav`). The nav is also solid while the menu is open, and always solid without JS, because the `.over` styles need the `.js` class set in `<head>`. The footer keeps the drawn artwork: `brand/logo-stacked-reverse` (96px; WebP in `<picture>`, PNG fallback, @2x, `alt="Lighthouse Prep"`). The nav link keeps `aria-label="Lighthouse Prep, back to top"`, which contains the visible "Lighthouse Prep". Never redraw or restyle the symbol. The rejected option A (the horizontal lockup cut from `logo-final.png`) is compared in `website-revamp/review/assets/nav-logo-compare.png`. `brand/` holds only the footer logo; the full kit (stacked, symbol, wordmark and horizontal, navy and reverse, the symbol SVGs) is in `website-revamp/brand-kit/`, outside the deployed folder, and `website-revamp/tools/brand.py` rebuilds both.
- **The arch** (collegiate window) stays where it means something: the coach portraits and the Flagship column's head and band in the pricing matrix. It is not used on the video. Don't add other decorative shapes.
- **Favicon**: the logo's three-stripe lighthouse symbol, traced as polygons, in fog `#F1F4F7` (`--bg`) on a navy `#10273E` rounded tile (`favicon.svg`). `favicon-32.png`, `favicon.ico` (16/32/48) and the full-bleed square `apple-touch-icon.png` (180; iOS rounds it) are rendered from the same trace by `website-revamp/tools/brand.py` (project root), so re-run that script if the symbol or its colours change, and keep `theme-color` equal to `--bg`. The three icon links carry `?v=2`: browsers keep favicons in their own cache, so bump it whenever the icons change.
- **Brass diamond** (7px rotated square) is the only list/marker glyph: eyebrows, hero meta, credential strip.
- Eyebrows are **sentence case** (no uppercase or tracking anywhere on the site except the logo's wordmark): `--ink-2` on light, brass on navy, white over the video.
- Newsreader: `font-variation-settings:"opsz" 72` (axis max) for display, `"opsz" 24–36` for small serif text. Vary opsz, not weight. It sets larger than Fraunces did, so size headings down rather than up.
- Two-coach colour coding: **`--allan` (harbour blue) = Allan**, **`--jon` (claret) = Jon**: the thin rings around the lanes' photo avatars, lane rules, tick circles, "With Allan/Jon" labels, roles, the voice rules and the two-ring icon. The revamp's placeholders (D10), kept when the photos went in (marketing D33, Oct 2026). Hero voices are `.voice` blocks: each coach's line under a 2px rule in his colour (every width), then the shared-plan line with the two-ring icon (`.ring-a`/`.ring-j`) under a `--line-2` rule. No initials there: the owner removed them (Oct 2026). Keep that structure if hero copy changes.
- **Coach photos** (see **Coach photos** below) appear in exactly two places: the arch portraits in the coaches section and the round avatars in the approach lanes. Nowhere else on the page without the owner's call; the dashboard demo's sample student keeps its "M" (D8).
- Buttons: pill (`999px`), min-height 48px. `.btn-primary` is navy on light and brass with navy text on navy or over the video (`.on-dark` ancestor; the nav's button turns brass while the nav is over the hero). `.btn-ghost` is a navy outline on light and a white outline on a light scrim over the video. No new shapes.
- Sections: `padding` 64 → 88 → 112px by breakpoint; content in `.wrap`. Anchored sections clear the fixed nav via `scroll-padding-top`. Rhythm: video stage → fog → paper strip → fog … → navy dashboard → fog → paper → fog → navy consult box → deep-navy footer.
- Status pills (`.pill.green/.amber/.red`) are the only semantic colour usage.
- Decoration is cut to one echo of the lamp: the faint brass rings in the consult box. No gradient washes (the dashboard's old gold glow is gone).
- Motion: see **Motion** below. **No scroll-reveal fade-ins** and no hover lifts on cards. Everything respects `prefers-reduced-motion`.

## Hero (video stage)
- `.hero` = `.hero-stage` (full-bleed, `min-height:100svh`, copy bottom-aligned) + `.hero-lead` (the voices, on fog below the stage).
- `.hero-media` holds the poster `<picture>` (phone crop for `max-aspect-ratio: 3/4`, desktop otherwise; WebP, JPG fallback, `fetchpriority=high`, preloaded with matching `media`) and `<video id="heroVideo" muted playsinline loop preload="none">` (no `autoplay` attribute: the controller plays it), both `aria-hidden`. The poster is the LCP element; the video never is.
- Video controller (main script, block "hero video"; vanilla JS, so it works without GSAP): picks the crop by the poster's aspect query (and moves the loop to the other crop, at the same point, if a phone or tablet turns past 3:4; a paused or offscreen video just drops its file), then AV1 (`media/hero-*-av1.mp4`) where `navigator.mediaCapabilities.decodingInfo()` says supported and power-efficient, H.264 otherwise, with a one-time fallback to H.264 on a decode error. Nothing loads until the window's `load` event plus idle time, and nothing loads while the stage is offscreen or the tab is hidden. Reduced motion, Save-Data and 2G (D4) get the poster and the play button; so does a refused autoplay (iOS Low Power Mode). The video sits at opacity 0 over the poster until its first `playing` event, then fades in. It pauses while the stage is fully offscreen (an IntersectionObserver) and while the tab is hidden, and resumes only if the visitor hadn't paused it with the button.
- Scrim: a navy band under the nav and a light overall calm (`.hero-media::after`), plus a shade that follows the copy block (`.hero-grid::before`, phones and tablets) so it covers the text however many lines it wraps to. ≥1024 the copy sits lower-left under a left-to-right gradient instead, and the float cards sit to its right inside the stage. Measured numbers are in the contrast section; re-measure with `node website-revamp/tools/hero-contrast.mjs [--frames]` after any change to the hero's layout or scrim.
- Pause/play: `#heroToggle`, 44px, visible whenever JS runs, label switches between "Pause background video" and "Play background video" from the video's own `play`/`pause` events (WCAG 2.2.2), so it also reads "Play" while the controller holds the video offscreen or in a hidden tab. In the tab order right after the hero CTAs; Enter and Space toggle it. Top-right under the nav on phones, bottom-right ≥720.
- Float cards (`.hero-cards`, D1) hang 58px over the stage's bottom edge on phones and tablets; ≥1024 they float right of the copy.

## Motion (Oct 2026: GSAP)
Three things move on their own: the hero's reveal (the page's one orchestrated moment), the video, and the two score charts, which tell their data story once. The rule from D9 stands: **no scroll-reveal fade-ins or section entrances, no scrubbed or pinned scroll effects, and no smooth-scroll library** (ScrollSmoother and Lenis take over native scrolling and fight the sticky CTA and the anchor offsets). No hover lifts on cards either.

| What moves | Trigger | Duration | Reduced motion |
|---|---|---|---|
| **Hero reveal**, one timeline: the poster (and video) settle from a 1.06× zoom; the eyebrow fades up as the headline rises line by line out of its masks; then the CTAs; then the meta line, the float cards (from the right ≥1024, from below under that) and the pause button | Once on load, as soon as GSAP and the headline's font are in. Never waits on the video | 1.65 s. The CTAs and the button only fade, so they're clickable throughout; focus anywhere in the stage completes it at once | Not played: everything as drawn from the first paint |
| **Video fade-in** over the poster | The video's first `playing` event, never a timer | 0.8 s | The video doesn't load (D4). If the visitor presses play, it appears without a fade |
| **Video playback** | Starts in idle time after `load`; pauses when the stage is fully offscreen or the tab is hidden; resumes only if the visitor hadn't paused it | Loop 26.2 s | Poster and play button (Save-Data and 2G too) |
| **`#aidChart`** (waterfall): the 1200 bar rises; each step rises from the previous level as its link draws in; the total column rises from the baseline; then the dotted Flagship price line sweeps in from the left with its label | Once, when the chart's top passes 75% of the viewport (ScrollTrigger, no scrub) | 3.0 s | Drawn final |
| **`#earnChart`**: the bars rise left to right with their values just behind; the bracket draws from the 1100–1199 bar to the 1400+ bar; "+$28,332" lands last | The same | 2.2 s | Drawn final |
| **Dashboard** (`#dash`): the line chart draws and the skill bars fill. Unchanged: IntersectionObserver plus CSS, no GSAP inside `#dash` (D8) | In view | As before | The global CSS rule |
| **UI transitions**: nav state, menu sheet, sticky CTA, source popovers, FAQ, method stepper | Interaction or scroll position | 0.15–0.35 s | Off (the global `prefers-reduced-motion` rule) |

How it holds together:
- **Loading and safety.** GSAP loads with `defer` in `<head>`. The motion script is the last inline script in `<body>` and runs on `DOMContentLoaded`, once the deferred files have run. The hero's pre-reveal state (hidden copy, zoomed media) exists only under `html.motion`, which the head script sets when reduced motion isn't requested. The timeline removes the class the moment it takes over. A failsafe removes it 2.5 s after the head script if the timeline hasn't started (GSAP slow or blocked), and the hero then simply shows as drawn, with no late animation. Without JS nothing is ever hidden. If GSAP never arrives, the video still works and the charts stay as drawn.
- **Charts end on the static drawing.** Every chart tween is a `from()` on the freshly drawn SVG, with the transform origin at the bar's foot: the baseline, or the previous level for a waterfall step. When the timeline ends, or is cut short, it is killed and GSAP's leftovers (`style`, `transform`, `data-svg-origin`) are stripped, so the SVG is byte-identical to what the chart script drew. The chart script fires `chartdraw` after each innerHTML redraw (on resize). A chart still waiting is re-armed on the new drawing; one that is playing or has played just stays final. A chart already in view, or above it, when the script runs is left as drawn. Labels never change text: there are no count-ups. DrawSVG draws the bracket and the links; the dotted price line is revealed by a sweeping clip instead, because DrawSVG would replace its dots.
- **SplitText** splits the headline by lines only, masked (`mask: "lines"`, class `hl`, masks `hl-mask`). It splits after the headline's Newsreader faces load, so the breaks match the static `text-wrap: balance` layout, and it reverts as soon as the last line lands (1.25 s into the reveal, not at its end): the `<h1>` gets its original markup back, and its temporary `aria-label` goes too. Reverting early matters for LCP, see Performance. The masks are widened sideways so italic overhang isn't cut. Newsreader's ascent and descent fit the 1.04 line height, so they need no vertical room.
- **`gsap.matchMedia()`.** `(prefers-reduced-motion: no-preference)` gates the charts. The hero handler also takes `(min-width: 1024px)` to choose the cards' direction. 880 needs no motion change, because the nav never animates. If the breakpoint or the preference changes mid-reveal, the reveal reverts to its final state; it never replays.
- **Performance.** On HTML, only transforms and opacity animate. On SVG it's transforms, stroke-dash (DrawSVG) and one clip rect: paint only, on small elements. `will-change: transform` sits on the poster and video only while `.motion` holds them zoomed. There's one ScrollTrigger per chart, killed once it fires; the video's offscreen pause is a plain IntersectionObserver. The charts are armed in idle time (`requestIdleCallback`, 2 s timeout): building both timelines was about 90 ms of the `DOMContentLoaded` task on a 4× throttled phone. `ScrollTrigger.refresh()` runs after `document.fonts.ready` and after the reveal. Measured in headless Edge: GSAP's four files evaluate in one ~55 ms task before `DOMContentLoaded`, and the reveal builds in ~10 ms.
- **LCP is the headline, not the poster.** Chrome ignores an image that covers the whole viewport as background, so the full-bleed poster never counts; the LCP is the `<h1>`'s paint after SplitText reverts. Measured Oct 4 2026 (cold, served compressed): desktop on cable LCP 1.8 s, CLS < 0.01, TBT 0, 453 KB before `load`; a phone on Fast 4G with a 4× CPU LCP 3.0 s, TBT 270 ms, 354 KB before `load` (fonts 220 KB, GSAP 51 KB, poster 47 KB), with the reveal playing every time; on Lighthouse's Slow 4G with a 4× CPU the reveal never wins the race, the 2.5 s failsafe (late behind load-time long tasks) shows the hero at about 4 s, and LCP follows. Anything that lengthens the headline's part of the reveal, or hides it longer, moves LCP with it.
- **Eases.** `power3.out` for the copy, `power2.out` for media and bars, `power1.inOut` for lines that cross the chart, and `none` for the waterfall's short links.

**GSAP files.** `vendor/gsap/` holds GSAP **3.15.0**, copied unmodified from the npm package: `gsap.min.js` (72.9 KB), `ScrollTrigger.min.js` (44.6 KB), `SplitText.min.js` (7.7 KB) and `DrawSVGPlugin.min.js` (4.4 KB). That's 129.6 KB raw and about 52 KB gzipped, with `VERSION.txt` naming the version. There's no CDN, and every plugin is free under GSAP's standard license. To update:
1. In the project root (`tutoring startup/`, which has the `package.json` with gsap), run `npm install gsap@<version>`.
2. Copy the same four files from `node_modules/gsap/dist/` over the ones in `website/vendor/gsap/`, and update `VERSION.txt`.
3. Keep the `<script defer>` order in `<head>`: core first, then the plugins. Vendor only the plugins the page uses.
4. Check the reveal, both charts mid-play and at the end, and reduced motion. Then run `node website-revamp/tools/copy-check.mjs`, which must print PASS (it covers both motion modes).

## Mobile patterns (keep these when editing)
- Sticky bottom CTA (`.mcta`, <880px): appears once the hero buttons have scrolled away above (buttons still below the fold, as on a phone in landscape, keep it hidden: their observer stretches the viewport downwards); hides over the consult form, footer, and while the menu is open. Uses safe-area insets.
- Nav: 44px icon button → dropdown sheet with 52px rows, clear of the safe-area insets; on a short screen (max-height 600px, a phone in landscape) it is capped to the screen and scrolls. Closes on link tap, outside tap, Escape. Over the hero the button is a white outline on a navy scrim.
- Hero order on phones: video stage (eyebrow → headline → CTAs → meta, float cards straddling its bottom edge) → coaches' voices on fog.
- Dashboard: KPIs in a 2×2 grid, remaining cards in a horizontal scroll-snap rail (`.dash-rail`, 88% cards, dot indicator). ≥720 the rail becomes `display:contents` and the 12-col grid takes over.
- Chart SVG renders at its container's real pixel width (re-renders on resize) so labels stay legible; points have 18px invisible hit circles.
- Method stepper is a horizontal 1–5 row on phones, vertical list ≥1024.
- Pricing is a comparison matrix (`.mx`, ARIA table roles on divs). One CSS grid; each `.mx-row` is a `subgrid` so columns align. The Flagship column is `.mx-band` (absolutely positioned in its grid area, so it doesn't block auto-placement) capped by an arched navy `.mx-head.f` with a brass `.keystone` badge, on a `--brand-tint` band with a faint brass outline. Keep `--rows` on `.mx` equal to the number of `.mx-row`s. Phones: the same 4-column sheet as desktop (label column + 3 program columns sized `clamp(58px,17vw,68px)`), so the whole grid fits without sideways scroll down to 320px. Header names and labels scale down slightly on narrow screens; descriptors and the CTA row are hidden (sticky CTA covers it). Never stack labels above values: the Flagship band would cut through the text. ≥720: roomier columns, descriptors and CTA row shown. Fit helper outlines the matching `.mx-head` via `.match` (`--accent-d`).
- Sources popovers (`.sc-cite`): open on hover, keyboard focus or a tap; they open on the side with more room and are never taller than that room (`--room`, re-measured on scroll), so the box scrolls rather than run under the nav.
- All touch targets ≥44px (the short footer links get a wider hit area from an `::after`); form inputs/selects are 16px to prevent iOS zoom. Inside `#dash` (D8, unchanged) the chart points have 36px hit circles and the goal buttons are 40px tall from 720px.
- Feedback transitions (hover, press, selection) stay within 0.2 s; only the FAQ panel (0.35 s, a `grid-template-rows` reveal) and scroll-driven state (nav, sticky CTA, 0.3 s) run longer.

## Coach photos (P4.5, Oct 2026)
Real phone photos of Allan and Jon, matched by `marketing/assets/photos/process.py` (level, crop, scale, white balance, one shared grade, background softening through a mask; never retouched or generated; its README has the method). The script writes every file in [media/coaches/](media/coaches/): `{allan|jon}-{portrait|avatar}-{width}w.{webp|jpg}`, sRGB, no metadata. Re-run it rather than editing a file by hand: `python marketing/assets/photos/process.py --web website/media/coaches` from the project root.

| Where | Element | Shown at (CSS px) | Files (widths) | Bytes (WebP) |
|---|---|---|---|---|
| Coaches section (`.bio`) | `<picture class="portrait">` in the arch (`border-radius:50% 50% 10px 10px / 40% 40% 10px 10px`, inner 1px rule at 30% white) | 96×120 on phones; 168×210 at 720–1023 (single card, the arch in its own column); 144×180 from 1024 (two cards: the arch beside the name and role, the story at the card's full width) | 4:5 portrait crop: 96, 144, 168, 192, 288, 336, 432, 504 | 4–32 KB each; ≤18 KB for what a phone loads (288w at 3×) |
| Approach lanes (`.lane-top`) | `<picture class="coach-av">`, round, ring: 2px `--bg` gap then 2px coach colour (`box-shadow`, so no layout change) | 48×48 (56 with the ring) | 1:1 square crop: 48, 96, 144 | 1–7 KB each |

- Markup: `<source type="image/webp">` plus a JPG `<img>` fallback, both with `srcset` (w descriptors) and `sizes`; the portrait's `sizes` is `(min-width:1024px) 144px, (min-width:720px) 168px, 96px`. `width`/`height` set the aspect ratio and the containers have fixed sizes, so nothing shifts. Both sections are below the fold at every width: `loading="lazy"` and `decoding="async"`. The hero stage is untouched, so the LCP element and its timing are too.
- Alt text: the portraits say who and what ("Allan, co-founder and SAT coach"; "Jon, co-founder and college and career coach"), without repeating the heading beside them word for word. The lane avatars are `alt=""`: the heading beside them names the coach, and the portrait carries the description.
- While a photo loads (or if it fails) the shape shows `--wash`. The arch keeps its inner rule as the window's frame; there's no shadow or ring on the portraits.
- The crops leave room for the shapes: in the portrait the hair top sits at 17% of the height and the face's widest point well inside the arch; in the square, hair top at 14% and the chin at 77%, so the circle cuts only the shoulders.

## Content/UX rules
- Prices are always visible per [CLAUDE.md](../CLAUDE.md) rule 3 — never gate behind "call for pricing".
- No outcome guarantees in copy (CLAUDE.md rule 1) — check any new headline/testimonial copy against this.
- Keep WCAG 2.1 AA contrast: every pair in use is in the contrast section below. Brass is never body text on light backgrounds.

## Contrast (WCAG 2.1 AA, Oct 2026)
Targets: 4.5:1 for text, 3:1 for large text (≥24px, or ≥18.66px bold) and for UI boundaries and chart marks. Every text/background and UI-boundary pair the site uses:

| Foreground | Background | Ratio | Needs | Used for |
|---|---|---|---|---|
| `--ink` #10273E | `--bg` #F1F4F7 | 13.77 | 4.5 | Text: headings and body on the page |
| `--ink` #10273E | `--paper` #FFFFFF | 15.20 | 4.5 | Text on cards and paper sections |
| `--ink` #10273E | `--wash` #E4EAF0 | 12.54 | 4.5 | Text on tracks and the segmented control |
| `--ink` #10273E | `--brand-tint` #E0E8F0 | 12.28 | 4.5 | Finding quote, selected skill |
| `--ink-2` #38506A | `--bg` #F1F4F7 | 7.54 | 4.5 | Secondary text, eyebrows on light |
| `--ink-2` #38506A | `--paper` #FFFFFF | 8.32 | 4.5 | Secondary text on cards |
| `--ink-2` #38506A | `--wash` #E4EAF0 | 6.87 | 4.5 | Segmented control buttons |
| `--ink-2` #38506A | `--brand-tint` #E0E8F0 | 6.72 | 4.5 | Finding source line |
| `--ink-3` #51657B | `--bg` #F1F4F7 | 5.44 | 4.5 | Muted text (meta, captions) |
| `--ink-3` #51657B | `--paper` #FFFFFF | 6.00 | 4.5 | Muted text on cards |
| `--ink-3` #51657B | `--wash` #E4EAF0 | 4.95 | 4.5 | Muted text on wash |
| `--ink-3` #51657B | `--brand-tint` #E0E8F0 | 4.85 | 4.5 | Muted text on tint |
| `--brand-2` #285F9C | `--bg` #F1F4F7 | 5.93 | 4.5 | Links, credential numbers, step label |
| `--brand-2` #285F9C | `--paper` #FFFFFF | 6.55 | 4.5 | Links, "Show the table", With Allan |
| `--brand-2` #285F9C | `--brand-tint` #E0E8F0 | 5.29 | 4.5 | Link text on tint |
| `--jon` #8E3B34 | `--paper` #FFFFFF | 7.43 | 4.5 | With Jon, Jon role |
| `--jon` #8E3B34 | `--bg` #F1F4F7 | 6.73 | 4.5 | Jon role on bio card |
| `--on-dark` #FFFFFF | `--brand` #10273E | 15.20 | 4.5 | Primary button, headings on navy, Flagship head |
| `--on-dark` #FFFFFF | `--brand-hover` #1B3753 | 12.22 | 4.5 | Primary button hover |
| `--on-dark` #FFFFFF | `--brand-2` #285F9C | 6.55 | 4.5 | Checked box tick |
| `--on-dark` #FFFFFF | `--ink-3` #51657B | 6.00 | 4.5 | Mono M (dashboard student) |
| `--on-dark` #FFFFFF | `--accent-d` #94671A | 4.98 | 4.5 | Dashboard target label |
| `--brand` #10273E | `--accent` #DDB15A | 7.61 | 4.5 | Brass button, keystone badge |
| `--on-dark-2` #C5D2DF | `--brand` #10273E | 9.88 | 4.5 | Lead and lists on navy, Flagship descriptor |
| `--on-dark-3` #A3B3C3 | `--brand` #10273E | 7.09 | 4.5 | Muted on navy |
| `--accent` #DDB15A | `--brand` #10273E | 7.61 | 4.5 | Eyebrows and numerals on navy |
| `--on-dark-2` #C5D2DF | `--brand-deep` #0A1828 | 11.63 | 4.5 | Footer links |
| `--on-dark-3` #A3B3C3 | `--brand-deep` #0A1828 | 8.34 | 4.5 | Footer text and legalese |
| `--green` #2C6A49 | `--green-l` #E1EFE6 | 5.42 | 4.5 | Pill: on track |
| `--amber` #7F5512 | `--amber-l` #F6EBD3 | 5.53 | 4.5 | Pill: close |
| `--red` #A13328 | `--red-l` #F7E3DF | 5.63 | 4.5 | Pill: stretch, priority badges; the form's failure box and its email link (underlined) |
| `--red` #A13328 | `--paper` #FFFFFF | 6.95 | 4.5 | Timing figure; form error text under a field |
| `--edge` #71849A | `--bg` #F1F4F7 | 3.48 | 3 | UI: input, select and textarea borders on fog |
| `--edge` #71849A | `--paper` #FFFFFF | 3.84 | 3 | UI: checkbox and select borders on cards |
| `--edge` #71849A | `--wash` #E4EAF0 | 3.17 | 3 | UI: selected segment ring |
| `--edge` #71849A | `--brand-tint` #E0E8F0 | 3.10 | 3 | UI: "not included" dash on the Flagship band |
| `--red` #A13328 | `--bg` #F1F4F7 | 6.30 | 3 | UI: the edge of a form field in error (on `--paper` once focused: 6.95) |
| `--brand-2` #285F9C | `--bg` #F1F4F7 | 5.93 | 3 | UI: focus ring on fog |
| `--brand-2` #285F9C | `--paper` #FFFFFF | 6.55 | 3 | UI: focus ring on paper, checked box |
| `--brand-2` #285F9C | `--brand-tint` #E0E8F0 | 5.29 | 3 | UI: selected skill ring |
| `--allan` #285F9C | `--bg` #F1F4F7 | 5.93 | 3 | Allan's avatar ring and voice rule (identification only: his name sits beside both) |
| `--jon` #8E3B34 | `--bg` #F1F4F7 | 6.73 | 3 | Jon's avatar ring and voice rule (the same) |
| `--accent` #DDB15A | `--brand` #10273E | 7.61 | 3 | UI: focus ring on navy |
| `--accent` #DDB15A | `--brand-deep` #0A1828 | 8.95 | 3 | UI: focus ring in the footer |
| `--accent-d` #94671A | `--paper` #FFFFFF | 4.98 | 3 | UI: fit-helper match outline; chart price line |
| `--accent-d` #94671A | `--brand-tint` #E0E8F0 | 4.03 | 3 | UI: match outline over the Flagship band |
| `--accent-d` #94671A | `--bg` #F1F4F7 | 4.51 | 3 | Chart: dashboard target line |
| `--brand-2` #285F9C | `--paper` #FFFFFF | 6.55 | 3 | Chart: highlight bars, line, Math skills |
| `--brand` #10273E | `--paper` #FFFFFF | 15.20 | 3 | Chart: waterfall total |
| `--brand-3` #5E97D8 | `--paper` #FFFFFF | 3.05 | 3 | Chart: Reading and Writing skills |
| `--brand-3` #5E97D8 | `--wash` #E4EAF0 | 2.51 | 2.5 | Chart: R&W fill on its track (relief: % label beside every bar) |
| `--chart-muted` #A7B5C4 | `--paper` #FFFFFF | 2.09 | 2 | Chart: context bars (relief: value label on every bar, table view) |

The last two rows are chart fills, not text or controls: the dataviz method allows them below 3:1 only with a relief channel, which both have. `--line`/`--line-2` are decorative rules only; the controls they sit near (step buttons, FAQ questions, the sources pill) are identified by their text. Selected states inside the dashboard use a ring (`--edge` on the segmented control, `--brand-2` on the selected skill) on top of the old fill change.

**Over the video** (measured by `website-revamp/tools/hero-contrast.mjs`: the poster with the scrim and button fills applied, foreground hidden, contrast taken at the brightest pixel under each line of text or around each control; Oct 4 2026):

| Viewport (poster) | Nav links | Eyebrow | Headline (3:1) | Ghost button text | Meta line | Ghost edge | Brass button edge | Menu edge | Pause edge | Pause icon |
|---|---|---|---|---|---|---|---|---|---|---|
| 320×640 (phone) | in menu | 10.62 | 11.51 | 14.75 | 12.97 | 8.87 | 5.98 | 5.02 | 7.37 | 16.41 |
| 375×812 (phone) | in menu | 12.37 | 11.51 | 16.65 | 12.80 | 9.05 | 5.94 | 3.89 | 3.84 | 14.45 |
| 768×1024 (phone) | in menu | 14.42 | 10.66 | 16.60 | 15.22 | 8.97 | 6.45 | 5.19 | 11.31 | 17.33 |
| 1024×768 (desktop) | 7.16 | 10.90 | 8.38 | 14.72 | 11.04 | 7.39 | 6.95 | n/a | 5.40 | 15.04 |
| 1440×900 (desktop) | 7.42 | 10.76 | 7.66 | 14.47 | 13.34 | 9.11 | 7.77 | n/a | 3.70 | 16.58 |

Text over the video is white; the brass button's text is navy on solid brass (7.61). A control's edge counts its light ring on dark footage or its dark fill on bright footage, whichever is higher. With `--frames` the same scrim was also measured on one frame from each of the loop's five shots: everything passes, the lowest being the desktop headline on the Harvard and aerial shots (3.94, target 3). Focus over the video is a brass ring on an 8px navy halo (85% `--scrim`), so the ring always sits on navy (at least 6.7:1 even over a white pixel). Re-measured Oct 4 2026 (Prompt 4, after the copy shade became `left:0;right:0` instead of `100vw` wide): the same numbers on both posters, and all five shot frames still pass.

**axe** (WCAG 2.0–2.2 A/AA plus best practice, at 320, 375, 768, 1024, 1440 and 812×375): no WCAG violations. One best-practice item is left inside `#dash` under D8: its card headings are `<h4>` under the section's `<h2>`. The chart's six points carry `role="img"` with their `aria-label` (the owner's one approved exception to D8, Oct 4 2026; it changes nothing visible). The method stepper's list items are `role="presentation"` so the tablist owns its tabs, and the Standards headings are `<h3>`.

## Consult form and tracking (P3, Oct 2026)
Every guide embeds the same form as the home page (marketing/STRATEGY.md §7), so its logic lives once in [assets/consult-form.js](assets/consult-form.js) (deferred after GSAP; 4.5 KB gzipped) and each page carries only markup. Everything that names an account sits in the script's `CONFIG`: the HubSpot submit URL (portal 247619141, form "Website consult request"), the "Parent newsletter" subscription type, the GA4 ID, the live hosts, the first-touch key and its 30 days, the 3 s minimum fill time and the 15 s timeout.

**Sending.** `form.cf[data-form-location]` (`home`, or `guide-<slug>`) posts JSON to HubSpot's unauthenticated Forms API v3 (`api.hsforms.com/submissions/v3/integration/submit/<portal>/<form>`, CORS-enabled; checked against HubSpot's docs and the live form's definition on Oct 6 2026). Fields: `email`; `firstname` and `lastname` (the parent name split at the first space); `student_grade`, `main_goal`, `how_heard` (the select values are the HubSpot properties' internal values: change both together); `message`; the six `first_*` hidden fields. Empty values are left out. `legalConsentOptions.consent` sends implicit consent to process with the `.legal` line's text, and the newsletter box as a communication with its label's text and `value` true or false. The honeypot and the checkbox are never sent as fields.

| State | What the parent sees | Notes |
|---|---|---|
| Idle | The fields; every select starts on "Choose one" | No preselected grade or goal: a default would skew the audience split (marketing/MEASUREMENT.md §1) |
| Invalid | A red edge and a line of text under each field in error; focus on the first | `aria-invalid` and `aria-describedby`; each error clears as its field is fixed. Required: name, email, grade, goal, how heard |
| Sending | Button disabled, "Sending…" | A second click or Enter can't send twice |
| Sent (2xx only) | The thank-you panel over the form: "Thank you, {first name}.", the reply promise, "Prefer to pick a time now?" with Jon's meeting link (new tab, D4), the test-report tip | Focus moves to the heading; everything behind the panel is `inert`; `generate_lead` fires |
| Failed | `.cf-fail` (role `alert`): "We couldn't send your request…" with a mailto link to hello@ | The answers stay and the button comes back. HubSpot's `INVALID_EMAIL` or `BLOCKED_EMAIL` also marks the email field |
| Bot | The failed state; nothing is sent | A filled honeypot (`.hp`: off-screen, `aria-hidden`, `tabindex=-1`) or a submit within 3 s of the page opening. A person caught by mistake can retry or use the email link |
| Local preview | The failed state, nothing sent, a console note | localhost and 127.0.0.1 never send a real inquiry unless a test sets `window.lpTest` (and mocks HubSpot) |
| Script missing | The failed state | The page's inline fallback, when `window.lpForm` is unset. With JS off, `method="post"` keeps answers out of the URL and a `<noscript>` line gives the email address |

**First touch.** On the first visit to any page with the script, localStorage `lp_first_touch` stores utm_source, utm_medium, utm_campaign and utm_content (trimmed, at most 200 characters each), the landing page (origin and path, no query) and the referring site (origin only, and only from another host). It's kept 30 days, never overwritten by later visits inside that window, and sent only with the form. Every storage access is in try/catch: with storage blocked, the current visit counts as the first.

**GA4** (`G-G13HV1FBTM`, D5, no GTM). It loads only on thelighthouseprep.com (and www), never for a browser that sends Global Privacy Control, and 2 s after the page's load event, in idle time: gtag.js is about 170 KB on the wire (507 KB decoded) and ran as a 250–300 ms task at 4× CPU, which had landed inside the hero's reveal. Measured Oct 6 2026 on a throttled phone: LCP unchanged within noise. So visits shorter than about 5 s aren't counted. `page_location` keeps only the `utm_*` parameters; the tag also turns off Google signals and ad personalization; the cookies (`_ga`, `_ga_G13HV1FBTM`) last 13 months from the last visit. Enhanced measurement's form interactions stay off in GA4 (they would duplicate `consult_form_start`).

| Event | Fires | Params | Hook |
|---|---|---|---|
| `cta_click` | Every click on a consult link | `location`: nav, hero, scores, dashboard, programs, sticky (guides: guide) | `data-cta` on the link |
| `consult_form_start` | The first input or change in a field, once | `form_location` | The form |
| `generate_lead` | HubSpot answered 2xx, once | `form_location` | The form |
| `booking_link_click` | The meeting link, once | `location`: thank_you, guide | `data-booking` |
| `fit_helper_use` | The fit helper's first result, once | `grade_band` (9-10, 11, 12), `need` | Inline, in the helper |
| `dashboard_demo_use` | The first click or change on the demo's controls or chart points, once | — | Inline: a capture listener on `#dash`, added from outside, so the demo itself is untouched (D8) |
| `guide_cta_click` | A guide's link to the home page's form, once (only where the form isn't on that page; no page uses it yet) | `guide_slug` | `data-guide-cta` |
| `share_to_parent` | "Send this page to a parent" is used on a guide, once | `guide_slug`; `method`: share, email, copy | Inline, in the guide (see **Guides**) |

Inline code reports through `window.lpTrack(name, params, once)`; calls made before the script has run wait in `window.lpq`. No event ever carries form values.

**For the guides (P5, as built).** Each guide copies the form block under `<!-- CONSULT -->` unchanged (IDs only need to be unique on the page), with `data-form-location="guide-<slug>"`, loads `/assets/consult-form.js` with `defer`, and keeps the inline fallback (the `/* form: */` block). The form is on the page, so the guide's links to it are ordinary placements: `data-cta` `nav`, `guide` (the article's button) and `sticky`, all sending `cta_click`. Internal links never carry UTMs (marketing/MEASUREMENT.md §4: they would restart the session and overwrite the real source); HubSpot still learns the guide from the submission's `pageUri` and, on a first visit, `first_landing_page`.

**Tests.** `node website-revamp/tools/consult-form-test.mjs` against `aquinas-site` (22 tests: success; server error; network failure; HubSpot rejecting an email; validation; honeypot; minimum fill time; double click; attribution and its expiry; every GA4 event once and none carrying form data; GA4 off locally and under GPC; the missing-script fallback; keyboard and labels at 375, 768 and 1440; axe on every form state and the privacy page; search basics). HubSpot, GA4 and the meeting page are mocked.

## Search basics
- Canonical URLs: `https://thelighthouseprep.com/`, `https://thelighthouseprep.com/privacy`, `https://thelighthouseprep.com/guides/` and each guide's `https://thelighthouseprep.com/guides/<slug>/` (trailing slash: Cloudflare Pages serves a folder's `index.html` there). Cloudflare Pages redirects `*.html` to the extensionless path, so the canonical and the sitemap use `/privacy`, while links keep `privacy.html` (the local python server has no such rewrite).
- Open Graph and X tags reuse the page's title and description. The card is `media/og-image.png` (1200×630, 76 KB), rendered from the brand files by `website-revamp/tools/og-image.mjs`: re-run it if the logo, palette or hero headline changes.
- JSON-LD at the end of `<body>`: the Organization (logo `apple-touch-icon.png`) and the FAQ, word for word from `#acc`. Change both together; the test compares them.
- `robots.txt` allows everything and names `sitemap.xml`. Add each guide to the sitemap with its `lastmod`.
- No verification meta tags: Search Console and Bing are verified through DNS.
- [llms.txt](llms.txt) (llmstxt.org): a plain summary for AI tools: who we are, the programs and prices with the promise's terms, who teaches, the consult, the guides and the pages. Its words come only from the site and the approved guides; update it with any price, program or new guide.
- Every footer (home, privacy, guides) links to `/guides/`.

## Privacy page
[privacy.html](privacy.html) is self-contained in the design system: the tokens it uses, the same font request, the nav's live logo linking home, and the home page's footer with "Privacy" marked `aria-current`. It loads `assets/consult-form.js` for GA4 and the first touch. It covers the form and HubSpot, GA4, local storage, Global Privacy Control, retention, deletion requests, and services for students 13 and over with a parent's consent. The owner removed the list of services, the cookie names and the test-submission line before Gate 3 (Oct 6 2026). **Keep it true:** when tracking, a service, a cookie or a retention period changes, update the page and its "Last updated" date in the same commit.

## Guides (P5, Oct 2026)
Each guide is one self-contained file, [guides/&lt;slug&gt;/index.html](guides/what-your-psat-score-means/index.html), at `/guides/<slug>/`; [guides/index.html](guides/index.html) lists them (newest first). The first is the PSAT guide (G1, marketing asset A-202641-04). Paths are root-relative (`/assets/…`, `/brand/…`) because the pages sit two folders deep. A guide carries the home page's tokens it uses, its fonts request (no italic is set, so Newsreader's italic file is never fetched), the nav in its solid state (sticky, no video under it), the footer, the sticky CTA and the consult section word for word.

**Words.** Only the approved text from the guide's Markdown in marketing/content/guides/ (approval recorded in marketing/MARKETING-PLAN.md's Approval register). Formatting may change: list numbers are drawn by CSS, the H1 takes the site's closing period, the reviewers' [ALLAN CHECK]/[JON CHECK] markers go, source URLs become link targets. New interface words are kept to labels ("In this guide", "Send this page to a parent", "Email the link", "Copy the link", "Link copied.", the breadcrumb).

**Anatomy, top to bottom.**
- Breadcrumb (Home / Guides / short title; `aria-current` on the last), matched by the BreadcrumbList JSON-LD.
- H1; byline ("By Allan and Jon…", the names linking to `#authors`, "Last reviewed" in a `<time>`); the share control.
- The short answer (`.answer`): the guide's one large passage, Newsreader 20–23px on `--brand-tint`, its "The short answer." label set as a sans eyebrow with the brass diamond. It is the LCP element.
- Contents (`nav.toc` > `<details>`): a closed disclosure below 1024px; from 1024 open (script), sticky in a 200–260px column beside the 46rem article. The section being read gets the brass diamond and `aria-current` (an IntersectionObserver band at 25–35% of the viewport). The diamond hangs in the margin so items line up with the label.
- Sections: `h2` with ids (the contents link to them; `scroll-padding-top` clears the nav). Ordered lists hang serif numerals in `--brand-2`.
- Tables: rules only, no boxes, tabular numbers. The wide one (`table.stack`) stacks each row into a block below 720px (row header in the serif, value in 600 weight, explanation in `--ink-2`). Chromium keeps a block-displayed table's semantics (checked: identical accessibility tree at 375 and 1440); don't add ARIA table roles, the HTML spec forbids them on real table parts.
- FAQ (`#qa`): every answer visible (`h3` + `p`), word for word in the FAQPage JSON-LD.
- About the authors: text only (the owner's rule keeps coach photos to the home page, marketing D36), each coach under a 2px rule in his colour, as in the hero voices; the names link to `/#founders`.
- Sources: numbered, external links in a new tab with `rel="noopener"` and a screen-reader "(opens in a new tab)"; then the trademark notice (13.5px `--ink-3`).
- The consult section, unchanged from the home page, with `data-form-location="guide-<slug>"`.

**Send this page to a parent** (marketing experiment X-2, `share_to_parent`). With JS it is a button: the device's share sheet (`navigator.share`, the guide's title and canonical URL, no tags) where there is one; elsewhere a disclosure with "Email the link" (a `mailto:` with the title and URL) and "Copy the link" (clipboard; "Link copied.", or the URL itself if the clipboard is refused). Without JS, a plain `mailto:` link shows instead (`.share-mail`; the `.js` class from `<head>` swaps them). The event fires once per page, with `method` share, email or copy; closing the share sheet sends nothing, and nothing reaches us but the event.

**Head and structured data.** Title and description from the guide's notes; canonical; Open Graph `article` with the link preview (`media/guides/<slug>.png`, 1200×630, a 256-colour PNG downscaled from the 2× render in marketing/content/guides/), `article:published_time`/`modified_time`; the X card. One JSON-LD `@graph` at the end of `<body>`: the Organization (the home page's `@id`), the Article (headline = the H1 without its period, description = the meta description, image = the preview, the two Person authors with `jobTitle` "SAT tutor" and "College counselor", `worksFor` and `publisher` the Organization), the FAQPage and the BreadcrumbList. validator.schema.org: 0 errors, 0 warnings (Oct 7 2026); Google's Rich Results Test now needs a Google sign-in, so it runs on the live URL. **When a date or policy is re-checked**, change "Last reviewed", `dateModified`, `article:modified_time` and the sitemap's `lastmod` together.

**Adding a guide.** Copy the folder to the new slug; change the head, the `SLUG` and share title in the script, the share links, the contents, `data-form-location` and the JSON-LD; replace the article; add its card to guides/index.html, a `<url>` to sitemap.xml and a line to llms.txt; export its preview image; extend `website-revamp/tools/guide-test.mjs` (its `SLUG`) and run it.

**Measured** (Oct 7 2026, cold, compressed local server, median of 3): a phone at 375 on Fast 4G (150 ms, 9 Mbps) with a 4× CPU: FCP and LCP 0.75 s (the short answer), CLS 0, TBT 118 ms; desktop LCP 0.28 s. Before the load event: 180 KB (HTML 17 KB compressed, fonts 159 KB, consult-form.js 4 KB, no images). On the live site gtag.js follows 2 s after load, as on every page.

**Tests.** `node website-revamp/tools/guide-test.mjs [--shots <dir>]` against `aquinas-site` (12 tests): head and search tags; structured data against the visible page (headline, authors, every FAQ word, the breadcrumb trail); every link (internal answers 200, home-page anchors exist, no UTMs; external in a new tab); sitemap, robots and llms.txt; GA4 events once and free of form data; the form sending from the guide with its first touch; the share sheet, its fallback and no-JS; layout, contents, sticky bar, targets and axe at 375, 768 and 1440, for the guide and the index. HubSpot, GA4 and the meeting page are mocked.

## When editing
- Match existing patterns above before inventing new colors, fonts, radii, or shadows.
- Keep everything inline in `index.html` except the shared form script above; new pages (the guides, the privacy page) are self-contained HTML files. Splitting further into a real build (the Next.js migration) is a separate, larger task — confirm before restructuring.
- Never submit the consult form for real from a local server or a test: the live endpoint creates a HubSpot contact and emails Jon. The script refuses on localhost, and the tests mock HubSpot.
- Verify at 375 / 768 / 1440 widths before shipping.

## Copy conventions
- Allan and Jon are referred to as **coaches** in site copy (nav "Coaches", "two coaches", "both coaches"). Their role titles still read "Co-founder, …". The section anchor stays `#founders`.
