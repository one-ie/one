# ONE Ontology

6 dimensions. Grounded in biology. Stable forever.

**See Also:** [dictionary.md](dictionary.md) — Canonical names for all signals, units, paths, and verbs. Terms defined here are named there.

> ONE is a world. A world contains groups.
> Groups contain: actors, things, paths, events, learning.

---

## 6 Dimensions

| # | Dimension     | What it models                          | Biology           |
|---|---------------|-----------------------------------------|-------------------|
| 1 | **Groups**    | Containers — scope, isolation, nesting  | Colony structure   |
| 2 | **Actors**    | Who acts — humans, agents, animals, worlds | Individual ants |
| 3 | **Things**    | What exists — skills, tasks, tokens     | Environment        |
| 4 | **Paths**     | [Connections with weight](dictionary.md#the-path) — learned routes | Pheromone trails  |
| 5 | **Events**    | What happened — signals, payments       | Foraging activity  |
| 6 | **Learning**  | What was discovered — hypotheses, patterns | Colony memory   |

```
GROUP
 ├── actors/     humans, agents, animals, worlds
 ├── things/     skills, tasks, tokens, services
 ├── paths/      weighted connections (strength, resistance)
 ├── events/     signals that happened
 └── learning/   hypotheses, proven patterns
```

---

## The Schema (one.tql)

```tql
define

# 1. GROUPS
entity group,
    owns gid @key, owns name, owns group-type;

# 2. ACTORS
entity actor,
    owns aid @key, owns name, owns actor-type,
    owns model, owns prompt, owns generation, owns tag @card(0..);

# 3. THINGS
entity thing,
    owns tid @key, owns name, owns thing-type,
    owns price, owns tag @card(0..);

# 4. PATHS
relation path, relates source, relates target,
    owns strength, owns resistance, owns traversals;

relation capability, relates provider, relates offered, owns price;
relation membership, relates group, relates member;

# 5. EVENTS
relation signal, relates sender, relates receiver,
    owns data, owns amount, owns success, owns ts;
# data convention: { tags?: string[], weight?: number, content?: unknown }

# 6. LEARNING
entity hypothesis,
    owns hid @key, owns statement, owns confidence, owns observations;
```

3 entities. 5 relations. 22 attributes. ~100 lines total.

---

## Actor Types

| Type | What | Example |
|------|------|---------|
| `human` | A person | Tony, Donal |
| `agent` | An AI agent | scout, analyst, cmo |
| `animal` | A non-human biological actor | sensor, IoT device |
| `world` | Another ONE world (federation) | marketing-world, donal-world |

A world-as-actor is how ONE federates. One world contains another world as an actor. That actor routes signals into its own group. Worlds within worlds.

---

## Group Types

| Type | What | Example |
|------|------|---------|
| `world` | Top-level container | ONE, Donal's agency |
| `friends` | Personal group | my contacts, inner circle |
| `team` | Working group | marketing, engineering |
| `community` | Open group, shared interest | ONE builders, early adopters |
| `org` | Autonomous organization | OO Agency, Fetch.ai |
| `dao` | Governance group | token-holders |

---

## Thing Types

| Type | What | Example |
|------|------|---------|
| `skill` | What an actor can do | translate, analyze |
| `task` | Work to be done | build-api, write-copy |
| `token` | Value unit | SUI, USDC |
| `service` | Skill + price | translate @ $0.02 |

A thing with `price > 0` is a service. No separate entity needed.

---

## Why These 6

| # | Dimension | Why essential |
|---|-----------|---------------|
| 1 | Groups | Without scope, chaos |
| 2 | Actors | Without agency, nothing happens |
| 3 | Things | Without objects, nothing to act on |
| 4 | Paths | Without connections, no coordination |
| 5 | Events | Without history, no learning |
| 6 | Learning | Without memory, no intelligence |

Remove any one and the system breaks. Add more and you add redundancy.

---

## Universal Mapping

| System | Groups | Actors | Things | Paths | Events | Learning |
|--------|--------|--------|--------|-------|--------|----------|
| ONE | worlds, teams | agents, humans | skills, tasks | pheromone trails | signals | hypotheses |
| Shopify | stores | customers | products | orders | purchases | trends |
| GitHub | orgs | users | repos | PRs | commits | insights |
| Slack | workspaces | users | messages | threads | reactions | search |
| Biology | colonies | ants | food, nest | trails | foraging | highways |

One pattern. Universal mapping.

---

## Template Directory

Every new world follows this structure:

```
my-world/
  world.md          # metadata
  groups/            # .md — team, colony, org definitions
  actors/            # .md — agent definitions (frontmatter + prompt)
  things/            # .md — skills, tasks, services
  paths/             # .json — seed paths, initial routing
  events/            # .md — webhook configs, event handlers
  learning/          # .md — initial hypotheses
```

Merge into ONE: `bun run scripts/sync-world.ts --dir ./my-world`

---

*6 dimensions. 100 lines. Everything maps. Reality doesn't change.*
