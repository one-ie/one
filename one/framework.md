# Framework

TypeDB stores reality. TypeQL queries it. JSON renders it. The UI skins it.

## The Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TypeDB                                   │
│  one.tql / skins.tql — stores the 6 dimensions              │
│  Groups, Actors, Things, Paths, Events, Knowledge               │
└────────────────────────────┬────────────────────────────────────┘
                             │ TypeQL
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Query Layer                                │
│  open() / blocked() / best() / proven() / highways()            │
│  Functions return entities, relations, aggregates               │
└────────────────────────────┬────────────────────────────────────┘
                             │ JSON
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      UI Components                               │
│  ColonyEditor / ColonyGraph / PathFlowCanvas                    │
│  ReactFlow nodes, edges, animations                              │
└────────────────────────────┬────────────────────────────────────┘
                             │ Metaphor
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Skin Layer                                 │
│  Ant / Brain / Team / Mail / Water / Signal                     │
│  Labels, colors, icons, terminology                              │
└─────────────────────────────────────────────────────────────────┘
```

## TypeQL to JSON

### World State Query

```typeql
# Get the world for UI rendering
match
  $a isa actor, has actor-id $id, has actor-name $name, has actor-status $status;
  $p (source: $src, target: $tgt) isa path,
      has weight $w, has resistance $al, has path-status $ps;
  $src has actor-id $src-id;
  $tgt has actor-id $tgt-id;
select $id, $name, $status, $src-id, $tgt-id, $w, $al, $ps;
```

### JSON Output

```json
{
  "actors": [
    { "id": "scout", "name": "Scout", "status": "proven", "kind": "agent" },
    { "id": "analyst", "name": "Analyst", "status": "active", "kind": "agent" },
    { "id": "trader", "name": "Trader", "status": "proven", "kind": "agent" }
  ],
  "paths": [
    { "from": "scout", "to": "analyst", "weight": 75, "status": "open" },
    { "from": "analyst", "to": "trader", "weight": 60, "status": "open" },
    { "from": "scout", "to": "trader", "weight": 8, "status": "fading" }
  ],
  "patterns": [
    { "id": "scout-analyst-highway", "confidence": 0.95, "count": 150 }
  ]
}
```

## Metaphor Skins

The same JSON renders differently based on metaphor:

### Skin Definition

```typescript
interface MetaphorSkin {
  id: string
  name: string
  
  // Entity labels
  actor: string       // "ant" | "neuron" | "agent" | "mailbox" | "pool" | "receiver"
  group: string       // "colony" | "network" | "team" | "office" | "watershed" | "network"
  path: string        // "trail" | "synapse" | "workflow" | "route" | "channel" | "frequency"
  carrier: string     // "strength" | "impulse" | "task" | "letter" | "drop" | "signal"
  
  // Action labels (THE VERBS)
  signal: string      // "forage" | "fire" | "delegate" | "deliver" | "flow" | "transmit"
  drop: string        // "deposit" | "potentiate" | "commend" | "stamp" | "carve" | "boost"
  fade: string        // "evaporate" | "decay" | "forget" | "archive" | "dry" | "attenuate"
  follow: string      // "smell" | "sense" | "query" | "track" | "follow" | "scan"
  sense: string       // "smell" | "sense" | "query" | "track" | "follow" | "scan"
  
  // Status labels
  open: string        // "trail" | "pathway" | "go-to" | "express" | "river" | "clear"
  blocked: string     // "toxic" | "dead" | "flagged" | "returned" | "dammed" | "jammed"
  
  // Colors
  colors: {
    primary: string       // Actor nodes
    secondary: string     // Paths
    success: string       // Open paths
    danger: string        // Blocked paths
    background: string    // Canvas
  }
  
