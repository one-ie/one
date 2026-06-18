# @oneie/design

6-token Tailwind 4 design preset for ONE-connected sites. Brand everything with config, not CSS edits.

```ts
// tailwind.config.ts
import { createPreset } from '@oneie/design'

export default {
  presets: [createPreset({
    primary:    'hsl(216 55% 25%)',
    secondary:  'hsl(219 14% 28%)',
    tertiary:   'hsl(105 22% 25%)',
    background: 'hsl(0 0% 93%)',
    foreground: 'hsl(0 0% 100%)',
    font:       'hsl(0 0% 13%)',
  })],
}
```

The preset maps the 6 tokens to CSS variables consumed by shadcn/ui components. Swap all six and the entire site rebrands.

## Exports

- `createPreset(tokens)` — Tailwind preset
- `generateThemeCSS(tokens)` — raw CSS variable string (for `<style>` injection)
- `tokens` — default token values
