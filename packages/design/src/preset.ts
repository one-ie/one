/**
 * ONE Design preset — the typed surface over the 6-token system.
 *
 * Tailwind v4 reads @theme from CSS, not from a JS object, so this is NOT a
 * runtime Tailwind plugin. It provides:
 *   - createPreset(tokens?) → a typed { colors } map for tooling, tests, and
 *     editors that need the resolved token values.
 *   - generateThemeCSS(tokens) → the @theme CSS block (the real Tailwind input),
 *     wrapping renderThemeBlock from tokens.ts.
 *
 * Layout.astro remains the single token source. Auto-injecting brand.tokens
 * into the @theme block at build time is a separate concern (a CSS-emitting
 * Astro hook) — not part of this preset.
 */
import { defaultTokens, renderThemeBlock, type DesignTokens } from './tokens'

export interface OnePreset {
  /** Resolved token name → CSS color value (e.g. { primary: 'hsl(216 55% 25%)' }). */
  colors: Record<keyof DesignTokens, string>
}

/**
 * createPreset — resolve a (possibly partial) token set against the defaults
 * and return a typed color map. The 6 keys are always present.
 */
export function createPreset(tokens: Partial<DesignTokens> = {}): OnePreset {
  const t = { ...defaultTokens, ...tokens }
  return {
    colors: {
      background: t.background,
      foreground: t.foreground,
      font: t.font,
      primary: t.primary,
      secondary: t.secondary,
      tertiary: t.tertiary,
    },
  }
}

/**
 * generateThemeCSS — the @theme CSS block Tailwind v4 actually consumes.
 * Thin wrapper over renderThemeBlock so the package has one named CSS export.
 */
export function generateThemeCSS(tokens: DesignTokens = defaultTokens): string {
  return renderThemeBlock(tokens)
}
