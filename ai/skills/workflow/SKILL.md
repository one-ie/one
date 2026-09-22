---
name: workflow
description: Write a workflow this site will actually run — the eight step kinds, the fenced graph block that makes it executable, and the trap where beautifully-written prose compiles to a workflow with zero steps.
model: openrouter/auto
lifecycle: beta
reads:
  - ai/context.md
---

# Workflow

A workflow is one `.md` in `ai/workflows/`. `one push` sends it as
`workflow:create`, then applies its graph as a second call.

## Prose is not a workflow

**This is the failure to check for first.** The compiler reads exactly one
thing as the step graph: a fenced block whose language is `graph`, containing
JSON. Everything else in the file — headings, tables, numbered steps, fenced
blocks marked anything else — is documentation.

A file of well-structured prose describing five steps compiles to
`workflow:create` with a name, a description, **and no steps at all**. It
succeeds. It reports success. The workspace gets an empty workflow.

Check before you claim a workflow is built:

```bash
grep -c '```graph' ai/workflows/<name>.md    # 0 means it does nothing
one push --dry-run                            # shows what would actually land
```

## The file

````markdown
---
id: order-fulfilment
label: Order → fulfilled
description: One sentence. This is what the workspace shows.
trigger: order:created
department: service
---

Prose for humans goes here. It is never executed.

```graph
{
  "steps": [
    { "id": "pick", "kind": "agent", "name": "Pick and pack",
      "config": { "actorId": "service", "instructions": "..." } },
    { "id": "ok", "kind": "human", "name": "Confirm shipped",
      "config": { "assignee": "{{ owner }}" } }
  ],
  "edges": [["pick", "ok"]]
}
```
````

`edges` takes either `["from", "to"]` or `{ "from": ..., "to": ..., "condition": ... }`.
A `config` object is stringified for you; a string is passed through.

**The frontmatter `trigger` seeds a trigger step** when the graph has none, and
wires it to the first step. So you write the trigger once, in frontmatter, and
the graph starts at the real work.

## The eight kinds

An unknown kind **throws at compile time** and names itself — that error is a
gift, not a problem to work around.

| Kind | Acts | Note |
|---|---|---|
| `trigger` | the world | usually seeded from frontmatter |
| `tool` | an integration — no judgment | |
| `skill` | a capability — scoped | one of `ai/skills/` |
| `agent` | an actor — open judgment | |
| `condition` | routes if/then | runs inline, emits no signal |
| `human` | a person approves | **suspends the run** |
| `delay` | time | runs inline, emits no signal |
| `sell` | a buyer pays | **suspends the run** |

`tool → skill → agent` is the autonomy ladder: reach for the least autonomous
one that can do the job. A step that needs no judgment should never be an
`agent`.

## Three rules worth holding

**Suspending is a design choice, not a cost.** `human` and `sell` stop the run
until someone acts. A workflow that never suspends has decided nobody needs to
approve anything — make sure that was deliberate.

**Name nobody.** An assignee, a signature, a business name belongs in a
`{{ placeholder }}`. A workflow with a person's name in it is that person's
workflow, not a template.

**A trigger must be a real surface.** `trigger:` names a source this site
actually emits. Inventing one produces a workflow that is valid, pushed, and
never fires.
