---
name: shadcn
description: shadcn/ui under the ONE 6-token design system — CSS var tokens only, no hex, add components via the CLI. Invoke when editing src/components/ui/ or adding a primitive.
---

# shadcn/ui in the ONE design system

The 33 primitives in `src/components/ui/` are vendored shadcn. They are styled by the **6-token system** — they reference CSS vars, never literal colors.

## The token rule

Components use `bg-background`, `text-font`, `border-border`, `bg-primary text-on-primary`, etc. These map to `--color-*` declared in `Layout.astro`. **Never** a hex literal, raw `hsl()`, or a Tailwind palette utility (`bg-zinc-500`) — the `design-check` hook blocks them.

Muted text: `text-font/60`. Faint: `text-font/40`. Borders: `border-font/10`.

## Adding a component

```bash
bunx shadcn@latest add dialog
```

Then sweep the generated file: replace any `bg-zinc-*` / hardcoded colors with the 6-token equivalents before committing. The `design-check` hook will flag what you miss.

## Don't

- Don't add ONE/SDK imports into `ui/` — primitives stay pure and portable.
- Don't introduce a 7th color token — compose from the 6 + invariants (white/black/transparent/destructive/success).
