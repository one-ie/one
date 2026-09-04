<!--
THE PLAN — DESIGN + a lightweight cycle breakdown folded into one file (this
repo has no separate template-todo.md/W1-W4 engine — see text/newsletter-workflow.md's
header note). Runs after the promise, designs only the gap the promise names.

STATUS (2026-07-11) — see text/newsletter-workflow.md's status note for the
full account. Both open Clarifications below turned out resolvable/moot:
- The `tool` step config shape IS now confirmed empirically — clone the
  platform's built-in `newsletter-welcome` template (`workflow:create({fromTemplate:
  "newsletter-welcome", ...})`) rather than hand-authoring a diff. Real shape:
  `{"receiver":"message:send","args":{"channel":"email","to":"$trigger.address",
  "subject":"...","body":"...","campaign":"..."}}`; delay steps are `{"days":N}`,
  not `{until}` — simpler than schemas.js's internal-signal comment implied.
- The funnel/lifecycle question is moot: neither is buildable with the
  current key regardless of shape (see promise status note) — funnel:advance
  is additionally broken independent of permissions.
New, unplanned finding: `workflow:trigger({source, slug, triggerPayload})`
is the actual firing mechanism, and it works with the current agent-class
key (manage_workflows) even though visitor:identify/lifecycle:save don't
(manage_actors/manage_lifecycle) — this repo's role appears to hold
manage_workflows but not manage_actors/manage_lifecycle, an asymmetry not
mentioned anywhere before this session.
-->
---
title: Newsletter → contact → welcome workflow → lifecycle — design
slug: newsletter-workflow
type: plan
tier: complex
source_of_truth:
  - text/newsletter-workflow.md   # the promise this design must keep
---

# Newsletter → contact → welcome workflow → lifecycle — design

## The promise (from PROMISE)

Submitting the footer form resolves a real contact, moves it through a `newsletter` lifecycle, and starts a 3-email welcome workflow (immediate, +3d, +7d) — all inspectable via `workflow:runs`.

## Reuse verdict

**Extend, not build new infrastructure.** Every primitive this needs already exists as a substrate receiver — no new schema, no new backend code, only: two local artifacts we author once (a lifecycle TOML we push, and a funnel + workflow graph we author via `one ask`), plus rewiring the existing `site/src/pages/api/newsletter/subscribe.ts` and `packages/plugin-newsletter/src/index.ts` (both built this session) to call the richer receivers instead of bare `audience:subscribe`.

## Evidence (verified, dated 2026-07-11)

All against `node_modules/.bun/@oneie+sdk@0.14.5+7492c01c6988791b/node_modules/@oneie/sdk/dist/{receivers,schemas}.js`.

| Claim | Status | Evidence |
|---|---|---|
| `visitor:identify` upserts a contact and returns its id | ✅ shipped | `receivers.js:260-283` — response `{ok, aid, merged, reason}`; `aid` is exactly the handle `entity:tag` needs |
| `audience:subscribe` alone gives no contact id | ✅ confirmed gap | `receivers.js:2668-2674` — response `{ok}` only, no id (why our current route can't do lifecycle moves) |
| `entity:tag` is the sole lifecycle-stage-move writer | ✅ shipped | `receivers.js:1510-1532` — `move:{lifecycle, from?, to, by?, source?}` |
| `funnel:advance` does contact-resolve + lifecycle-move in one public call | ✅ shipped | `receivers.js:1570-1587` — `auth:"public"`, `effect:"signal"`, response `{ok, nextStepSlug?, lifecycleStage?}` |
| Funnel steps are opaque (no shared vocabulary with workflow steps) | ✅ confirmed | `receivers.js:1548-1559` — `funnel:update-step` request `steps: z.array(z.unknown())` |
| Workflow steps are a locked, typed 8-kind vocabulary incl. `delay` | ✅ shipped | `schemas.js:157-166` — `StepKind` enum; `delay` → `signal("time:wait",{until})`, suspends |
| `workflow:apply-diff` is how a workflow's step graph is authored | ✅ shipped | `receivers.js:2125-2143` — `WorkflowDiffSchema` (`schemas.js:170-189`), `add[]` with `{tempId, kind, name, config, position?, afterStepId?}` |
| `workflow:run` starts a run, supports `idempotencyKey` | ✅ shipped | `receivers.js:2144-2156` — request `{workflowId, triggerPayload?, idempotencyKey?}` |
| `message:send` is the channel-neutral send a `tool` step would invoke | ✅ shipped | `receivers.js:2698-2704` — request `{workspace, channel, to, subject?, body, campaign?}` |
| ❌ **gap**: the `tool` step's `config` field is `z.string()` — opaque JSON, binding format to `message:send` not confirmed | ❌ open | `schemas.js:175` (`config: z.string()`) — no example in receivers.js shows a filled `tool`-step config |

## Design

### The pipeline (per form submission)

1. **Contact + lifecycle move** — route calls `funnel:advance({workspaceSlug, funnelSlug:"newsletter-signup", stepSlug:"capture-email", visitorHash, formData:{email}})`. Internally this resolves/creates the contact and moves the `newsletter` lifecycle to `subscribed` via `entity:tag`. Response gives `lifecycleStage`.
2. **Welcome sequence start** — route then calls `workflow:run({workflowId:<newsletter-welcome id>, triggerPayload:{email}, idempotencyKey: sha256(email)})` so a double-submit from the same address never starts two runs.
3. **The workflow graph** (authored once via `workflow:create` + `workflow:apply-diff`, not per-submission):
   ```
   trigger (form:newsletter) → tool (message:send, welcome #1)
     → delay (time:wait, +3d) → tool (message:send, email #2)
     → delay (time:wait, +7d) → tool (message:send, email #3)
   ```
4. **Lifecycle stage 2** — `confirmed` moves whenever the existing `audience:confirm` opt-in link is clicked (untouched by this plan, already wired to double opt-in); `engaged` moves are a later concern (out of scope here — see promise).

### Local artifacts

- `data/lifecycles/newsletter.toml` — stages `subscribed`, `confirmed`, `engaged`. `one push` → `lifecycle:save`. (Auto-advance stays unavailable per the known `enter_when` limitation — stage 1 moves via `funnel:advance`'s internal `entity:tag` call, not automatically.)
- No local file for the funnel or workflow — `funnel:create`/`funnel:update-step`/`funnel:publish` and `workflow:create`/`workflow:apply-diff` are one-time `one ask` calls (this repo has no TOML convention for funnels/workflows, only types and lifecycles per `apps/one/CLAUDE.md`'s `data/` table).

### Package surface (`packages/plugin-newsletter/src/index.ts`)

Add two exports alongside the existing `subscribeToAudience`/`bindNewsletterForms`:
- `advanceNewsletterFunnel(client, {workspaceSlug, funnelSlug, stepSlug, visitorHash, formData})` — thin wrapper over `funnel:advance`, throws on non-`ok` the same way `subscribeToAudience` does.
- `triggerWelcomeWorkflow(client, {workflowId, email})` — wraps `workflow:run` with `idempotencyKey` derived from the email (so the plugin owns the hash, callers don't reimplement it).

### Route (`site/src/pages/api/newsletter/subscribe.ts`)

Replace the direct `subscribeToAudience` call with `advanceNewsletterFunnel` (keeps the same 503/400/502 shape), then fire `triggerWelcomeWorkflow` — non-blocking is fine (log/ignore failure) since the contact + lifecycle move is the part the user-facing response depends on; the welcome sequence starting is best-effort from the request's point of view.

## Pre-mortem (assume it shipped and failed — why?)

| Failure mode | Likelihood | Becomes test |
|---|---|---|
| `tool` step's `config` JSON binding to `message:send` is wrong shape — workflow silently no-ops or errors on the send step | **high** — this is the one unconfirmed primitive | Before authoring the real diff: `workflow:list({templates:true})` → `workflow:get` on any template containing a `tool` step, read its `config` verbatim, mirror the shape exactly |
| `workflow:run`'s suspended `delay` step doesn't actually wake after real wall-clock days in practice (durability of a multi-day-suspended DO) | medium | `workflow:runs` polled a day after a short (1-minute, via a test-only workflow) delay step to confirm it resumes before committing to the real 3d/7d graph |
| Funnel step's `stepSlug` progression (capture-email → confirm-email → subscribed) doesn't match what `audience:confirm`'s click-through actually reports back — two disconnected state machines (funnel cursor vs audience consent state) | medium | Manually trace one full signup: submit → confirm-email click → check both `funnel:advance`'s `nextStepSlug` and the lifecycle stage agree |
| Double-submit from the same address (form re-submit, browser back-button) starts two workflow runs before `idempotencyKey` dedupes | low — `idempotencyKey` is documented as deduping, but derive it from the email deterministically (not a random value) or the guarantee is void | Submit the same email twice in quick succession; `workflow:runs` shows exactly one run |
| `funnel:advance`'s `signal` effect (fire-and-forget) means the route can't tell the difference between "accepted" and "silently dropped" | medium | Route treats `ok:true` in the immediate response as sufficient; do not assume `nextStepSlug`/`lifecycleStage` are always populated (they're optional in the schema) |

## Decisions (this, not that, because)

- **`funnel:advance` over hand-wired `visitor:identify` + `entity:tag`** — because it's the substrate's purpose-built public front door for exactly this (one call, not three), even though it requires authoring a funnel first.
- **Workflow authored once via direct `one ask` calls, not a local TOML** — because unlike lifecycles/types, this repo's `data/` convention doesn't cover funnels/workflows yet; adding one would be scope beyond this promise.
- **`workflow:run` fired best-effort (non-blocking) from the route** — because the user-facing contract (form shows "Subscribed ✓") depends only on the funnel/lifecycle call succeeding; the welcome sequence starting is a side effect, not something worth failing the HTTP response over.
- **`idempotencyKey` derived from the email, not random** — because the dedup guarantee only holds if the same submission produces the same key; a random key defeats the purpose entirely.

## Clarifications (open — resolve before authoring the real workflow diff)

- **Q:** What is the exact JSON shape of a `tool` step's `config` field when it should invoke `message:send`?
  **A:** Unresolved. Next step: `one ask workflow:list '{"templates":true}'` → find any template with a `tool` step → `one ask workflow:get '{"workflowId":"<id>"}'` → read its `config` string verbatim. This blocks writing the real `workflow:apply-diff` payload for deliverable 3 — everything else in this plan can proceed independently.
- **Q:** Does `funnel:advance`'s lifecycle move for the first step land on `subscribed` automatically, or does the funnel definition need an explicit `entity:tag` call embedded in its (opaque) step config?
  **A:** Unresolved — `funnel:update-step`'s steps are `z.unknown()`, so this is only answerable empirically once a funnel exists: create the funnel, advance it once, then check `entity:tag`'s effect via a lifecycle read-back.

## Out of scope

- The `engaged` lifecycle stage's trigger condition (what actually counts as "engaged" — an email open? a reply? a site revisit?) — not designed here, deferred to a follow-up promise once the welcome sequence itself is proven.
- Any UI for authoring/editing the funnel or workflow graphs — both are one-time `one ask` calls run manually, not a feature this repo ships.
