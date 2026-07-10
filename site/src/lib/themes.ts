/**
 * themes.ts — the 14 selectable theme presets, single source of truth.
 *
 * Consumed by two surfaces that can't share a runtime object directly
 * (one runs in the browser before first paint, the other prerenders
 * server-side):
 *
 *   Layout.astro  — injects this as `window.__T` (wrapped in hsl(), reshaped
 *                   to the anti-FOUC script's existing {l,d,s,name} contract
 *                   + additive bg/fg/pattern/patternTone/nav fields) so
 *                   preset switches apply instantly, no flash.
 *   design.astro  — imports THEMES directly at build time to render the
 *                   theme gallery: real <Pattern> components + declarative
 *                   light/dark CSS custom-property overrides, zero client JS
 *                   needed for the preview (only for the click-to-apply).
 *
 * Every color is a bare `"H S% L%"` triplet (no `hsl()` wrapper) — the same
 * convention design.astro's token editor already uses for stored picks.
 * Brand lightness stays in the same bands as the original 6 presets
 * (light ~22–38%, dark ~58–68%) so the mode-based fixed on-primary/
 * on-secondary/on-tertiary contrast (white on light-mode fills, black on
 * dark-mode fills) holds for all 10 without a per-theme contrast branch.
 * `font` stays the plain neutral grayscale in both modes for every theme —
 * only background/foreground get a hue tint — so body text contrast never
 * depends on which theme is active. Background/foreground saturation is
 * deliberately bold (18–42% light, 18–32% dark) — a themed page should read
 * as a different room, not a different sticker on the same room. Dark-mode
 * foreground sits ~5–6L above background (not the untinted default's 3L) to
 * keep the L1→L2 depth step legible once both surfaces share a saturated
 * hue — border/ring still derive from the untinted `font` token, so card
 * edges stay theme-independent even as fills lean into the palette.
 */

export interface ThemeColors {
  primary: string
  secondary: string
  tertiary: string
  background: string
  foreground: string
}

export interface ThemeDef {
  key: string
  name: string
  light: ThemeColors
  dark: ThemeColors
  /** Nav swatch dot fill — a representative mid-tone, not light/dark-specific. */
  swatch: string
  /** Signature texture — ties the theme to one of Pattern.astro's six shapes. */
  pattern: 'dots' | 'grid' | 'diagonal' | 'crosshatch' | 'noise' | 'hexagon'
  /** Which token inks the pattern — always the SAME accent the theme leads with. */
  patternTone: 'primary' | 'secondary' | 'tertiary' | 'font'
  patternFade?: boolean
  /** Shown in the header's quick-swatch row. All 10 are always selectable on /design. */
  nav?: boolean
  /**
   * Literal bitmap texture (e.g. `/patterns/subtle_carbon.webp`) layered onto
   * --color-foreground-filled L2 surfaces (.bg-foreground, focused dropdown/
   * select items) via the SAME --pattern-fg-image mechanism /patterns' picker
   * uses (see Layout.astro's __applyImagePatterns) — a theme-level default
   * that a manual /patterns pick still overrides. Independent of `pattern`
   * above, which only drives the ambient CSS-generated page texture.
   */
  foregroundImage?: string
  /** 0–1 opacity for foregroundImage. Omit to use the image at full strength. */
  foregroundImageOpacity?: number
}

