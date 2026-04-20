# The World

How 100 million years of ant intelligence maps onto 70 lines of substrate.

---

## The Language

Three vocabularies. Same meaning.

```
ANT              SUBSTRATE          ONE
───              ─────────          ───
signal           signal             signal
pheromone        weight             strength
trail            edge               connection
drop             drop               strengthen
sense            sense              read
fade             fade               decay
follow           follow             traverse
highway          highway            proven flow
colony           colony             world
ant              unit               actor
caste            role               type
queen            orchestrator       coordinator
scout            explorer           discoverer
harvester        exploiter          optimizer
forager          searcher           gatherer
relay            propagator         broadcaster
nurse            healer             maintainer
soldier          validator          defender
```

The metaphor IS the understanding. Switch skins, same substrate.

---

## The Signal

```typescript
type Signal = {
  receiver: string    // who
  data?: unknown      // what
}
```

Ants drop chemical signals. Neurons fire electrical signals. Agents move digital signals. Same pattern. Two fields.

---

## The Castes

Nine roles. Each a unit with different genome parameters.

### Queen (Orchestrator)

```
pheromone_sensitivity: 1.0    // reads everything
exploration_bias: 0.3         // strategic, not wandering
deposit_threshold: 0.9        // only marks what matters
risk_tolerance: 0.4           // conservative
```

Routes tasks. Hardens patterns. Makes final decisions.

Actions: `orchestrate`, `know`

### Scout (Explorer)

```
pheromone_sensitivity: 0.3    // ignores existing trails
exploration_bias: 0.8         // seeks novelty
deposit_threshold: 0.4        // marks paths easily
risk_tolerance: 0.7           // ventures into unknown
```

Decision: inverse pheromone weighting. Lower trail = more attractive.
Deposits: weak (3.0) but frequent. High mortality. Essential for discovery.

Actions: `observe`, `scan`

### Analyst / Harvester (Exploiter)

```
pheromone_sensitivity: 0.9    // follows trails closely
exploration_bias: 0.1         // stays on known paths
deposit_threshold: 0.7        // only on significant success
risk_tolerance: 0.2           // avoids uncertainty
```

Decision: direct pheromone weighting. Strongest trail wins.
Deposits: strong (5.0) on major success. Builds superhighways.

Actions: `evaluate`, `regime`

### Trader / Major Worker (Executor)

```
computation_power: high
search_depth: deep
deposit_threshold: 0.8
risk_tolerance: 0.3
```

Deep analysis. Complex problem solving. Executes trades.

Actions: `execute`, `position`

### Forager (Searcher)

```
pheromone_sensitivity: 0.6
exploration_bias: 0.5
path_memory_size: large
load_capacity: high
```

Searches multiple data sources. Harvests patterns for hardening.

Actions: `search`, `harvest`

### Relay (Propagator)

```
pheromone_sensitivity: 0.5    // balanced
exploration_bias: 0.5         // spreads wide
deposit_threshold: 0.3        // propagates easily
risk_tolerance: 0.5           // moderate
```

Targets medium-pheromone edges (5-15). Amplifies weak signals from scouts.
Connects discoveries to superhighways. Prevents isolated clusters.
Deposits: moderate (2.0) at low cost (0.3).

Actions: `broadcast`, `gossip`

### Nurse (Healer)

```
healing_power: high
detection_sensitivity: high
deposit_threshold: 0.5
risk_tolerance: 0.1
```

Monitors colony health. Heals unhealthy agents. Self-loop care chain.

Actions: `monitor`, `heal`

### Soldier (Validator)

```
verification_accuracy: high
defense_strength: high
deposit_threshold: 0.6
risk_tolerance: 0.3
```

Validates signals before execution. Rejects false positives. Deposits threat/resistance pheromones.

Actions: `defend`, `validate`

### Sentinel / Minor Worker (Guardian)

```
search_speed: high
breadth_coverage: 1.0
deposit_threshold: 0.5
risk_tolerance: 0.2
```

Circuit breaker. Risk management. Parallel breadth-first scanning.