  // Icons (emoji or SVG paths)
  icons: {
    actor: string
    group: string
    path: string
    entry: string
  }
}
```

### 6 Skins

```typescript
const skins: Record<string, MetaphorSkin> = {
  ant: {
    id: 'ant',
    name: 'Ant World',
    actor: 'ant', group: 'colony', path: 'trail', carrier: 'strength',
    signal: 'forage', drop: 'deposit', fade: 'evaporate', follow: 'smell', sense: 'smell',
    open: 'trail', blocked: 'toxic',
    colors: { primary: '#84cc16', secondary: '#65a30d', success: '#22c55e', danger: '#ef4444', background: '#1a1a0a' },
    icons: { actor: '🐜', group: '🏔️', path: '~~~', entry: '🌱' }
  },
  
  brain: {
    id: 'brain',
    name: 'Neural Network',
    actor: 'neuron', group: 'network', path: 'synapse', carrier: 'impulse',
    signal: 'fire', drop: 'potentiate', fade: 'decay', follow: 'sense', sense: 'sense',
    open: 'pathway', blocked: 'dead',
    colors: { primary: '#a855f7', secondary: '#9333ea', success: '#c084fc', danger: '#f87171', background: '#0f0a1a' },
    icons: { actor: '🔮', group: '🧠', path: '⚡', entry: '👁️' }
  },
  
  team: {
    id: 'team',
    name: 'Organization',
    actor: 'agent', group: 'team', path: 'workflow', carrier: 'task',
    signal: 'delegate', drop: 'commend', fade: 'forget', follow: 'query', sense: 'query',
    open: 'go-to', blocked: 'flagged',
    colors: { primary: '#3b82f6', secondary: '#2563eb', success: '#60a5fa', danger: '#f87171', background: '#0a0a14' },
    icons: { actor: '👤', group: '🏢', path: '→', entry: '📥' }
  },
  
  mail: {
    id: 'mail',
    name: 'Postal System',
    actor: 'mailbox', group: 'office', path: 'route', carrier: 'letter',
    signal: 'deliver', drop: 'stamp', fade: 'archive', follow: 'track', sense: 'track',
    open: 'express', blocked: 'returned',
    colors: { primary: '#f59e0b', secondary: '#d97706', success: '#fbbf24', danger: '#dc2626', background: '#14100a' },
    icons: { actor: '📬', group: '🏤', path: '✉️', entry: '📮' }
  },
  
  water: {
    id: 'water',
    name: 'Watershed',
    actor: 'pool', group: 'watershed', path: 'channel', carrier: 'drop',
    signal: 'flow', drop: 'carve', fade: 'dry', follow: 'follow', sense: 'follow',
    open: 'river', blocked: 'dammed',
    colors: { primary: '#06b6d4', secondary: '#0891b2', success: '#22d3ee', danger: '#f87171', background: '#0a1014' },
    icons: { actor: '💧', group: '🌊', path: '〰️', entry: '🌧️' }
  },
  
  signal: {
    id: 'signal',
    name: 'Signal Network',
    actor: 'receiver', group: 'network', path: 'frequency', carrier: 'signal',
    signal: 'transmit', drop: 'boost', fade: 'attenuate', follow: 'scan', sense: 'scan',
    open: 'clear', blocked: 'jammed',
    colors: { primary: '#10b981', secondary: '#059669', success: '#34d399', danger: '#f87171', background: '#0a140f' },
    icons: { actor: '📡', group: '🛰️', path: '〜', entry: '📻' }
  }
}
```

## UI Components + Skins

### MetaphorContext

```typescript
// contexts/MetaphorContext.tsx
import { createContext, useContext, useState } from 'react'

interface MetaphorContextType {
  skin: MetaphorSkin
  setSkin: (id: string) => void
  t: (key: string) => string  // Translate term
}

const MetaphorContext = createContext<MetaphorContextType>(null!)

export function MetaphorProvider({ children }: { children: React.ReactNode }) {
  const [skinId, setSkinId] = useState('team')
  const skin = skins[skinId]
  
  const t = (key: string) => (skin as Record<string, unknown>)[key] as string || key
  
  return (
    <MetaphorContext.Provider value={{ skin, setSkin: setSkinId, t }}>
      {children}
    </MetaphorContext.Provider>
  )
}

