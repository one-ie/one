# CLAUDE.md — web/src/components/

Directory contract for the web component library. All React components for the ONE web UI live here.

---

## Structure

```
components/
├── ui/                    # Design system primitives (6 tokens + invariants)
│   ├── Button.tsx         # 6 variants (primary, secondary, tertiary, outline, ghost, inverse)
│   ├── Card.tsx           # Depth-aware container (L0/L1/L2)
│   ├── Drawer.tsx         # Right-slide modal with deep-link support (?drawer=<id>)
│   ├── EmptyCard.tsx      # Placeholder with icon + CTA
│   ├── Input.tsx          # Sunken field (L2 on card body)
│   ├── Icon.tsx           # Lucide wrapper, currentColor
│   ├── IconBadge.tsx      # Colored icon container (primary/secondary/tertiary/neutral)
│   ├── Badge.tsx          # Status or metadata badge
│   └── ...                # Additional primitives as needed
│
├── cards/                 # 13 ONE card types (all export CardProps from @/lib/cards)
│   ├── AgentPreviewCard.tsx
│   ├── DeployStatusCard.tsx
│   ├── ResultCard.tsx
│   ├── VerifyCard.tsx
│   ├── PriceCard.tsx
│   ├── SkillToggleRow.tsx
│   ├── CompareCard.tsx
│   ├── OnboardingChecklist.tsx
│   ├── MarketplaceMini.tsx
│   ├── TraceMini.tsx
│   ├── ChoiceChips.tsx
│   └── ...                # Additional card types
│
├── chat/                  # Chat UI (bottom-right dock + streaming)
│   ├── ChatDock.tsx       # Persistent panel widget, cmd-K trigger
│   ├── MessageRenderer.tsx # Dispatch {kind:'text'|'card'|'chips'} frames
│   ├── MessageList.tsx    # Scrollable thread (lazy-loaded)
│   ├── InputArea.tsx      # Text + attachments + submit
│   └── ...
│
├── agents/                # Agent-specific UI
│   ├── AgentDrawer.tsx    # Agent details panel (right sidebar)
│   ├── AgentGrid.tsx      # Marketplace grid view
│   └── ...
│
├── skills/                # Skill management UI
│   ├── SkillDrawer.tsx
│   ├── SkillGallery.tsx
│   └── ...
│
├── tools/                 # Tool UI components
│   └── ...
│
├── payments/              # Payment/escrow UI
│   ├── EscrowBadge.tsx    # Reads Sui, shows lock state
│   ├── PriceSelect.tsx
│   └── ...
│
├── settings/              # Settings panels
│   ├── SettingsDrawer.tsx
│   ├── BrandPalette.tsx   # Token editor (6 tokens)
│   └── ...
│
├── auth/                  # Authentication UI
│   ├── PasskeyKeepThis.tsx # WebAuthn ceremony
│   └── ...
│
├── nav/                   # Navigation
│   ├── Sidebar.tsx        # Primary nav
│   ├── Header.tsx
│   └── ...
│
└── showcase/              # Design system showcase
    ├── BrandPaletteShowcase.tsx
    ├── ComponentGrid.tsx
    └── ...
```

---

## Rules

### Design Tokens (Locked — No Exceptions)

Every component uses the 6-token system + 5 invariants. **No hex literals. No Tailwind palette classes.**

**6 editable tokens:**
- `background` — Card surfaces, sidebars
- `foreground` — Inner content rectangles
- `font` — All body text
- `primary` — Main CTAs, brand accents
- `secondary` — Supporting actions
- `tertiary` — Highlights, success

**5 invariants:**
- `white` · `black` · `transparent` · `destructive` (errors) · `success` (confirms)

**Derived helpers (auto-computed):**
- `on-primary`, `on-secondary`, `on-tertiary` — auto-contrast labels
- `border`, `border-strong`, `muted`, `faint`, `ring`, `page`

See `.claude/rules/design.md` for enforcement details. The build itself strips Tailwind's default palette via `--color-*: initial` in `Layout.astro` — wrong colors emit no CSS.

### UI Signals (Every onClick)

Every interactive onClick MUST call `emitClick('ui:<surface>:<action>')` before the local handler.

```tsx
import { emitClick } from '@/lib/ui-signal'

<Button onClick={() => {
  emitClick('ui:chat:copy')
  handleCopy()
}}>
  Copy
</Button>
```

**Receiver naming:** `ui:<surface>:<action>` where surface is the component/page name (lowercase) and action is an intent verb.

**Valid surfaces:** `chat`, `settings`, `memory`, `demo`, `marketplace`, etc. (case-sensitive in the docs, lowercase in code).

**Exemptions:** Purely visual toggles (accordion, tooltip) with no semantic meaning, or internal navigation via `router.push`.

See `.claude/rules/ui.md` for the full contract.

### Card Components (CardProps Contract)

All card types in `cards/` accept `CardProps` from `@/lib/cards`:

