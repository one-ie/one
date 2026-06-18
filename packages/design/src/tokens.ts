/**
 * ONE Design System — 6 extractable tokens.
 * Extracted from one.ie/web/src/layouts/Layout.astro @theme block.
 *
 * These are the ONLY colors a user can pick (via one.config.ts brand.tokens).
 * The 5 invariants (white/black/transparent/destructive/success) are locked.
 * Derived helpers (border/page/on-*) are computed from these 6.
 */

export interface DesignTokens {
  /** Card surfaces, sidebars, page-level panels (L1) */
  background: string
  /** Inner content rectangles inside cards (L2) */
  foreground: string
  /** All body text */
  font: string
  /** Main CTAs, brand accents, focus rings */
  primary: string
  /** Supporting actions, secondary buttons */
  secondary: string
  /** Highlights, success checks, accents */
  tertiary: string
}

export const defaultTokens: DesignTokens = {
  background: 'hsl(0 0% 93%)',
  foreground: 'hsl(0 0% 100%)',
  font: 'hsl(0 0% 13%)',
  primary: 'hsl(216 55% 25%)',
  secondary: 'hsl(219 14% 28%)',
  tertiary: 'hsl(105 22% 25%)',
}

/** Render the 6-token @theme block for a given token set */
export function renderThemeBlock(tokens: Partial<DesignTokens> = {}): string {
  const t = { ...defaultTokens, ...tokens }
  return `
  @theme {
    --color-*: initial;

    --color-white: #fff;
    --color-black: #000;
    --color-transparent: transparent;
    --color-current: currentColor;
    --color-destructive: hsl(0 70% 50%);
    --color-success: hsl(140 60% 40%);

    --color-background: ${t.background};
    --color-foreground: ${t.foreground};
    --color-font: ${t.font};
    --color-primary: ${t.primary};
    --color-secondary: ${t.secondary};
    --color-tertiary: ${t.tertiary};

    --color-on-primary: #fff;
    --color-on-secondary: #fff;
    --color-on-tertiary: #fff;

    --color-popover: var(--color-background);
    --color-popover-foreground: var(--color-font);
    --color-card: var(--color-background);
    --color-card-foreground: var(--color-font);
    --color-muted: var(--color-foreground);
    --color-muted-foreground: color-mix(in oklab, var(--color-font) 60%, transparent);
    --color-accent: var(--color-foreground);
    --color-accent-foreground: var(--color-font);
    --color-input: var(--color-background);
  }`.trim()
}