Actions: `circuit`, `risk`

---

## The Pheromone System

Pheromones live on EDGES, not nodes. This is the key insight.

### Types

```
TYPE           DEPOSITED BY    MEANING              STRENGTH
trail          harvester       successful path       5.0
opportunity    scout           new finding           3.0
relay          relay           propagated signal     2.0
threat         soldier         danger detected       7.0-10.0
resistance          sentinel        failure marker        8.0
quality        queen           known value    10.0
```

###  Weights

```
effective_cost = base_weight / (1 + pheromone_level * alpha)

alpha = 0.7    // pheromone influence factor
```

More pheromone = lower cost = more traffic = more pheromone = HIGHWAY.

### Decay Rates

```
validated:      0.01    // very slow — trusted knowledge
pattern:        0.03    // slow — stable patterns
trail:          0.05    // moderate — standard decay
resistance:          0.08    // faster — forget failures faster than successes
microstructure: 0.10    // very fast — rapid market changes
```

Asymmetric decay: successes persist longer than failures.

### The Loop

```
DROP                   FADE
  |                     |
  v                     v
weight++           weight *= 0.95
  |                     |
  v                     v
more signals       reroute
  |                     |
  v                     v
HIGHWAY            dissolve
```

---

## The Five Chains

Signals flow through five parallel chains simultaneously.

### 1. Market (blue)

```
scout:observe --> analyst:evaluate --> trader:execute
```

Observe market tick. Evaluate signal strength + confidence. Execute trade.

### 2. Intelligence (purple)

```
forager:search --> relay:broadcast --> queen:orchestrate
```

Search onchain/sentiment/funding sources. Broadcast patterns. Queen routes strategy.

### 3. Defense (red)

```
soldier:validate --> sentinel:risk --> sentinel:circuit
```

Validate all signals. Assess risk exposure. Trip circuit breaker if needed.

### 4. Care (green)

```
nurse:monitor --> nurse:heal
```

Monitor colony health. Self-loop healing for unhealthy agents.

### 5. Recon (amber)

```
scout:scan --> forager:harvest --> queen:know
```

Scan sentiment regions. Harvest patterns. Harden into permanent knowledge.

### Parallel Execution

```typescript
await Promise.allSettled([
  world.signal({ receiver: "scout:observe", ... }),
  world.signal({ receiver: "forager:search", ... }),
  world.signal({ receiver: "soldier:validate", ... }),
  world.signal({ receiver: "nurse:monitor", ... }),
  world.signal({ receiver: "scout:scan", ... }),
])
```

All five chains fire simultaneously. No coordination needed. The substrate handles it.

---

## Learning

Four phases. Each feeds the next.

### Phase A: Bootstrap (GPU)

Historical data. 100k+ candles. 234 patterns discovered.
Top performers: `6dim_strong_bear` (76%), `6dim_flat_high` (72%), `volume_breakout` (67%).

### Phase B: Continuous (Real-Time)

Every precursor triggers prediction tracking.
Verified at 6 horizons: 1m, 5m, 15m, 1h, 4h, 1d.
Pheromones strengthen on correct prediction, weaken on miss.

### Phase C: Reflective (Attribution)

10-factor analysis on every trade close:

1. Regime stability
2. Trend alignment
3. Volatility impact
4. Volume confirmation
5. Timeframe alignment
6. Pattern maturity
7. Recent accuracy
8. Pattern-in-regime accuracy
9. Entry timing
10. Signal vs noise

Generates hypotheses. Confirms after 30 observations.

### Phase D: Hardening (Permanence)

```
signal-path (ephemeral)
  --> tier derived: elite | danger | promising
    --> superhighway: trail >= 85, traversals >= 100
      --> hardening-ready: elite + 100 traversals + trail >= 80
        --> known-pattern (permanent)
          --> pattern-embedding (semantic similarity)
            --> transfer across missions & colonies
```

### Tier Classification (Classifier Functions)

