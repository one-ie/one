/**
 * The contrast label for a brand fill.
 *
 * VENDORED from `one.ie/web/src/lib/puck/surface-chrome.ts`. This package is
 * published to npm and rendered on external sites, so it cannot use the `@/`
 * alias — the copy is intentional. What is NOT intentional is drift, and this
 * file existed as drift: every block here emitted `text-on-primary` for ALL
 * THREE brand tokens, so a `secondary` or `tertiary` fill got the `primary`
 * contrast label and the text could land unreadable on its own background.
 *
 * Keep the MAPPING identical to the upstream module. The class strings must stay
 * static literals — Tailwind cannot see `text-on-${token}` and compiles it to
 * nothing, which is how text ends up the same colour as the fill it sits on.
 */
export type BrandToken = 'primary' | 'secondary' | 'tertiary'

export const ON_TEXT: Record<BrandToken, string> = {
  primary: 'text-on-primary',
  secondary: 'text-on-secondary',
  tertiary: 'text-on-tertiary',
}

const BRAND = new Set<string>(['primary', 'secondary', 'tertiary'])

export const isBrand = (t?: string | null): t is BrandToken => !!t && BRAND.has(t)

/** A token that paints something. `'none'`/absent means "leave the background alone". */
export const isFilled = (t?: string | null): boolean => !!t && t !== 'none'

/**
 * The contrast label for a fill. Empty string for a non-brand fill (background /
 * foreground already sit under `text-font`) so it concatenates safely.
 */
export const onText = (t?: string | null): string => (isBrand(t) ? ON_TEXT[t] : '')