export const useMetaphor = () => useContext(MetaphorContext)
```

### Skinned Node

```typescript
// ChamberNode becomes skinnable
function ActorNode({ data }: NodeProps) {
  const { skin, t } = useMetaphor()
  
  return (
    <div style={{ 
      background: `linear-gradient(to bottom, ${skin.colors.primary}20, ${skin.colors.background})`,
      borderColor: data.isOpen ? skin.colors.success : skin.colors.primary
    }}>
      <div className="flex items-center gap-2">
        <span>{skin.icons.actor}</span>
        <span>{data.name}</span>
        {data.status === 'proven' && <span title={`Proven ${t('actor')}`}>⭐</span>}
      </div>
      
      <div className="text-xs text-slate-500">
        {t('actor')} | {data.actions.join(', ')}
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-xs">IN {t('path')}s:</span>
        <Bar value={data.incoming} color={skin.colors.success} />
      </div>
    </div>
  )
}
```

### Skinned Edge

```typescript
// TrailEdge becomes skinnable
function PathEdge(props: EdgeProps) {
  const { skin, t } = useMetaphor()
  const { weight, status } = props.data
  
  const color = status === 'open' 
    ? skin.colors.success 
    : status === 'blocked' 
      ? skin.colors.danger 
      : skin.colors.secondary
  
  return (
    <g>
      <BaseEdge {...props} style={{ stroke: color, strokeWidth: Math.max(1, weight / 10) }} />
      <EdgeLabelRenderer>
        <div style={{ background: `${color}30` }}>
          <span>{t('path')}</span>
          <span>{weight.toFixed(0)}</span>
          {status === 'open' && <span>{skin.icons.path} {t('open')}</span>}
          {status === 'blocked' && <span>⛔ {t('blocked')}</span>}
        </div>
      </EdgeLabelRenderer>
    </g>
  )
}
```

### Skin Switcher

```typescript
function SkinSwitcher() {
  const { skin, setSkin } = useMetaphor()
  
  return (
    <div className="flex gap-2 p-2 bg-black/50 rounded-lg">
      {Object.values(skins).map(s => (
        <button
          key={s.id}
          onClick={() => setSkin(s.id)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm transition-all",
            skin.id === s.id 
              ? "bg-white/20 text-white" 
              : "text-slate-400 hover:text-white"
          )}
          style={{ borderColor: s.colors.primary }}
        >
          {s.icons.actor} {s.name}
        </button>
      ))}
    </div>
  )
}
```

## TypeQL Queries for UI

### actors.json

```typeql
# Generate actors for UI
fun ui_actors() -> { actor }:
  match 
    $a isa actor, 
        has actor-id $id, 
        has actor-name $name, 
        has actor-kind $kind,
        has actor-status $status;
  return { $a };

# Usage
match 
  let $actors in ui_actors();
  $actors has actor-id $id, has actor-name $name, has actor-kind $kind, has actor-status $status;
select $id, $name, $kind, $status;
```

### paths.json

```typeql
# Generate paths for UI
fun ui_paths($limit: integer) -> { path }:
  match
    $p isa path,
        has path-id $id,
        has weight $w,
        has path-status $status;
    $p (source: $src, target: $tgt);
    $src has actor-id $src-id;
    $tgt has actor-id $tgt-id;
  sort $w desc;
  limit $limit;
  return { $p };

# With source/target
match
  let $paths in ui_paths(50);
  $paths (source: $src, target: $tgt),
      has weight $w, has path-status $status;
  $src has actor-id $src-id;
  $tgt has actor-id $tgt-id;
select $src-id, $tgt-id, $w, $status;
```

### world.json (Complete)

```typeql
# Complete world state for UI
fun ui_world($group_id: string) -> { actor, path, pattern }:
  match
    $g isa group, has group-id $group_id;
    (group: $g, member: $a) isa membership;
    $a isa actor;
    $p (source: $src, target: $tgt) isa path;
    { $src = $a; } or { $tgt = $a; };
  return { $a, $p };
```

## JSON Schema

### World State

```typescript
interface WorldState {
  meta: {
    group: string
    metaphor: string
    timestamp: string
  }
  
  actors: Actor[]
  paths: Path[]
  patterns: Pattern[]
  
  stats: {
    totalActors: number
    provenActors: number
    atRiskActors: number
    openPaths: number
    blockedPaths: number
    fadingPaths: number
    totalWeight: number
    avgConfidence: number
  }
}

interface Actor {
  id: string
  name: string
  kind: string
  status: 'active' | 'proven' | 'at-risk'
  actions: string[]
  incoming: number
  outgoing: number
  heatLevel?: number
}

interface Path {
  id: string
  from: string
  to: string
  fromTask?: string
  toTask?: string
  weight: number
  status: 'open' | 'fading' | 'blocked'
  traversals?: number
}

interface Pattern {
  id: string
  name: string
  confidence: number
  discoveryCount: number
  sourcePath: string
}
```

## The Pipeline

```
┌──────────────────┐
│     TypeDB       │
│  one.tql schema  │
│  skins.tql   │
└────────┬─────────┘
         │ store
         ▼
┌──────────────────┐
│   World Data     │
│  actors, flows   │
│  patterns        │
└────────┬─────────┘
         │ ui_world()
         ▼
┌──────────────────┐
│   TypeQL Query   │
│  select, sort    │
│  aggregate       │
└────────┬─────────┘
         │ HTTP / parse
         ▼