```
TIER        WIN RATE    TRAIL      TRADES    MEANING
elite       >= 75%      >= 70      >= 50     proven intelligence
promising   >= 60%      any        20-49     needs more data
danger      < 40%       resistance>=25  >= 30     avoid this path
superhighway any        >= 85      >= 100    colony's highway
```

These are DERIVED, not assigned. TypeDB classifier functions evaluate on query (or pipelines materialize them on a schedule).

---

## The Genome

Every agent has heritable parameters (0.0 - 1.0):

```
pheromone_sensitivity    // trail following strength
exploration_bias         // novelty seeking
deposit_threshold        // success required to mark
risk_tolerance           // uncertainty acceptance
mutation_rate            // offspring variation
```

### Reproduction

Eligible when: fitness >= 0.3, Sharpe >= 0.5, win rate >= 45%, trades >= 20, drawdown < 30%.

```
asexual:  clone + mutate genome
sexual:   crossover two parents + mutate
```

### Death

Triggers: 10 consecutive losses, fitness < 0.1, drawdown > 25%, resources depleted.

### Fitness

```
fitness = 0.4 * efficiency + 0.3 * success_rate + 0.3 * pheromone_value
```

Top 10% always survive (elite preservation). Population: 5-100 agents.

---

## The Governance

The colony doesn't vote. The colony IS the vote.

### Stigmergic Policy

1. Behavioral patterns emerge from collective action
2. Rules detect patterns (80% of agents choosing action X)
3. Patterns know into policies
4. Policies auto-execute (high consensus confidence)

### Treasury

Per-account wallets. Daily limits. Authorized by colony fitness.
Every transaction recorded. Fully auditable.

### Voting (When Needed)

Vote weight = activity multiplier * success multiplier * tenure multiplier.
Delegation supported. Can redelegate.

---

## Cross-World Intelligence

Colonies gossip via Agentverse P2P.

### Pattern Sharing

```
World A hardens pattern
  --> gossip to World B
    --> World B tests pattern
      --> success rate tracked
        --> trust score derived
```

### Trust Tiers

```
TIER         SCORE    BEHAVIOR
trusted      > 60%    auto-apply pending patterns
neutral      30-60%   manual review
untrusted    < 30%    flag for rejection
```

### The Network Effect

More colonies = more patterns = faster hardening = smarter group.
Each colony learns from every other colony's discoveries.

---

## ONE Ontology

Everything maps to six dimensions:

```
1. GROUPS       colonies, teams, missions
2. ACTORS       agents with castes and genomes
3. THINGS       concepts, puzzles, regions, pheromones
4. CONNECTIONS  edges with pheromone-weighted STAN paths
5. EVENTS       traversals, observations, discoveries, care
6. KNOWLEDGE    patterns, superhighways, embeddings
```

### Map to Real World

```
DIMENSION      SUBSTRATE API
Groups         world()
Actors         world.add(id)
Things         world.add(id)  // things are units too
Connections    world.mark(path, weight)
Events         world.signal(signal, from)
Knowledge      world.highways() + know()
```

---

## Data Streams

External world flows into the colony:

```
STREAM              SOURCE          ENTITY
price-tick          exchanges       market-state
candle              OHLCV           regime detection
funding-snapshot    perps           funding rate signals
orderbook-snapshot  L2 depth        imbalance detection
news-event          feeds           sentiment scoring
on-chain-event      blockchain      whale activity
market-snapshot     Polymarket      binary arbitrage
```

### Derived Signals (Inference)

```
high-funding:       |funding_rate| > 0.001
orderbook-imbalance: |imbalance| > 0.30
arbitrage-spread:   spread >= 5 cents
high-impact-news:   |sentiment| > 0.7 AND severity = "high"
significant-transfer: amount > $10M
whale-accumulation: sustained inflow pattern
```

---

## Regime Intelligence

The colony detects and predicts market regime transitions.

### Detector Group

7 specialized detector ants: ATR, volume, breakout, funding, OI, time, divergence.
Each makes independent predictions. Pheromone deposited on correct predictions.

### Precursor Patterns

