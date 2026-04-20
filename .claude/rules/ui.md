# UI Rules

Apply to `src/components/**/*.tsx`

---

## Every onClick Is a Signal

Every interactive onClick handler MUST call `emitClick(id, payload?)` before the local handler.

```tsx
import { emitClick } from '@/lib/ui-signal'

// GOOD
<Button onClick={() => { emitClick('ui:chat:copy'); handleCopy() }}>Copy</Button>

// BAD — no signal emitted
<Button onClick={handleCopy}>Copy</Button>
```

Receiver naming: `ui:<surface>:<action>` where surface is the component or page name (lowercase) and action is an intent verb.

---

## Receiver Naming

| Surface | Actions | Examples |
|---------|---------|---------|
| `chat` | copy, stop, claim, send, retry | `ui:chat:copy`, `ui:chat:stop` |
| `settings` | close, save, reset | `ui:settings:close`, `ui:settings:save` |
| `memory` | reveal, forget, expand | `ui:memory:reveal`, `ui:memory:forget` |
| `demo` | run, reset, next | `ui:demo:run`, `ui:demo:reset` |

Format: `ui:<surface>:<action>` — all lowercase, colon-delimited.

---

## Exemptions

onClick handlers that do NOT need `emitClick`:

- **Purely visual toggles** with no semantic meaning (accordion open/close, tooltip show/hide)
- **Internal navigation** that calls `router.push` — the route change is the signal

---

## ADL Contract

`ui:*` receivers have `sensitivity=public`, `lifecycle=active` by convention.

No TypeDB entry needed — the ADL lifecycle gate passes through for unknown receivers.

See `docs/ADL-integration.md` for gate shape, `docs/rich-messages.md` for RichMessage contract.

---

## Rich Payload

Use `payload` for clicks that carry semantic data: payment actions, embed interactions.

```tsx
import { emitClick } from '@/lib/ui-signal'

// Claim button — carries payment metadata
<Button onClick={() => emitClick('ui:chat:claim', {
  type: 'payment',
  payment: { receiver, amount, action: 'claim' }
})}>
  Claim
</Button>
```

See `docs/rich-messages.md` for the full `RichMessage` type definition.

---

*Signal first. Then handle.*
