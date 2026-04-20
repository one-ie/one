---
name: react19
description: React 19 patterns including Actions, use() hook, transitions, ref as prop, and optimistic updates for the Envelope System
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep
---

# React 19 Development

Modern React 19 patterns for building interactive components in the Envelope System.

## Works With

| Skill        | Load when                                                                        |
|--------------|----------------------------------------------------------------------------------|
| `/signal`    | Any `onClick` — every click emits `ui:<surface>:<action>` via `emitClick()`. See `.claude/rules/ui.md`. |
| `/astro`     | The component lives in an Astro page — hydration directives (`client:load`, `client:only`) decide worker bundle size. |
| `/shadcn`    | Using Cards, Tabs, Badges, Dialog — shadcn components are React components with ref-as-prop. |
| `/ai-ui`     | Agent reasoning UIs, tool-call visualization, generative components composed from shadcn. |
| `/reactflow` | Graph visualizations — ColonyGraph, PheromoneGraph read substrate highways.       |

Auto-loads on `*.tsx`: `rules/react.md` + `rules/ui.md` (per `.claude/settings.json`).

## When to Use This Skill

- Build React components in `src/components/`
- Implement form handling with Actions
- Use the new `use()` hook for promises/context
- Apply transitions for non-blocking updates
- Implement optimistic UI patterns

## Key React 19 Features

### 1. Actions (Form Handling)

Actions replace manual form handling. They work with `<form action={...}>`:

```tsx
// src/components/envelopes/EnvelopeSubmitter.tsx
import { useActionState } from 'react';

interface EnvelopeFormState {
  success: boolean;
  error?: string;
  envelopeId?: string;
}

async function submitEnvelope(
  prevState: EnvelopeFormState,
  formData: FormData
): Promise<EnvelopeFormState> {
  const action = formData.get('action') as string;
  const target = formData.get('target') as string;

  try {
    // Process envelope
    const envelope = createEnvelope({ action, target });
    return { success: true, envelopeId: envelope.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export function EnvelopeSubmitter() {
  const [state, formAction, isPending] = useActionState(
    submitEnvelope,
    { success: false }
  );

  return (
    <form action={formAction}>
      <input name="action" placeholder="Action name" disabled={isPending} />
      <input name="target" placeholder="Target agent" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send Envelope'}
      </button>
      {state.error && <p className="text-red-500">{state.error}</p>}
      {state.success && <p className="text-green-500">Sent: {state.envelopeId}</p>}
    </form>
  );
}
```

### 2. use() Hook

Read promises and context directly with `use()`:

```tsx
// Reading a promise
import { use, Suspense } from 'react';

interface RuntimeState {
  agents: Agent[];
  promises: AgentPromise[];
}

function RuntimeDisplay({ runtimePromise }: { runtimePromise: Promise<RuntimeState> }) {
  const runtime = use(runtimePromise); // Suspends until resolved

  return (
    <div>
      <h2>Agents: {runtime.agents.length}</h2>
      <h2>Promises: {runtime.promises.length}</h2>
    </div>
  );
}

// Wrap with Suspense
export function RuntimeContainer() {
  const runtimePromise = fetchRuntimeState();

  return (
    <Suspense fallback={<div>Loading runtime...</div>}>
      <RuntimeDisplay runtimePromise={runtimePromise} />
    </Suspense>
  );
}
```

```tsx
// Reading context conditionally
import { use, createContext } from 'react';

const RuntimeContext = createContext<Runtime | null>(null);

function AgentCard({ agentId }: { agentId: string }) {
  const runtime = use(RuntimeContext);
  if (!runtime) return null;

  const agent = runtime.getAgent(agentId);
  return <div>{agent.name}</div>;
}
```

### 3. Transitions

Non-blocking state updates with `useTransition`:

```tsx
import { useState, useTransition } from 'react';

interface Agent {
  id: string;
  name: string;
  envelopes: Envelope[];
}

export function AgentTabs({ agents }: { agents: Agent[] }) {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.id);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (agentId: string) => {
    startTransition(() => {
      setSelectedAgent(agentId);
    });
  };

  const agent = agents.find(a => a.id === selectedAgent);

  return (
    <div>
      <div className="tabs">
        {agents.map(a => (
          <button
            key={a.id}
            onClick={() => handleTabChange(a.id)}
            className={a.id === selectedAgent ? 'active' : ''}
          >
            {a.name}
          </button>
        ))}
      </div>
      <div className={isPending ? 'opacity-50' : ''}>
        {agent && <AgentContent agent={agent} />}
      </div>
    </div>
  );
}
```

### 4. Optimistic Updates

Show expected state before server confirms:

```tsx
import { useOptimistic } from 'react';

interface Envelope {
  id: string;
  status: 'pending' | 'resolved' | 'rejected';
}

export function EnvelopeList({ envelopes: initialEnvelopes }: { envelopes: Envelope[] }) {
  const [optimisticEnvelopes, addOptimisticEnvelope] = useOptimistic(
    initialEnvelopes,
    (state, newEnvelope: Envelope) => [...state, newEnvelope]
  );

  async function sendEnvelope(formData: FormData) {
    const tempEnvelope: Envelope = {
      id: `temp-${Date.now()}`,
      status: 'pending',
    };

    // Show optimistically
    addOptimisticEnvelope(tempEnvelope);

    // Actually send
    await submitEnvelope(formData);
  }

  return (
    <div>
      <form action={sendEnvelope}>
        <input name="action" />
        <button type="submit">Send</button>
      </form>
      <ul>
        {optimisticEnvelopes.map(env => (
          <li key={env.id} className={env.id.startsWith('temp-') ? 'opacity-50' : ''}>
            {env.id}: {env.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5. ref as Prop

No more `forwardRef` needed in React 19:

```tsx
// Before (React 18)
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
));

