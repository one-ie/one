---
name: declare-types
description: Give this workspace a resource type — products, lessons, tickets, whatever the business actually tracks — by writing one TOML file, so navigation, a searchable index, a detail page and a create/edit form all appear without code.
model: openrouter/auto
lifecycle: beta
reads:
  - ai/context.md
---

# Declare types

A type is a TOML file in `data/types/`. `one push` sends every one of them to
`world:declare-types`, and the console generates the admin from the manifest —
a sidebar entry, an index table with search and inline cell editing, a
two-column detail page, and a create/edit form. There is no migration and no
generated code to review.

## The file

```toml
id          = "ticket"
label       = "Ticket"
description = "A support request, from open to closed"

[[fields]]
name  = "subject"
type  = "string"
label = "Subject"

[[fields]]
name  = "status"
type  = "select"
label = "Status"
```

`id` is the key the console and every signal use; `label` is what a human reads.
A file whose basename starts with `_` is skipped, which is how `data/types/`
ships sets nobody has turned on yet.

## Field types, and what each becomes

| `type` | index column | form input |
|---|---|---|
| `string` · `url` | text | text input |
| `number` | number | number input |
| `currency` | number | number input |
| `date` | formatted date | date picker |
| `tags` | tag chips | tag picker |
| `select` · `bool` | badge | dropdown |
| `image` | thumbnail | URL input |
| `markdown` | text | textarea |
| `relation` | the linked record's **name** | entity picker |

An unrecognised `type` falls back to text rather than failing the push, so a
typo degrades quietly — check the column you got, not just the exit code.

## Three things that decide the shape

**Name the status field `status`.** A type carrying a field called exactly that
gets the Table/Kanban toggle. `state`, `stage` and `phase` do not.

**Set `dimension = "actors"` for anyone who acts.** The default is `things`.
A customer, a student, a staff member signs in, holds a role and can carry a
key — that is an actor. A product, an order, a lesson is a thing. Getting this
wrong is not cosmetic: authority walks the actor tree.

**`relation` needs no target.** It resolves to the linked record's name and
draws a line between the two types in the schema designer, across both things
and actors.

## Pushing a SET

Every type file goes in **one** `world:declare-types` call, because that
receiver REPLACES the workspace manifest rather than adding to it. This matters:

> **`@oneie/cli` 4.2.0 and older sent one call per file**, so each type deleted
> the one before it — five files pushed, one type kept, and the CLI still said
> `Pushed 5/5 item(s).` Check `one --version`. On an older build, enable one
> type at a time and confirm each in the console before the next.

Because it is a replace, **a push is the whole manifest**. A type you delete
from `data/types/` disappears from the workspace on the next push. That is the
intended behaviour, not a bug — but say it out loud before you delete a file
for someone.

## Growing a type

Add a `[[fields]]` block and push again. The column appears in the index and the
form immediately. The visual schema designer edits the same manifest, so a field
added in the browser and a field added here are the same object — and the last
writer wins. Read the current manifest before a large edit rather than assuming
the file on disk is what the workspace holds.

## What this does not do yet

Image **upload** — images are URLs; there is no upload endpoint. Custom queries
and computed fields. Full custom-field admin for groups, paths, learning and
events — those render a default label only. Promise none of them.
