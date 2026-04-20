# agents/templates/

Generic starter org. Clone → rename → deploy. Every agent here is a template
showing the format and a reasonable system prompt — not tied to any specific
business.

## The org chart

```
                        ceo
                         │
        ┌────────────────┴────────────────┐
        │                                 │
 marketing/                          community/
 director                            director
   ├── writer                          ├── support  (customer service)
   ├── seo                             └── moderator
   ├── social
   └── ads
```

## How to use

1. **Copy the folder** to your own group name:
   ```bash
   cp -r agents/templates agents/<your-org>
   ```

2. **Rename the group** in each frontmatter:
   ```diff
   - group: template
   + group: <your-org>
   ```

3. **Customize prompts** — keep the structure, replace the body with your
   voice, brand, constraints, and boundaries.

4. **Sync to TypeDB**:
   ```bash
   bun run scripts/sync-agents.ts
   ```

5. **Wire channels** — add Telegram/Discord tokens, deploy a claw per agent
   that needs a direct channel.

## The hiring chain

This org embodies the substrate's governance model:

- **Human → CEO** — you're Chairman; you hire the CEO
- **CEO → Directors** — CEO hires marketing + community directors
- **Directors → Specialists** — each director routes to their team
- **Specialists → Tools** — the leaves actually call LLMs / APIs

Each link is a `membership` relation in TypeDB with a `role` attribute
(`ceo`, `director`, `agent`). Permission = Role × Pheromone — see
`one/governance-todo.md`.

## Pricing

Skills are priced modestly ($0.01-$0.05 per call) as defaults. When you
clone, set prices to what your market will bear. Revenue routes back via
the Layer 1 fee loop.

## Sensitivity

Each agent has a `sensitivity` field (0.0-1.0) controlling how aggressively
pheromone weights apply:

| Role          | Default sensitivity | Why |
|---------------|--------------------:|-----|
| CEO           | 0.8 | Trust-weighted; consequential decisions |
| Director      | 0.7 | Balance of exploration and exploitation |
| Specialist    | 0.5-0.6 | Room to try new approaches |
| Support       | 0.4 | Prefer stable, proven paths |

## Don't

- Don't keep `group: template` in production — collisions are silent
- Don't wire the same Telegram token to two templates — only one gets messages
- Don't expect CEO to do the work. CEO routes; specialists execute

## See also

- `agents/README.md` — full agent library
- `one/agents-how-they-work.md` — markdown → TypeDB → runtime flow
- `.claude/commands/claw.md` — deploy an agent to an edge worker