// After (React 19)
interface InputProps {
  ref?: React.Ref<HTMLInputElement>;
  placeholder?: string;
}

function Input({ ref, ...props }: InputProps) {
  return <input ref={ref} {...props} />;
}

// Usage
function Form() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <Input ref={inputRef} placeholder="Enter action" />;
}
```

### 6. Document Metadata

Render `<title>` and `<meta>` anywhere:

```tsx
function AgentPage({ agent }: { agent: Agent }) {
  return (
    <div>
      <title>{agent.name} | Envelope System</title>
      <meta name="description" content={`Agent ${agent.name} details`} />
      <h1>{agent.name}</h1>
    </div>
  );
}
```

## Project-Specific Patterns

### Runtime Context Provider

```tsx
// src/components/providers/RuntimeProvider.tsx
import { createContext, useState, useCallback, ReactNode } from 'react';
import { Runtime } from '@/engine/Runtime';

interface RuntimeContextValue {
  runtime: Runtime;
  refresh: () => void;
  uiSchema: object;
}

export const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const [runtime] = useState(() => new Runtime());
  const [uiSchema, setUiSchema] = useState(() => runtime.toUISchema());

  const refresh = useCallback(() => {
    setUiSchema(runtime.toUISchema());
  }, [runtime]);

  return (
    <RuntimeContext.Provider value={{ runtime, refresh, uiSchema }}>
      {children}
    </RuntimeContext.Provider>
  );
}
```

### Envelope Form with Actions

```tsx
// src/components/envelopes/CreateEnvelopeForm.tsx
import { useActionState } from 'react';
import { use } from 'react';
import { RuntimeContext } from '@/components/providers/RuntimeProvider';
import { createEnvelope } from '@/engine/Envelope';

export function CreateEnvelopeForm() {
  const { runtime, refresh } = use(RuntimeContext)!;

  async function handleSubmit(prevState: any, formData: FormData) {
    const envelope = createEnvelope({
      action: formData.get('action') as string,
      inputs: JSON.parse(formData.get('inputs') as string || '{}'),
      sender: 'user',
      receiver: formData.get('receiver') as string,
    });

    await runtime.send(envelope);
    refresh();

    return { success: true, envelopeId: envelope.id };
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, {});

  return (
    <form action={formAction} className="space-y-4">
      <input name="action" placeholder="Action" className="input" />
      <input name="receiver" placeholder="Target Agent" className="input" />
      <textarea name="inputs" placeholder='{"key": "value"}' className="textarea" />
      <button type="submit" disabled={isPending} className="btn">
        {isPending ? 'Sending...' : 'Send Envelope'}
      </button>
    </form>
  );
}
```

### Promise Tracker with Transitions

```tsx
// src/components/promises/PromiseTracker.tsx
import { useState, useTransition } from 'react';
import { AgentPromise } from '@/engine/types';

interface Props {
  promises: AgentPromise[];
}

export function PromiseTracker({ promises }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [isPending, startTransition] = useTransition();

  const filtered = promises.filter(p =>
    filter === 'all' || p.status === filter
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => startTransition(() => setFilter(f))}
            className={filter === f ? 'btn-active' : 'btn'}
          >
            {f}
          </button>
        ))}
      </div>
      <ul className={isPending ? 'opacity-50' : ''}>
        {filtered.map(promise => (
          <li key={promise.id} className="flex items-center gap-2">
            <span className={`status-dot status-${promise.status}`} />
            <span>{promise.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## TypeScript Patterns

### Event Handlers

```tsx
// Type-safe event handlers
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault();
}

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  const value = e.target.value;
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
}
```

### Component Props

```tsx
// Prefer interfaces for props
interface AgentCardProps {
  agent: Agent;
  onSelect?: (id: string) => void;
  className?: string;
  children?: React.ReactNode;
}

// Use PropsWithChildren for components with children
import { PropsWithChildren } from 'react';

interface PanelProps {
  title: string;
}

function Panel({ title, children }: PropsWithChildren<PanelProps>) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

## State Management Patterns

### Local state for UI

```tsx
const [isOpen, setIsOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('agent-a');
```

### useReducer for complex state

```tsx
type Action =
  | { type: 'SELECT_AGENT'; agentId: string }
  | { type: 'ADD_ENVELOPE'; envelope: Envelope }
  | { type: 'UPDATE_PROMISE'; promiseId: string; status: string };

interface State {
  selectedAgent: string;
  envelopes: Envelope[];
  promises: AgentPromise[];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SELECT_AGENT':
      return { ...state, selectedAgent: action.agentId };
    case 'ADD_ENVELOPE':
      return { ...state, envelopes: [...state.envelopes, action.envelope] };
    case 'UPDATE_PROMISE':
      return {
        ...state,
        promises: state.promises.map(p =>
          p.id === action.promiseId ? { ...p, status: action.status } : p
        ),
      };
  }
}
```

## Best Practices

1. **Use Actions for forms**: Cleaner than manual `onSubmit`
2. **Wrap async with Suspense**: When using `use()` with promises
3. **Use transitions for tabs/filters**: Keeps UI responsive
4. **Optimistic updates for UX**: Show expected state immediately
5. **Type everything**: No `any` types
6. **Prefer `interface` over `type`**: For props and objects

---

**Version**: 1.0.0
**Tech**: React 19.1
