# Website Design & Architecture Reference

Single-file site: [index.html](index.html) — inline `<style>`, no build step, no framework yet (CLAUDE.md's Next.js stack is the future rebuild target, not current state).

**CSS is mobile-first.** Base styles target phones (~375px); enhancements layer on at `min-width:720px` (tablet), `880px` (full nav appears, sticky mobile CTA hides) and `1024px` (desktop two-column layouts). Add new rules in that order — never reintroduce `max-width` overrides.

## Tokens (CSS vars in `:root`)
- Colors: `--ink` #14272B (text), `--ink-2`/`--ink-3` (muted), `--teal` #1E5660 (primary/Allan), `--teal-d`, `--evergreen` #0E3439 (dark sections: dashboard, consult), `--teal-l` (tinted panels), `--brick` #A6452E (Jon only), `--brick-l`, `--gold` #C9973A (markers, highlights, outlines), `--gold-l`, `--denim`, `--bg` #F2F4F1 (page — cool mist, not cream), `--paper` #FFF (cards), `--wash` (tracks/segmented bg), `--line`/`--line-2` (borders), `--green`/`--amber` (status pills)
- Fonts: `--serif` = Newsreader (headings, numbers, chips, brand; replaced Fraunces in Sept 2026 because its hooked "f" and curly "4" read as too quirky), `--sans` = Instrument Sans (body/UI)
- Radius: `--r-sm` 10, `--r` 14, `--r-lg` 20. `--arch` = arched-window radius (hero photo). Shadows: `--shadow`, `--shadow-lg`. Easing: `--ease`
- Layout: `--wrap` 1200px, `--gutter` 20px mobile / 32px ≥720, `--nav-h` 64px mobile / 76px ≥880

## Signature & conventions
- **The arch** is the brand motif (collegiate window): hero photo uses `--arch` with a 1px gold `outline` offset; founder portraits use the same arch shape. Reuse it for any new hero-level image; don't add other decorative shapes.
- **Gold diamond** (7px rotated square) is the only list/marker glyph: eyebrows, hero meta, credential strip, tier bullets.
- Eyebrows are **sentence case** (no uppercase/tracking anywhere on the site) — the same applies to small labels, badges and card headings.
- Newsreader: `font-variation-settings:"opsz" 72` (axis max) for display, `"opsz" 24–36` for small serif text. Vary opsz, not weight. It sets larger than Fraunces did, so size headings down rather than up.
- Two-coach color coding: **teal = Allan**, **brick = Jon**. Hero lead is split into `.voice` blocks (A / J monograms + shared-plan line with the two-ring icon) — keep that structure if hero copy changes.
- Buttons: pill (`999px`), min-height 48px. `.btn-primary` (teal) vs `.btn-ghost` (outline). No new shapes.
- Sections: `padding` 64 → 88 → 112px by breakpoint; content in `.wrap`. Anchored sections clear the fixed nav via `scroll-padding-top`.
- Status pills (`.pill.green/.amber/.red`) are the only semantic color usage.
- Motion: one orchestrated hero load sequence + chart draw / skill-bar fill + user-triggered transitions. **No scroll-reveal fade-ins** and no hover lifts on cards. Everything respects `prefers-reduced-motion`.

## Mobile patterns (keep these when editing)
- Sticky bottom CTA (`.mcta`, <880px): appears once the hero buttons leave view; hides over the consult form, footer, and while the menu is open. Uses safe-area insets.
- Nav: 44px icon button → dropdown sheet with 52px rows; closes on link tap, outside tap, Escape.
- Hero order on phones: headline → arched photo (float cards sit below its edge) → founder voices → CTAs.
- Dashboard: KPIs in a 2×2 grid, remaining cards in a horizontal scroll-snap rail (`.dash-rail`, 88% cards, dot indicator). ≥720 the rail becomes `display:contents` and the 12-col grid takes over.
- Chart SVG renders at its container's real pixel width (re-renders on resize) so labels stay legible; points have 18px invisible hit circles.
- Method stepper is a horizontal 1–5 row on phones, vertical list ≥1024.
- Pricing is a comparison matrix (`.mx`, ARIA table roles on divs). One CSS grid; each `.mx-row` is a `subgrid` so columns align. The Flagship column is `.mx-band` (absolutely positioned in its grid area, so it doesn't block auto-placement) capped by an arched teal `.mx-head.f` with a gold `.keystone` badge. Keep `--rows` on `.mx` equal to the number of `.mx-row`s. Phones: 3 value columns, row label spans above the values, CTA row hidden (sticky CTA covers it). ≥720: label column + 3 columns, CTA row shown. Fit helper outlines the matching `.mx-head` via `.match`.
- All touch targets ≥44px; form inputs/selects are 16px to prevent iOS zoom.

## Content/UX rules
- Prices are always visible per [CLAUDE.md](../CLAUDE.md) rule 3 — never gate behind "call for pricing".
- No outcome guarantees in copy (CLAUDE.md rule 1) — check any new headline/testimonial copy against this.
- Keep WCAG 2.1 AA contrast (ink-3 on bg ≈ 5:1; gold is never used for body text on light backgrounds).

## When editing
- Match existing patterns above before inventing new colors, fonts, radii, or shadows.
- Keep everything inline in `index.html` unless the user asks to split into a real build (Next.js migration is a separate, larger task — confirm before restructuring).
- Verify at 375 / 768 / 1440 widths before shipping.

## Copy conventions
- Allan and Jon are referred to as **coaches** in site copy (nav "Coaches", "two coaches", "both coaches"). Their role titles still read "Co-founder, …". The section anchor stays `#founders`.
