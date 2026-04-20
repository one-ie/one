# Naming

Locked. Permanent. Do not rename.

---

## The 6 Dimensions

| #   | Dimension    | Ontology entity | Runtime primitive | Contains                                    |
| --- | ------------ | --------------- | ----------------- | ------------------------------------------- |
| 1   | **Groups**   | `group`         | `group`           | Containers — worlds, teams, orgs            |
| 2   | **Actors**   | `actor`         | `unit`            | Who acts — humans, agents, animals, worlds  |
| 3   | **Things**   | `thing`         | `skill` / `task`  | What exists — skills, tasks, tokens         |
| 4   | **Paths**    | `path`          | `path`            | Weighted connections — strength, resistance |
| 5   | **Events**   | `signal`        | `signal`          | What happened — signals, payments           |
| 6   | **Learning** | `hypothesis`    | `hypothesis`      | What was discovered — patterns, frontiers   |

---

## Canonical Names

These are the ONLY names for each concept. All docs, schemas, and APIs use these.

### Dimensions

| Canonical | Aliases (DO NOT USE in new code/docs) |
|-----------|--------------------------------------|
| group     | colony, swarm, namespace, tenant     |
| actor     | node, agent, person, player          |
| thing     | service, product, entity, resource   |
| path      | trail, edge, connection, link, route |
| event     | traversal, log, record               |
| learning  | knowledge, memory, intelligence      |

### Group Types

| Type        | What                             |
| ----------- | -------------------------------- |
| `world`     | Top-level container (ONE itself)  |
| `friends`   | Personal group — people you know  |
| `team`      | Working group of actors           |
| `community` | Open group — shared interest      |
| `org`       | Autonomous organization           |
| `dao`       | Governance group                  |

### Actor Types

| Type     | What                              |
|----------|-----------------------------------|
| `human`  | A person                          |
| `agent`  | An AI agent                       |
| `animal` | A biological non-human / IoT      |
| `world`  | Another ONE world (federation)    |

### Thing Types

| Type      | What                              |
|-----------|-----------------------------------|
| `skill`   | What an actor can do              |
| `task`    | Work to be done                   |
| `token`   | Value unit (SUI, USDC)            |
| `service` | Skill + price > 0                 |

### Path Fields

| Field        | What                               |
| ------------ | ---------------------------------- |
| `strength`   | Success weight — mark() increments |
| `resistance` | Failure weight — warn() increments |

### Signal Data Fields

Convention inside `data` — not a type constraint. All fields optional.

| Field     | Type        | What                                               |
|-----------|-------------|----------------------------------------------------|
| `tags`    | `string[]`  | Classification + routing key                       |
| `weight`  | `number`    | Pheromone strength. Positive marks, negative warns |
| `content` | anything    | The actual payload                                 |

### Verbs

| Verb     | What it does                         |
| -------- | ------------------------------------ |
| `signal` | Send a message: `{ receiver, data }` |
| `mark`   | Strengthen a path (success)          |
| `warn`   | Resist a path (failure)              |
| `fade`   | Decay all paths (time passes)        |
| `follow` | Route deterministically (strongest)  |
| `select` | Route probabilistically (weighted)   |
| `know`   | Promote proven path to learning      |
| `ask`    | Signal + wait for result             |
| `send`   | Signal from inside a handler         |

---

## Ontology → Runtime Map

| Ontology (one.tql) | Runtime (world.ts) | Schema (world.tql) |
|---------------------|--------------------|--------------------|
| `entity actor`      | `unit(id)`         | `entity unit`      |
| `entity thing`      | `.on(name, fn)`    | `entity skill`     |
| `entity group`      | `world()`          | `entity group`     |
| `relation path`     | `mark()` / `warn()`| `relation path`    |
| `relation signal`   | `send()` / `ask()` | `relation signal`  |
| `entity hypothesis` | `know()` / `recall()` | `entity hypothesis` |

The ontology (`one.tql`) is the permanent truth.
The runtime (`world.ts`) is the implementation.
The schema (`world.tql`) extends the ontology with operational fields.

---

## Retired Names

These names appeared in earlier versions. They are **dead**. Do not resurrect.

| Dead name      | Replaced by      | When       |
|---------------|------------------|------------|
| `knowledge`   | `learning`       | 2026-04-13 |
| `connections`  | `paths`          | 2026-03-xx |
| `people`       | `actors`         | 2026-04-13 |
| `scent`        | `strength`       | 2026-03-xx |
| `alarm`        | `resistance`     | 2026-03-xx |
| `colony`       | `community`    | 2026-04-14 |
| `emit`         | `send`         | 2026-04-14 |
| `node`         | `actor` / `unit` | 2026-04-13 |
| `trail`        | `path`           | 2026-03-xx |
| `system-prompt`| `prompt`         | 2026-04-13 |

---

## Directory Structure

The 6 dimensions ARE the directory structure. Every world follows this:

```
{world}/
  groups/       # Group definitions
  actors/       # Actor definitions (humans, agents, animals, worlds)
  things/       # Skills, tasks, tokens, services
  paths/        # Weighted connections, seed routing
  events/       # Webhooks, event handlers
  learning/     # Hypotheses, proven patterns
```

---

## The Rule

If you're writing a doc, API, schema, or UI label:
- Use the **Canonical Name** column
- If you see a **Dead Name**, replace it
- The ontology is `one.tql` — 100 lines, 6 dimensions, forever

---

*Named once. Named right. Never renamed again.*