```tsx
import { CardProps } from '@/lib/cards'

interface AgentPreviewCardProps extends CardProps {
  agent: Agent
  onSelect?: (id: string) => void
}

export function AgentPreviewCard({ agent, onSelect, className }: AgentPreviewCardProps) {
  return <Card className={cn('...', className)}>
    {/* card body */}
  </Card>
}
```

`CardProps` includes: `className?`, `onClick?`, and any rendering flags. This ensures all cards compose consistently.

### Heavy Components (Lazy Import Rule)

These modules are large and should ONLY be imported via `lazy()` + `Suspense` inside `client:*` islands:

| Module | Size | When to lazy |
|--------|------|------------|
| `@/components/ai-elements/attachments` | ~281 KB | File picker or preview needed |
| `@/components/ai-elements/speech-input` | ~180 KB | Voice recording triggered |
| `@/components/ai-elements/voice-menu` | ~140 KB | Voice menu opened |
| `@/components/payments/PayPanel` | ~120 KB | Payment flow initiated |
| `@/components/chat/MessageList` | ~95 KB | Chat history visible |

**Pattern:**

```tsx
const MessageList = lazy(() =>
  import('@/components/chat/MessageList')
    .then(m => ({ default: m.MessageList })))

// Inside JSX:
<Suspense fallback={null}>
  <MessageList messages={messages} />
</Suspense>
```

**Why:** These modules are NOT on the critical path. Lazy-loading them keeps the initial island hydration fast. Shipping 281 KB in the initial island bundle blocks FCP/LCP and fails Lighthouse.

### Component Exports (Named, Always Typed)

```tsx
// Good
interface Props {
  agent: Agent
  onSelect?: (id: string) => void
}

export function AgentCard({ agent, onSelect }: Props) {
  return (...)
}

// Bad
export default function AgentCard(props: any) {
  return (...)
}
```

- Always use named exports (not default)
- Always type `Props` interface
- Never use `any`

### Styling (Tailwind 4 Only, Via Tokens)

```tsx
// Good — token-based
<button className="bg-primary text-on-primary">Click</button>
<div className="bg-background border rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
  Content
</div>

// Bad — palette, hex, or raw hsl/rgb
<button className="bg-zinc-950">Click</button>
<div style={{ color: '#0a0a0f' }}>Bad</div>
```

Use `cn()` from `@/lib/utils` for conditional classes:

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className  // allow override via prop
)} />
```

### Icons (Lucide Only, No Inline SVG)

```tsx
// Good
import { Send, Zap } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { IconBadge } from '@/components/ui/IconBadge'

<Icon icon={Send} size="md" />
<IconBadge icon={Zap} tone="primary" size="md" />

// Bad — no inline SVG or unicode glyphs
<svg viewBox="...">...</svg>
☀ ☾ ▾ ✓ ✗
```

`Icon` sizes: `sm` 14 · `md` 16 · `lg` 20 · `xl` 24. Stroke locked to 1.5.
`IconBadge` tones: `primary` · `secondary` · `tertiary` · `neutral`.

### Forms (Sunken Inputs on Card Body)

Inputs use `background` (sunken), not `foreground` (raised). They sit inside a `foreground` card body:

```tsx
<article className="bg-background rounded-2xl">
  <div className="p-4 bg-foreground rounded-xl">
    {/* L2 content area */}
    <input
      className="px-3.5 py-2.5 rounded-lg bg-background text-font border"
      style={{ borderColor: 'var(--color-border)' }}
      placeholder="..."
    />
  </div>
</article>
```

Focus state: `--color-ring` border + 3px glow. Error: `aria-invalid='true'` → `destructive` border.

---

## Import Paths (Path Aliases)

All imports use absolute paths with aliases:

```tsx
import Layout from '@/layouts/Layout.astro'
import { AgentCard } from '@/components/cards/AgentCard'
import { Card } from '@/components/ui/Card'
import { emitClick } from '@/lib/ui-signal'
```

**Aliases defined in `astro.config.mjs`:**
- `@/` → `src/`
- `@/components/` → `src/components/`
- `@/lib/` → `src/lib/`
- `@/layouts/` → `src/layouts/`
- etc.

---

## Testing

Components are tested in Lighthouse (100% required). Dark mode contrast checks (WCAG AA) run in `html.dark` mode with token defaults:

```css
html.dark {
  --color-primary: hsl(216 55% 65%);
  --color-on-primary: #000;
  /* ... */
}
```

No `localStorage` in tests. All colors default to dark-mode CSS, never JavaScript.

---

## See Also

- `.claude/rules/design.md` — Token enforcement, depth levels, patterns
- `.claude/rules/ui.md` — UI signal contract, emitClick rules
- `.claude/rules/react.md` — React 19 patterns, state, hooks
- `.claude/rules/astro.md` — Islands, hydration, lazy imports
- `/design` — Showcase page, live token editor

---

*Components. Signals. Tokens. Islands. One library, six tokens, zero palette drift.*
