# Flow — Animation & Sequence Design

The ONE interface breathes. Signals pulse. Trails form. Highways glow.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              USER ACTION                                  │
│                    (click, voice, chat command)                          │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           COMMAND PARSER                                  │
│              parseCommand(text) → Signal                                 │
│  "create scout" → { type: "spawn", id: "scout-xxx", kind: "scout" }     │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            COLONY ENGINE                                  │
│                    world.signal({ receiver, data })                     │
│                    world.mark(edge, strength)                           │
│                    world.fade(rate)                                     │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          ANIMATION QUEUE                                  │
│    enqueue({ type: "signal", from, to, data, ts })                      │
│    enqueue({ type: "mark", edge, delta, ts })                           │
│    enqueue({ type: "fade", rate, ts })                                  │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│      PARTICLE SYSTEM        │ │      NODE ANIMATOR          │
│  - spawn particle           │ │  - pulse node               │
│  - move along path          │ │  - shake on warn            │
│  - burst on arrive          │ │  - glow on highway          │
└─────────────────────────────┘ └─────────────────────────────┘
                    │                       │
                    └───────────┬───────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            REACT FLOW                                     │
│                    nodes[], edges[], viewport                            │
│                    Custom: UnitNode, UnitEdge, FlowEdge                  │
└──────────────────────────────────────────────────────────────────────────┘
```

## The Heartbeat

```
emit() → Edge pulses → Unit receives → mark() strengthens → Highway forms
  ↓          ↓              ↓               ↓                    ↓
 0ms       50ms          150ms           200ms                500ms+
```

Every interaction is visible. Every success remembered. Every failure fades.

## Signal Flow Sequence

### 1. Signal Departure (0ms)
```css
/* Source node contracts slightly, then releases */
@keyframes signal-send {
  0%   { transform: scale(1); }
  15%  { transform: scale(0.92); }      /* gather energy */
  30%  { transform: scale(1.08); }      /* release */
  100% { transform: scale(1); }
}
```
- Source node "breathes out"
- Particle spawns at source handle
- Subtle sound: soft click

### 2. Edge Travel (50-150ms)
```css
/* Particle travels along edge path */
@keyframes particle-travel {
  0%   { offset-distance: 0%; opacity: 1; }
  80%  { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0.8; }
}
```
- Glowing dot follows edge curve
- Edge briefly brightens as particle passes
- Trail effect: fading copies behind particle
- Speed proportional to edge strength (highways = fast)

### 3. Node Receive (150ms)
```css
/* Target node pulses on receive */
@keyframes signal-receive {
  0%   { transform: scale(1); box-shadow: 0 0 0 rgba(var(--color), 0); }
  50%  { transform: scale(1.1); box-shadow: 0 0 20px rgba(var(--color), 0.5); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(var(--color), 0); }
}
```
- Target node expands briefly
- Ring pulse radiates outward
- Subtle sound: soft chime

### 4. Mark Update (200ms)
```css
/* Edge thickness animates on mark() */
@keyframes path-strengthen {
  0%   { stroke-width: var(--old-width); }
  50%  { stroke-width: calc(var(--new-width) * 1.2); }  /* overshoot */
  100% { stroke-width: var(--new-width); }
}
```
- Edge gets thicker (strength increase)
- Color shifts toward highway color
- Strength badge updates with bounce

### 5. Highway Formation (500ms+)
```css
/* When edge crosses threshold, celebrate */
@keyframes highway-form {
  0%   { filter: brightness(1); }
  25%  { filter: brightness(1.5); }
  50%  { filter: brightness(2); }
  75%  { filter: brightness(1.5); }
  100% { filter: brightness(1.2); }  /* stays brighter */
}
```
- Flash of light along entire edge
- Particles burst from both endpoints
- Edge gains permanent glow
- Sound: ascending tone

## Failure Sequence

### warn() Signal
```css
@keyframes warn-pulse {
  0%, 100% { background: var(--danger); }
  50%      { background: var(--danger-bright); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-3px); }
  40%, 80% { transform: translateX(3px); }
}
```
- Edge flashes red
- Both nodes shake
- Resistance increases (edge gets redder)
- Sound: low warning tone

## Decay Sequence

### fade() Sweep
```css
@keyframes fade-wave {
  0%   { opacity: 1; filter: brightness(1); }
  50%  { opacity: 0.9; filter: brightness(0.8); }
  100% { opacity: 1; filter: brightness(1); }
}
```
- Wave effect sweeps across graph (left to right)
- All edges dim momentarily
- Weak edges fade more visibly
- Dead edges dissolve (particles scatter)
- Resistance fades 2x faster than strength

### Path Death
```css
@keyframes path-dissolve {
  0%   { opacity: 1; stroke-dasharray: none; }
  50%  { opacity: 0.5; stroke-dasharray: 5 5; }
  100% { opacity: 0; stroke-dasharray: 1 10; }
}
```
- Edge becomes dashed
- Fades to transparent
- Small particles drift away
- Removed from DOM after animation

## Inject Burst

When user triggers "inject" or burst:

```css
@keyframes burst-ripple {
  0%   { transform: scale(0); opacity: 0.8; }
  100% { transform: scale(3); opacity: 0; }
}
```
- Central ripple expands from entry point
- All initial signals fire simultaneously
- Particles race outward along all edges
- Graph "lights up" progressively
- Sound: whoosh

## Skin-Specific Particle Styles

| Skin | Particle Shape | Trail Effect | Highway Glow |
|------|---------------|--------------|--------------|
| ant | amber dot | pheromone trail (gradient fade) | golden path |
| brain | blue spark | electric arc (jagged) | cyan pulse |
| team | arrow | motion blur | green highlight |
| mail | envelope icon | stamp trail | priority stripe |
| water | droplet | ripple rings | deep blue current |
| signal | wave pulse | frequency wave | white beam |

## State Transitions

### Unit Status Change
```
active → proven:  green pulse + crown icon appears
active → at-risk: red flash + warning icon
proven → at-risk: crown fades, warning appears
```

### Path Status Change
```
fresh → highway:   celebration burst (strength ≥ 50)
highway → fading:  glow dims gradually
fading → dead:     dissolve animation
fresh → toxic:     red flash, skull icon (resistance > strength)
```

### Skill Status Change
```
todo → in_progress:  spinner appears
in_progress → complete:  checkmark burst
in_progress → failed:  x mark + shake
blocked → todo:  chains break animation
```

## Performance Guidelines

```typescript
// Batch animations with RAF
requestAnimationFrame(() => {
  particles.forEach(p => p.update())
  edges.forEach(e => e.updateGlow())
})