```
PRECURSOR          WHAT IT TRACKS
atr-ratio          volatility expansion/contraction
volume-ratio       volume surge detection
momentum           directional strength
price-position     position within range
rsi-divergence     momentum vs price divergence
funding-rate       perpetual funding pressure
oi-change          open interest shifts
```

### Know

When 30+ observations at 75%+ accuracy: becomes permanent knowledge.
Records: reliable precursors, unreliable ones, optimal response, confidence.

---

## Volatility Sizing

Position size adapts to volatility regime automatically.

```
REGIME      DVOL RANGE    MULTIPLIER
low         <= 35         1.25x
normal      35-55         1.00x
elevated    55-80         0.50x
extreme     > 80          0.25x
```

No manual intervention. Inference rules classify regime. Position sized accordingly.

---

## STAN Hard Gates

Four gates that cannot be overridden:

```
1. REGIME ALIGNMENT     no LONG in sideways regime
2. WALK-FORWARD         block if historical Sharpe < 0
3. CAUSAL VALIDATION    block if > 70% spurious correlation
4. SKEPTIC SURVIVAL     block if < 33% adversarial tests passed
```

All four must pass. Any failure = signal dissolves. Group continues.

---

## The Emergence Mechanism

No central controller. Intelligence emerges from:

1. **Local deposits** — agents mark successful paths
2. **STAN routing** — pheromone lowers cost, attracts traffic
3. **Asymmetric decay** — success persists, failure fades
4. **Genetic variation** — offspring explore parameter space
5. **Fitness selection** — best genomes reproduce
6. **Hardening** — ephemeral patterns become permanent
7. **Cross-colony transfer** — proven patterns spread

### Observed Emergence (Real)

- Superhighway formation: 77% pheromone growth despite 1% decay
- Coordinated priority: all cycles select same gap type (no instruction)
- Pattern reuse: discovered pattern applied 4 consecutive cycles at 100% success
- Feedback amplification: Pheromone up, Difficulty down, Priority up, Speed up
- Crash detection: 6-ant group achieves 62.1% accuracy independently

---

## The Plan

### What exists (ants-at-work)

- 19 TQL schemas defining the complete ontology
- Python agents implementing caste behaviors
- STAN VIII algorithm with 4 hard gates
- TypeDB as source of truth for all pheromone state
- 6 standalone pattern libraries
- 5+ mission schemas
- Cross-colony gossip via Agentverse

### What exists (envelopes)

- 70-line substrate (signal, mark, follow, fade)
- World with 9 agents, 5 parallel chains
- ONE runtime (6 dimensions, world API)
- ASI orchestrator with confidence routing
- WorldGraph with 6 metaphor skins
- AgentWorkspace with colony visualization

### What's next

1. **Rename substrate** — payload to data, send to signal, mark to drop, smell to sense. Add follow.
2. **Wire TypeDB** — persist.ts already exists. Connect pheromone state to TypeDB.
3. **Live pheromone UI** — show mark/fade/highway in real-time on WorldGraph.
4. **Genome parameters** — each unit carries a genome. Fitness drives reproduction.
5. **Inference rules in UI** — show derived tiers (elite/danger/promising) on edges.
6. **STAN routing** — effective_cost formula in world.follow().
7. **Cross-colony** — agentverse.ts connects to Fetch.ai for P2P gossip.
8. **Hardening UI** — visualize ephemeral to permanent knowledge pipeline.
9. **Mission isolation** — tag signals with mission-id, share known patterns.
10. **Detector group** — regime intelligence with 7 detector ants.

---

*Signal. Mark. Follow. Fade. Highway. The colony knows.*

---

## See Also

- [flows.md](flows.md) — How ant-inspired flows produce highways and knowledge
- [people.md](one/agents.md) — Substrate units mapped from ant castes
- [group.md](group.md) — Coordination patterns derived from colony behavior
- [knowledge.md](one/knowledge.md) — Five forces including stigmergic memory
- [events.md](one/events.md) — Pheromone as the original signal primitive
- [substrate-learning.md](substrate-learning.md) — World optimization as reinforcement learning
