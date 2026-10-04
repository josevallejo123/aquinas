# Website Design & Architecture Reference

Single-file site: [index.html](index.html) — inline `<style>`, no build step, no framework yet (CLAUDE.md's Next.js stack is the future rebuild target, not current state).

**CSS is mobile-first.** Base styles target phones (~375px); enhancements layer on at `min-width:720px` (tablet), `880px` (full nav appears, sticky mobile CTA hides) and `1024px` (desktop two-column layouts). Add new rules in that order — never reintroduce `max-width` overrides.

## Tokens (CSS vars in `:root`)
Oct 2026 revamp: the palette is built from the logo's one ink, navy **#10273E** (hue 210). Hex values live only in `:root`; everything else (CSS, inline SVG, chart scripts) uses a token, and alpha variants are `color-mix(in srgb, var(--token) N%, transparent)`.
- **Navy (brand):** `--brand` #10273E (the logo's navy: all text via `--ink`, primary buttons, dark sections: dashboard, consult box, Flagship head) · `--brand-deep` #0A1828 (footer; `--scrim` over the video) · `--brand-hover` #1B3753 · `--brand-2` #285F9C (harbour blue: links, selected states, focus on light, chart highlight) · `--brand-3` #5E97D8 (second chart series, projected band) · `--brand-tint` #E0E8F0 (tinted panels, Flagship band).
- **Neutrals (cool fog):** `--bg` #F1F4F7 (page) · `--paper` #FFF (cards, alternate sections) · `--wash` #E4EAF0 (tracks, segmented control) · `--line` #D8E0E8 / `--line-2` #BCC8D4 (decorative rules only) · `--edge` #71849A (every UI boundary that must read: inputs, selects, checkboxes, selected segment, "not included" dash). Cool, not warm: they continue the Sept refresh's "mist, not cream", take their tint from the navy so the page reads as one ink, and leave the golden-hour video as the only warm field.
- **Text:** `--ink` (= `--brand`), `--ink-2` #38506A, `--ink-3` #51657B; on navy `--on-dark` #FFF, `--on-dark-2` #C5D2DF, `--on-dark-3` #A3B3C3.
- **Accent (the only one): brass.** `--accent` #DDB15A is the lamp: diamond markers, eyebrows and numerals on navy, the keystone badge, focus rings on navy and over the video, the primary button on navy or video (`.on-dark .btn-primary`, navy text). `--accent-d` #94671A is the same brass dark enough for light surfaces: the price line, the dashboard target line and label, the fit-helper match outline. Never body text on light.
- **Coaches (D10, placeholders until the photos go in):** `--allan` (= `--brand-2`) with `--allan-l`; `--jon` #8E3B34 claret with `--jon-l`.
- **Status (meanings unchanged):** `--green`/`--green-l` on track, `--amber`/`--amber-l` close, `--red`/`--red-l` stretch; red also marks the dashboard's priority badges, timing figure and form errors.
- **Charts:** `--chart-hi` (= `--brand-2`), `--chart-2` (= `--brand-3`), `--chart-total` (= `--brand`), `--chart-muted` #A7B5C4 (context bars), `--chart-ref` (= `--accent-d`). Checked with the dataviz validator: harbour vs brass ΔE 22.3, Math vs Reading and Writing ΔE 18.5 (both clear the CVD target 8 and the normal-vision floor 15); the waterfall's gain → total pair passes as a one-hue ordinal ramp.
- `--focus` is set per surface: `--brand-2` on light, `--accent` on navy, the footer and over the video.
- Fonts: `--serif` = Newsreader (headings, numbers, chips; replaced Fraunces in Sept 2026 because its hooked "f" and curly "4" read as too quirky), `--sans` = Instrument Sans (body/UI). Kept in the revamp: they sit well against the logo's spaced geometric capitals without imitating them, and the dashboard's pinned fonts (D8) cost nothing extra. Scale: `--fs-h1` clamp(36→64px), `--fs-h2` clamp(30→50px), `--fs-h3` 22px; body 16.5 / 17 / 17.5px by breakpoint.
- Radius: `--r-sm` 10, `--r` 14, `--r-lg` 20. `--arch` = arched-window radius. Shadows: `--shadow`, `--shadow-lg` (navy-tinted). Easing: `--ease`
- Layout: `--wrap` 1200px, `--gutter` 20px mobile / 32px ≥720 (`.wrap` also respects the safe-area insets), `--nav-h` 64px mobile / 76px ≥880

## Signature & conventions
- **Logo** (`brand/`, made by `website-revamp/tools/brand.py`): the nav uses the horizontal lockup cut from `logo-final.png` (symbol beside the two-line wordmark), 36px tall on phones and 40px ≥880, WebP in `<picture>` with a PNG fallback and @2x. Over the hero the nav is transparent with `logo-horizontal-reverse`; once the hero stage's bottom edge passes under the nav (IntersectionObserver on `.hero-end`, class `.over` on `#nav`) it turns solid fog glass with `logo-horizontal-navy`; it is also solid while the menu is open. Without JS it is always solid (`.over` styles need the `.js` class set in `<head>`). The footer uses `logo-stacked-reverse` (96px). The link keeps `aria-label="Lighthouse Prep, back to top"`; the first logo image has `alt="Lighthouse Prep"`, its duplicate `alt=""`. Never redraw or restyle the symbol; a live-text wordmark is an approved alternative (D5), compared in `website-revamp/review/assets/nav-logo-compare.png`.
- **The arch** (collegiate window) stays where it means something: the coach portraits and the Flagship column's head and band in the pricing matrix. It is not used on the video. Don't add other decorative shapes.
- **Favicon**: the logo's three-stripe lighthouse symbol, traced as polygons, in fog `#F1F4F7` (`--bg`) on a navy `#10273E` rounded tile (`favicon.svg`). `favicon-32.png`, `favicon.ico` (16/32/48) and the full-bleed square `apple-touch-icon.png` (180; iOS rounds it) are rendered from the same trace by `website-revamp/tools/brand.py` (project root), so re-run that script if the symbol or its colours change, and keep `theme-color` equal to `--bg`.
- **Brass diamond** (7px rotated square) is the only list/marker glyph: eyebrows, hero meta, credential strip.
- Eyebrows are **sentence case** (no uppercase/tracking anywhere on the site except inside the logo artwork): `--ink-2` on light, brass on navy, white over the video.
- Newsreader: `font-variation-settings:"opsz" 72` (axis max) for display, `"opsz" 24–36` for small serif text. Vary opsz, not weight. It sets larger than Fraunces did, so size headings down rather than up.
- Two-coach colour coding: **`--allan` (harbour blue) = Allan**, **`--jon` (claret) = Jon**: monograms, lane rules, tick circles, "With Allan/Jon" labels, roles, portraits, the voice rules. Placeholders until the coaches' photos go in (D10). Hero voices are `.voice` blocks (A / J monograms + shared-plan line with the two-ring icon, rings coloured by `.ring-a`/`.ring-j`) — keep that structure if hero copy changes.
- Buttons: pill (`999px`), min-height 48px. `.btn-primary` is navy on light and brass with navy text on navy or over the video (`.on-dark` ancestor; the nav's button turns brass while the nav is over the hero). `.btn-ghost` is a navy outline on light and a white outline on a light scrim over the video. No new shapes.
- Sections: `padding` 64 → 88 → 112px by breakpoint; content in `.wrap`. Anchored sections clear the fixed nav via `scroll-padding-top`. Rhythm: video stage → fog → paper strip → fog … → navy dashboard → fog → paper → fog → navy consult box → deep-navy footer.
- Status pills (`.pill.green/.amber/.red`) are the only semantic colour usage.
- Decoration is cut to one echo of the lamp: the faint brass rings in the consult box. No gradient washes (the dashboard's old gold glow is gone).
- Motion: the CSS hero load sequence was removed in the Oct 2026 revamp (Prompt 3 rebuilds hero and chart motion with GSAP and rewrites this line). Still here: the dashboard's chart draw / skill-bar fill and user-triggered transitions. **No scroll-reveal fade-ins** and no hover lifts on cards. Everything respects `prefers-reduced-motion`.

## Hero (video stage)
- `.hero` = `.hero-stage` (full-bleed, `min-height:100svh`, copy bottom-aligned) + `.hero-lead` (the voices, on fog below the stage).
- `.hero-media` holds the poster `<picture>` (phone crop for `max-aspect-ratio: 3/4`, desktop otherwise; WebP, JPG fallback, `fetchpriority=high`, preloaded with matching `media`) and `<video id="heroVideo" muted playsinline loop autoplay preload="metadata">`, both `aria-hidden`. The source is picked in the main script by the same aspect query; reduced motion skips autoplay. The poster is the LCP element; the video never is.
- Scrim: a navy band under the nav and a light overall calm (`.hero-media::after`), plus a shade that follows the copy block (`.hero-grid::before`, phones and tablets) so it covers the text however many lines it wraps to. ≥1024 the copy sits lower-left under a left-to-right gradient instead, and the float cards sit to its right inside the stage. Measured numbers are in the contrast section; re-measure with `node website-revamp/tools/hero-contrast.mjs [--frames]` after any change to the hero's layout or scrim.
- Pause/play: `#heroToggle`, 44px, visible whenever JS runs, label switches between "Pause background video" and "Play background video" from the video's own `play`/`pause` events (WCAG 2.2.2). Top-right under the nav on phones, bottom-right ≥720.
- Float cards (`.hero-cards`, D1) hang 58px over the stage's bottom edge on phones and tablets; ≥1024 they float right of the copy.

## Mobile patterns (keep these when editing)
- Sticky bottom CTA (`.mcta`, <880px): appears once the hero buttons leave view; hides over the consult form, footer, and while the menu is open. Uses safe-area insets.
- Nav: 44px icon button → dropdown sheet with 52px rows; closes on link tap, outside tap, Escape. Over the hero the button is a white outline on a navy scrim.
- Hero order on phones: video stage (eyebrow → headline → CTAs → meta, float cards straddling its bottom edge) → coaches' voices on fog.
- Dashboard: KPIs in a 2×2 grid, remaining cards in a horizontal scroll-snap rail (`.dash-rail`, 88% cards, dot indicator). ≥720 the rail becomes `display:contents` and the 12-col grid takes over.
- Chart SVG renders at its container's real pixel width (re-renders on resize) so labels stay legible; points have 18px invisible hit circles.
- Method stepper is a horizontal 1–5 row on phones, vertical list ≥1024.
- Pricing is a comparison matrix (`.mx`, ARIA table roles on divs). One CSS grid; each `.mx-row` is a `subgrid` so columns align. The Flagship column is `.mx-band` (absolutely positioned in its grid area, so it doesn't block auto-placement) capped by an arched navy `.mx-head.f` with a brass `.keystone` badge, on a `--brand-tint` band with a faint brass outline. Keep `--rows` on `.mx` equal to the number of `.mx-row`s. Phones: the same 4-column sheet as desktop (label column + 3 program columns sized `clamp(58px,17vw,68px)`), so the whole grid fits without sideways scroll down to 320px. Header names and labels scale down slightly on narrow screens; descriptors and the CTA row are hidden (sticky CTA covers it). Never stack labels above values: the Flagship band would cut through the text. ≥720: roomier columns, descriptors and CTA row shown. Fit helper outlines the matching `.mx-head` via `.match` (`--accent-d`).
- All touch targets ≥44px; form inputs/selects are 16px to prevent iOS zoom.

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
| `--on-dark` #FFFFFF | `--brand-2` #285F9C | 6.55 | 4.5 | Mono A, checked box tick |
| `--on-dark` #FFFFFF | `--jon` #8E3B34 | 7.43 | 4.5 | Mono J, Jon portrait |
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
| `--red` #A13328 | `--red-l` #F7E3DF | 5.63 | 4.5 | Pill: stretch, priority badges |
| `--red` #A13328 | `--paper` #FFFFFF | 6.95 | 4.5 | Timing figure |
| `--edge` #71849A | `--bg` #F1F4F7 | 3.48 | 3 | UI: input, select and textarea borders on fog |
| `--edge` #71849A | `--paper` #FFFFFF | 3.84 | 3 | UI: checkbox and select borders on cards |
| `--edge` #71849A | `--wash` #E4EAF0 | 3.17 | 3 | UI: selected segment ring |
| `--edge` #71849A | `--brand-tint` #E0E8F0 | 3.10 | 3 | UI: "not included" dash on the Flagship band |
| `--brand-2` #285F9C | `--bg` #F1F4F7 | 5.93 | 3 | UI: focus ring on fog |
| `--brand-2` #285F9C | `--paper` #FFFFFF | 6.55 | 3 | UI: focus ring on paper, checked box |
| `--brand-2` #285F9C | `--brand-tint` #E0E8F0 | 5.29 | 3 | UI: selected skill ring |
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

Text over the video is white; the brass button's text is navy on solid brass (7.61). A control's edge counts its light ring on dark footage or its dark fill on bright footage, whichever is higher. With `--frames` the same scrim was also measured on one frame from each of the loop's five shots: everything passes, the lowest being the desktop headline on the Harvard and aerial shots (3.94, target 3). Focus over the video is a brass ring on an 8px navy halo (85% `--scrim`), so the ring always sits on navy (at least 6.7:1 even over a white pixel).

## When editing
- Match existing patterns above before inventing new colors, fonts, radii, or shadows.
- Keep everything inline in `index.html` unless the user asks to split into a real build (Next.js migration is a separate, larger task — confirm before restructuring).
- Verify at 375 / 768 / 1440 widths before shipping.

## Copy conventions
- Allan and Jon are referred to as **coaches** in site copy (nav "Coaches", "two coaches", "both coaches"). Their role titles still read "Co-founder, …". The section anchor stays `#founders`.