// Throttle during high activity
if (signalsPerSecond > 10) {
  skipParticleEffects = true
  useSimplePulse = true
}

// GPU-accelerated properties only
// YES: transform, opacity, filter
// NO:  width, height, top, left, stroke-width
```

## Timing Constants

```typescript
const TIMING = {
  // Signal flow
  SIGNAL_SEND: 100,      // ms - node breath
  PARTICLE_TRAVEL: 200,  // ms - base travel time
  SIGNAL_RECEIVE: 150,   // ms - node pulse
  
  // Path updates
  MARK_STRENGTHEN: 300,  // ms - edge thickness change
  HIGHWAY_FORM: 500,     // ms - celebration
  
  // Fade
  FADE_WAVE: 1000,       // ms - sweep duration
  PATH_DISSOLVE: 400,    // ms - death animation
  
  // Bursts
  INJECT_RIPPLE: 600,    // ms - burst wave
  
  // Intervals
  AMBIENT_PULSE: 3000,   // ms - highway ambient glow
  FADE_INTERVAL: 5000,   // ms - auto-fade tick
}
```

## Sound Design (Optional)

| Event | Sound | Duration |
|-------|-------|----------|
| emit (signal sent) | Soft click | 50ms |
| Signal received | Chime | 100ms |
| Highway formed | Ascending tone | 300ms |
| warn (resistance) | Low buzz | 200ms |
| fade tick | Soft whoosh | 100ms |
| Path dissolve | Dissolve | 150ms |
| Inject burst | Whoosh | 400ms |

Sounds should be:
- Subtle (not distracting)
- Layered (multiple simultaneous OK)
- Disable-able (preference)
- Skin-themed if possible

## CSS Variables for Animation

```css
:root {
  /* Timing */
  --anim-fast: 100ms;
  --anim-normal: 200ms;
  --anim-slow: 500ms;
  
  /* Easing */
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Particle */
  --particle-size: 8px;
  --particle-glow: 12px;
  --trail-length: 3;
  
  /* Glow */
  --highway-glow: 0 0 15px var(--color-success);
  --resistance-glow: 0 0 10px var(--color-danger);
}
```

## Implementation Snippets

### Animation Queue (`src/lib/animation.ts`)

```typescript
type AnimationEvent =
  | { type: 'signal'; from: string; to: string; data?: unknown }
  | { type: 'mark'; edge: string; delta: number }
  | { type: 'warn'; edge: string; delta: number }
  | { type: 'fade'; rate: number }
  | { type: 'spawn'; id: string; kind: string }

class AnimationQueue {
  private queue: AnimationEvent[] = []
  private processing = false

