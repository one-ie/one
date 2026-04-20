# React 19 Rules

Apply to `*.tsx`

---

## Types

```tsx
interface Props {
  agent: Agent
  onSelect?: (id: string) => void
}

export function AgentCard({ agent, onSelect }: Props) { ... }
```

Always type props. Always.

---

## Structure

```tsx
// 1. Imports
import { useState } from 'react'
import { Card } from '@/components/ui/card'

// 2. Types
interface Props { ... }

// 3. Component
export function Component({ prop }: Props) {
  // Hooks
  const [state, setState] = useState()

  // Handlers
  const handle = () => { ... }

  // Render
  return ( ... )
}
```

---

## React 19

```tsx
// Actions (not onSubmit)
<form action={formAction}>

// use() for promises
const data = use(promise)  // in Suspense

// Transitions
const [isPending, startTransition] = useTransition()

// Optimistic
const [optimistic, addOptimistic] = useOptimistic(state, fn)

// ref as prop (no forwardRef)
function Input({ ref, ...props }) { ... }
```

---

## State

```tsx
// Simple
const [open, setOpen] = useState(false)

// Complex
const [state, dispatch] = useReducer(reducer, init)

// Async (React 19)
const [state, action, pending] = useActionState(fn, init)
```

---

## Styling

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

---

## Exports

```tsx
// Named (good)
export function AgentCard() { ... }

// Default (avoid)
export default function AgentCard() { ... }
```

---

## With Substrate

```tsx
import { colony } from '@/engine/substrate'

export function SwarmView() {
  const [net] = useState(() => colony())
  const [highways, setHighways] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      net.fade(0.1)
      setHighways(net.highways(10))
    }, 1000)
    return () => clearInterval(interval)
  }, [net])

  return <Graph edges={highways} />
}
```

---

*React 19. Typed. Clean.*
