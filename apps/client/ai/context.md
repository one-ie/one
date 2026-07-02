# Company context — {{Business Name}}

> Fill in every `{{placeholder}}` with your real facts before `one push`. Every
> agent reads this file on **every turn** — it is the ground truth they speak
> from. Keep it true; agents inherit its errors.

## Who we are

- **{{Business Name}}** — {{one line: what you do, for whom}}.
- Core offerings: {{offering 1}}, {{offering 2}}, {{offering 3}}.
- **Tone:** {{how you want agents to sound — direct, formal, playful, etc.}}.
- Our customers are {{who you sell to}}.
- We run on the ONE platform (one.ie) for agent infrastructure and workspace management.

## The four lifecycle departments

Every contact is one person moving through one or more of these pipelines.
Departments are lenses — they overlap on the same contact record. This is a
proven default shape — trim or extend it to match how you actually sell and
deliver.

### Marketing (`lifecycle:marketing:*`)
```
awareness → interest → consideration → intent
```
Entry: {{how a lead first finds you}}.
Exit to sales: {{the signal that moves a lead to sales}}.
**Agent:** `<slug>--marketing` — {{what it writes/does}}.

### Sales (`lifecycle:sales:*`)
```
prospect → qualified → proposal → negotiation → closed_won | closed_lost
```
{{your qualification + pricing model, one paragraph}}.
**Agent:** `<slug>--sales` — {{what it does}}.

### Service (`lifecycle:service:*`)
```
open → triaged → active → resolved → closed
```
Entry: customer issue reported via chat, email, or call.
Priority: `p1` (customer blocked) · `p2` (degraded) · `p3` (question) — set your own SLAs.
**Agent:** `<slug>--service` — {{what it does}}.

### Education / Retention (`lifecycle:education:*`)
```
onboarded → activated → advocate | churned
```
{{how you keep a customer winning after the sale}}.
**Agent:** `<slug>--education` — {{what it does}}.

## Signal conventions

- Moving a contact: `entity:tag(id, remove:[old_tag], add:[new_tag])`
- Escalating to a human: `human:ask(assignee, prompt)`
- Posting to a contact thread: `space:post(group, content)`
- Reporting completion: `mark(outcome)` after every closed deal, resolved ticket, or milestone