  enqueue(event: AnimationEvent) {
    this.queue.push(event)
    if (!this.processing) this.process()
  }

  private async process() {
    this.processing = true
    while (this.queue.length > 0) {
      const event = this.queue.shift()!
      await this.animate(event)
    }
    this.processing = false
  }

  private animate(event: AnimationEvent): Promise<void> {
    switch (event.type) {
      case 'signal':
        return this.animateSignal(event.from, event.to)
      case 'mark':
        return this.animateMark(event.edge, event.delta)
      case 'warn':
        return this.animateWarn(event.edge, event.delta)
      case 'fade':
        return this.animateFade(event.rate)
      // ...
    }
  }
}

export const animationQueue = new AnimationQueue()
```

### Particle Component (`src/components/graph/Particle.tsx`)

```tsx
import { motion } from 'framer-motion'
import { useMetaphor } from '@/contexts/MetaphorContext'

interface ParticleProps {
  path: string  // SVG path from edge
  duration: number
  onComplete: () => void
}

export function Particle({ path, duration, onComplete }: ParticleProps) {
  const { skin } = useMetaphor()

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{
        backgroundColor: skin.colors.primary,
        boxShadow: `0 0 8px ${skin.colors.primary}`,
        offsetPath: `path('${path}')`,
      }}
      initial={{ offsetDistance: '0%', opacity: 1 }}
      animate={{ offsetDistance: '100%', opacity: 0.8 }}
      transition={{ duration: duration / 1000, ease: 'linear' }}
      onAnimationComplete={onComplete}
    />
  )
}
```

### Node Pulse Hook (`src/hooks/useNodePulse.ts`)

```typescript
import { useState, useCallback } from 'react'

export function useNodePulse() {
  const [pulsing, setPulsing] = useState(false)

  const pulse = useCallback(() => {
    setPulsing(true)
    setTimeout(() => setPulsing(false), 150)
  }, [])

  const pulseStyle = pulsing ? {
    transform: 'scale(1.1)',
    transition: 'transform 75ms ease-out',
  } : {
    transform: 'scale(1)',
    transition: 'transform 75ms ease-in',
  }

  return { pulse, pulsing, pulseStyle }
}
```

### Skinned Keyframes (`src/styles/animations.css`)

```css
/* Ant World */
.skin-ant .particle { background: #fbbf24; }
.skin-ant .trail { stroke: #84cc16; }
.skin-ant .highway { filter: drop-shadow(0 0 8px #fbbf24); }

/* Brain */
.skin-brain .particle { background: #22d3ee; }
.skin-brain .trail { stroke: #a855f7; }
.skin-brain .highway { filter: drop-shadow(0 0 8px #c084fc); }

/* Team */
.skin-team .particle { background: #3b82f6; }
.skin-team .trail { stroke: #60a5fa; }
.skin-team .highway { filter: drop-shadow(0 0 8px #3b82f6); }

/* Generic animations */
@keyframes node-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes edge-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

@keyframes particle-trail {
  0% { opacity: 1; }
  100% { opacity: 0; transform: scale(0.5); }
}
```

## React Flow Integration

### Custom Node with Animation

```tsx
import { Handle, Position, NodeProps } from '@xyflow/react'
import { useNodePulse } from '@/hooks/useNodePulse'
import { useMetaphor } from '@/contexts/MetaphorContext'

export function UnitNode({ data }: NodeProps) {
  const { skin } = useMetaphor()
  const { pulse, pulseStyle } = useNodePulse()

  // Expose pulse function to parent
  useEffect(() => {
    data.onPulse = pulse
  }, [pulse, data])

  return (
    <div
      className="px-4 py-2 rounded-lg border"
      style={{
        ...pulseStyle,
        backgroundColor: skin.colors.surface,
        borderColor: data.status === 'proven' 
          ? skin.colors.success 
          : skin.colors.muted,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2">
        <span>{skin.icons.actor}</span>
        <span>{data.name}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
```

### Triggering Animations from World

```typescript
// In WorldView.tsx
const handleSend = useCallback(async (text: string) => {
  const command = parseCommand(text)
  
  if (command?.type === 'signal') {
    // Trigger animation BEFORE engine call
    animationQueue.enqueue({
      type: 'signal',
      from: 'entry',
      to: command.to,
    })
    
    // Execute in engine
    await world.signal({
      receiver: command.to,
      data: command.data,
    })
    
    // Update state after animation completes
    setWorld(prev => prev ? {
      ...prev,
      flows: world.highways(30)
    } : null)
  }
}, [world])
```

---

*Every signal visible. Every path remembered. ONE flow.*