┌──────────────────┐
│   JSON State     │
│  WorldState      │
└────────┬─────────┘
         │ React Context
         ▼
┌──────────────────┐
│  UI Components   │
│  ActorNode       │
│  FlowEdge        │
└────────┬─────────┘
         │ useMetaphor()
         ▼
┌──────────────────┐
│  Metaphor Skin   │
│  labels, colors  │
│  icons           │
└──────────────────┘
```

## Live Updates

```typescript
// hooks/useWorld.ts
export function useWorld(groupId: string) {
  const [world, setWorld] = useState<WorldState | null>(null)
  
  useEffect(() => {
    // Initial load
    loadWorld(groupId).then(setWorld)
    
    // Subscribe to changes (WebSocket or polling)
    const unsubscribe = subscribe(groupId, (delta) => {
      setWorld(prev => applyDelta(prev, delta))
    })
    
    return unsubscribe
  }, [groupId])
  
  return world
}

// Delta types
interface WorldDelta {
  type: 'actor-update' | 'path-update' | 'pattern-created'
  data: Partial<Actor | Path | Pattern>
}
```

## File Structure

```
src/
├── engine/
│   ├── substrate.ts      # 70 lines - unit + colony + paths
│   ├── one.ts            # 70 lines - world() interface
│   └── persist.ts        # 40 lines - TypeDB persistence
│
├── schema/
│   ├── one.tql           # 150 lines - 6 dimensions
│   └── skins.tql     # 150 lines - universal ontology
│
├── api/
│   ├── world.ts          # TypeQL → JSON
│   └── subscribe.ts      # Real-time updates
│
├── contexts/
│   ├── WorldContext.tsx  # World state provider
│   └── MetaphorContext.tsx # Skin provider
│
├── components/
│   ├── graph/
│   │   ├── WorldGraph.tsx      # Main visualization
│   │   ├── ActorNode.tsx       # Skinnable actor node
│   │   ├── PathEdge.tsx        # Skinnable path edge
│   │   └── EntryNode.tsx       # Skinnable entry point
│   │
│   ├── panels/
│   │   ├── PathPanel.tsx       # Open/blocked paths
│   │   ├── ActorPanel.tsx      # Proven/at-risk actors
│   │   └── PatternPanel.tsx    # Crystallized knowledge (highways)
│   │
│   └── controls/
│       ├── SkinSwitcher.tsx    # Metaphor selector
│       ├── PathEditor.tsx      # Adjust weight
│       └── SignalInjector.tsx  # Test signals
│
└── skins/
    ├── index.ts          # Skin definitions
    ├── ant.ts
    ├── brain.ts
    ├── team.ts
    ├── mail.ts
    ├── water.ts
    └── signal.ts
```

## Integration Points

| Source | Provides | Consumers |
|--------|----------|-----------|
| `one.tql` | Schema, classifier functions | TypeDB |
| `skins.tql` | Universal functions | Query layer |
| `ui_world()` | JSON state | React components |
| `WorldContext` | Actor/path state | Nodes, edges |
| `MetaphorContext` | Labels, colors | All components |
| `skins/*.ts` | Skin definitions | SkinSwitcher |

## The Vision

```
User selects metaphor: "Ant World"
                ↓
UI applies skin: green tones, ant emoji, "trail" labels
                ↓
Same TypeDB data: actors, paths, patterns
                ↓
Same inference: open/blocked/proven/at-risk
                ↓
Different experience: intuitive to domain expert
```

Switch to "Neural Network":
- Actors become neurons
- Paths become synapses
- Trails become pathways
- Colors shift to purple
- Same data, different lens

## Architecture

```
TypeDB stores ONE ontology (universal)
TypeQL queries extract state (functions)
JSON carries to frontend (transport)
React renders components (structure)
Skins provide metaphors (meaning)

The ontology is ONE.
The views are many.
```

---

*One database. Many metaphors. Infinite clarity.*

---

## See Also

- [flows.md](flows.md) — Data flows from substrate through layers to UI
- [metaphors.md](metaphors.md) — Seven metaphor vocabularies the framework renders
- [one-ontology.md](one-ontology.md) — Six dimensions the UI visualizes
- [the-stack.md](the-stack.md) — Full technical stack: Move, TS, TypeDB, UI
- [ontology.md](one/ontology.md) — TypeDB queries feeding the JSON layer
- [ui-plan.md](ui-plan.md) — Vision for the living interface