export const THEMES: ThemeDef[] = [
  {
    key: 'navy',
    name: 'Navy',
    light: { primary: '216 55% 25%', secondary: '219 14% 28%', tertiary: '105 22% 25%', background: '216 20% 92%', foreground: '216 12% 99%' },
    dark: { primary: '216 55% 65%', secondary: '219 14% 65%', tertiary: '105 22% 65%', background: '216 24% 9%', foreground: '216 18% 15%' },
    swatch: '216 55% 35%',
    pattern: 'grid',
    patternTone: 'primary',
    nav: true,
  },
  {
    key: 'ocean',
    name: 'Ocean',
    light: { primary: '198 70% 28%', secondary: '175 55% 28%', tertiary: '210 80% 30%', background: '198 26% 93%', foreground: '198 14% 99%' },
    dark: { primary: '198 70% 62%', secondary: '175 55% 62%', tertiary: '210 80% 65%', background: '198 28% 8%', foreground: '198 22% 15%' },
    swatch: '198 60% 38%',
    pattern: 'dots',
    patternTone: 'secondary',
    patternFade: true,
    nav: true,
  },
  {
    key: 'forest',
    name: 'Forest',
    light: { primary: '140 45% 22%', secondary: '160 35% 26%', tertiary: '90 40% 24%', background: '140 20% 92%', foreground: '140 12% 99%' },
    dark: { primary: '140 45% 60%', secondary: '160 35% 62%', tertiary: '90 40% 60%', background: '140 24% 8%', foreground: '140 18% 14%' },
    swatch: '140 42% 30%',
    pattern: 'diagonal',
    patternTone: 'tertiary',
    patternFade: true,
    nav: true,
  },
  {
    key: 'sunset',
    name: 'Sunset',
    light: { primary: '24 75% 35%', secondary: '35 65% 38%', tertiary: '4 60% 35%', background: '24 32% 93%', foreground: '24 20% 99%' },
    dark: { primary: '24 75% 65%', secondary: '35 65% 65%', tertiary: '4 60% 65%', background: '24 24% 9%', foreground: '24 18% 15%' },
    swatch: '24 70% 42%',
    pattern: 'crosshatch',
    patternTone: 'primary',
    nav: true,
  },
  {
    key: 'violet',
    name: 'Violet',
    light: { primary: '268 55% 30%', secondary: '248 50% 35%', tertiary: '288 45% 30%', background: '268 24% 93%', foreground: '268 14% 99%' },
    dark: { primary: '268 55% 68%', secondary: '248 50% 68%', tertiary: '288 45% 68%', background: '268 28% 9%', foreground: '268 22% 15%' },
    swatch: '268 50% 40%',
    pattern: 'noise',
    patternTone: 'tertiary',
    nav: true,
  },
  {
    key: 'rose',
    name: 'Rose',
    light: { primary: '342 65% 35%', secondary: '320 50% 38%', tertiary: '14 60% 36%', background: '342 22% 94%', foreground: '342 14% 99%' },
    dark: { primary: '342 65% 68%', secondary: '320 50% 68%', tertiary: '14 60% 65%', background: '342 20% 9%', foreground: '342 16% 15%' },
    swatch: '342 60% 43%',
    pattern: 'dots',
    patternTone: 'primary',
    patternFade: true,
    nav: true,
  },
  {
    key: 'slate',
    name: 'Slate',
    light: { primary: '220 20% 30%', secondary: '220 10% 45%', tertiary: '199 40% 32%', background: '220 10% 94%', foreground: '220 6% 99%' },
    dark: { primary: '220 25% 68%', secondary: '220 12% 62%', tertiary: '199 45% 62%', background: '220 12% 9%', foreground: '220 10% 14%' },
    swatch: '220 20% 40%',
    pattern: 'grid',
    patternTone: 'font',
    nav: false,
  },
  {
    key: 'amber',
    name: 'Amber',
    light: { primary: '38 85% 32%', secondary: '20 60% 35%', tertiary: '150 30% 28%', background: '38 42% 93%', foreground: '38 28% 99%' },
    dark: { primary: '38 85% 62%', secondary: '20 60% 62%', tertiary: '150 30% 58%', background: '35 30% 9%', foreground: '35 24% 15%' },
    swatch: '38 80% 42%',
    pattern: 'dots',
    patternTone: 'primary',
    patternFade: true,
    nav: false,
  },
  {
    key: 'cyan',
    name: 'Cyan',
    light: { primary: '190 80% 32%', secondary: '230 40% 40%', tertiary: '160 55% 30%', background: '200 30% 94%', foreground: '200 18% 99%' },
    dark: { primary: '190 85% 58%', secondary: '230 45% 65%', tertiary: '160 55% 58%', background: '210 32% 7%', foreground: '210 26% 14%' },
    swatch: '190 75% 40%',
    pattern: 'crosshatch',
    patternTone: 'secondary',
    nav: false,
  },
  {
    key: 'terracotta',
    name: 'Terracotta',
    light: { primary: '14 55% 38%', secondary: '35 40% 40%', tertiary: '160 25% 28%', background: '30 36% 92%', foreground: '30 24% 99%' },
    dark: { primary: '14 55% 62%', secondary: '35 40% 62%', tertiary: '160 25% 55%', background: '20 26% 9%', foreground: '20 20% 15%' },
    swatch: '14 55% 45%',
    pattern: 'diagonal',
    patternTone: 'primary',
    patternFade: true,
    nav: false,
  },
  {
    // Sampled from a fintech portfolio-app mockup: deep eggplant card/page,
    // coral "up" accent, mint chart line + positive deltas.
    key: 'plum',
    name: 'Plum',
    // Light mode inverts the usual surface story: foreground (L2 — card
    // body, buttons, tabs, footer) carries the plum itself, not just a
    // tint of it — background (L1) stays a plain near-white shell around
    // it. --color-on-foreground (Layout.astro) auto-flips to white wherever
    // this lands, the same way on-primary does for brand fills.
    light: { primary: '291 42% 24%', secondary: '14 68% 42%', tertiary: '154 45% 30%', background: '291 14% 93%', foreground: '291 46% 20%' },
    dark: { primary: '291 45% 68%', secondary: '14 75% 66%', tertiary: '154 50% 62%', background: '291 38% 11%', foreground: '291 30% 17%' },
    swatch: '291 42% 40%',
    pattern: 'dots',
    patternTone: 'primary',
    patternFade: true,
    nav: false,
  },
  {
    // Vespio brand — amber double-V mark on black (vespio.ai/vespio-logo.svg
    // is #f5b417 ≈ 42° 92% 53%). Secondary/tertiary lean into near-black
    // graphite rather than a third hue — the brand is strictly two colors.
    // Dark mode runs a deep amber-black canvas (bg 3% / fg 8%) so the amber
    // reads as lit against near-true-black — the flagship look — while the
    // 5L L1→L2 step keeps cards legible above the page.
    key: 'vespio',
    name: 'Vespio',
    light: { primary: '42 95% 34%', secondary: '40 15% 18%', tertiary: '35 80% 28%', background: '45 30% 93%', foreground: '45 18% 99%' },
    dark: { primary: '42 95% 62%', secondary: '40 12% 62%', tertiary: '35 75% 60%', background: '42 28% 3%', foreground: '42 22% 8%' },
    swatch: '42 90% 45%',
    pattern: 'hexagon',
    patternTone: 'primary',
    patternFade: true,
    // The default theme (see Layout.astro/design.astro 'vespio' fallbacks) —
    // curated into the header row like the original 6, not gallery-only.
    nav: true,
  },
  {
    // Sampled from a moving-company client mockup (elitemoversca.com):
    // near-black header with serif wordmark, cream/beige page, white card,
    // silver-grey label ink. Warm near-neutral hue (36°) throughout instead
    // of a true grayscale — reads as brushed graphite/bronze, not cool
    // slate — with `crosshatch`'s woven diagonal lines standing in for a
    // subtle carbon-fiber texture (no bitmap asset needed).
    key: 'carbon',
    name: 'Carbon',
    light: { primary: '36 8% 22%', secondary: '38 5% 42%', tertiary: '32 22% 30%', background: '38 18% 90%', foreground: '38 12% 99%' },
    dark: { primary: '36 8% 66%', secondary: '38 6% 64%', tertiary: '32 24% 62%', background: '35 20% 8%', foreground: '35 16% 14%' },
    swatch: '36 8% 30%',
    pattern: 'crosshatch',
    patternTone: 'primary',
    patternFade: true,
    nav: false,
  },
  {
    // Strictly black / white — every brand + neutral tone is pure grayscale
    // (0% saturation), so nothing reads brown; only `background` keeps a
    // barely-there cream warmth (~40°, 8–10% sat) as the single soft note in
    // the palette, and only in light mode — dark mode goes true neutral black.
    // Deliberately inverts the usual L1→L2 step (foreground normally reads a
    // touch LIGHTER than background — see the file header comment) in BOTH
    // modes, not just light like Plum: L2 is always the theme's signature
    // near-black surface, textured with the real subtle_carbon.webp tile (a
    // fine dot weave) via `foregroundImage` rather than a Pattern.astro shape,
    // so it reads as an actual material instead of a CSS approximation. The
    // ambient page texture is `dots`, echoing that same weave at page scale.
    // Background stays the lighter cream/white L1 card + page tone in both
    // modes so the black L2 always has something to sit on top of.
    key: 'elite',
    name: 'Elite',
    light: { primary: '0 0% 10%', secondary: '0 0% 42%', tertiary: '0 0% 28%', background: '40 12% 93%', foreground: '0 0% 7%' },
    dark: { primary: '0 0% 90%', secondary: '0 0% 64%', tertiary: '0 0% 78%', background: '0 0% 9%', foreground: '0 0% 4%' },
    swatch: '0 0% 20%',
    pattern: 'dots',
    patternTone: 'primary',
    patternFade: true,
    foregroundImage: '/patterns/subtle_carbon.webp',
    nav: false,
  },
]
