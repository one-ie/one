<!--
THE PROMISE — the first file and the genesis of this feature. Everything else
(-plan, code, docs) derives from this and reconciles upward to it. Adapted
from the ONE monorepo's text/template-feature.md for this business node: no
`/do` harness is installed here (no do-promise-lint.sh, no schema/one.tql
reconciliation — this repo never touches the substrate schema, only calls
existing receivers via `one ask` / the SDK). `accept:` checks below are real
commands you can run from this repo root; `proof:` is their && -join.

STATUS (2026-07-11) — BUILD ran, hit a real permission wall, scoped down.
Shipped: deliverable 3 (workflow). Blocked, deferred pending an admin/owner-
class ONE_API_KEY: deliverables 1 (lifecycle) and 2 (funnel) — visitor:identify
(manage_actors) and lifecycle:save (manage_lifecycle) both return `forbidden`
for the current agent-class key, contradicting this repo's CLAUDE.md claim
that ONE_API_KEY is owner-class. Deliverable 2 is additionally a dead end on
its own merits: funnel:advance returns funnel_not_found against a funnel
proven to exist server-side (re-create fails on a UNIQUE constraint), with no
funnel:get to introspect why — treat funnel:* as unusable until that's
understood, independent of credentials. Deliverables 4-6 (route rewiring)
did not require code changes: the shipped route already calls
audience:subscribe, and the workflow's trigger_source ("receiver:audience:confirm")
fires correctly when workflow:trigger is called with that source (verified:
a real run started and was confirmed via workflow:runs) — whether the
backend's own audience:confirm call does this automatically on a real
confirm click was not independently verified (inferred from the trigger_source
naming convention, not proven end-to-end with a live click-through).

ROOT CAUSE (found in ../../one-ie, 2026-07-11) — ONE_API_KEY here was minted
via `one onboard`, which provisions an AGENT-typed actor (world_actors.actorType
= 'agent'). one.ie/web/src/pages/api/ask/[...receiver].ts derives callerKind
from that actor's type for ANY key tied to it — so no amount of role/tier
change fixes it. Two distinct consequences: (a) manage_actors is categorically
hard-blocked for callerKind:'agent' (receiver-envelope.ts AGENT_FORBIDDEN_LABELS,
by design — agents can't autonomously manage human contacts), no workaround
possible on an agent-typed actor; (b) manage_lifecycle requires world_actors.role
IN ('owner','admin') for this workspace (world-receivers.ts requireGroupOwner),
which an onboarded agent doesn't hold. `one setup` no-ops on an existing
workspace (bootstrap-only, doesn't upgrade an existing actor's type).
world:mint-owner-key is staff-only and itself gated behind manage_clients
(also agent-blocked) — not self-serve. THE FIX: `one login` — interactive
browser/passkey sign-in — persists a genuinely HUMAN-typed key to
~/.config/oneie/key. Once run, copy that key into ONE_API_KEY in .env.local
and .dev.vars to fix both blockers for the site's runtime too, permanently.
This is the one remaining step and it requires interactive human auth —
no CLI/API workaround exists.

RESOLVED (2026-07-11, later same day) — the device flow was MISSING server-side
(the CLI's endpoints never existed); implemented in one-ie as RFC 8628 routes
(/api/auth/mcp/device/{code,token,approve} + /device page, migration 0196),
merged to main (3d4019a9), deployed to one.ie. `one login` now works and was
used live: userId=tony, human-class key stored. ONE_API_KEY swapped in
.env.local + site/.env.local + site/.dev.vars. Verified with the new key:
visitor:identify → ok (minted person:2886ca524857); lifecycle:save → ok after
fixing the stage shape (stages REQUIRE slot:number + subSteps:[] — the TOML
example's {id,label} alone binds undefined → D1_TYPE_ERROR); the `newsletter`
lifecycle (subscribed/confirmed/engaged) is now LIVE in the workspace.
Deliverable 1 ✅. Still open: entity:tag returned ok+tags but NO `moved`
receipt for the stage move — investigate what entity shape a lifecycle move
requires before wiring the funnel (deliverable 2, funnel:advance also still
returns funnel_not_found — unchanged by the key fix, it's a handler issue).
The old agent key (one-7df18f…) is still valid in world_keys — revoke it via
/profile/api-keys if it should die.
-->
---
title: Newsletter → contact → welcome workflow → lifecycle
slug: newsletter-workflow
type: feature

deliverables:
  - item: "Lifecycle `newsletter` defined (stages: subscribed → confirmed → engaged) and pushed to the workspace"
    accept: "test -f data/lifecycles/newsletter.toml && grep -q 'id.*=.*\"newsletter\"' data/lifecycles/newsletter.toml"
  - item: "Funnel `newsletter-signup` created and published — steps capture-email → confirm-email → subscribed"
    accept: "one ask funnel:advance '{\"workspaceSlug\":\"template\",\"funnelSlug\":\"newsletter-signup\",\"stepSlug\":\"capture-email\",\"visitorHash\":\"promise-probe\",\"formData\":{\"email\":\"probe@example.com\"}}' | grep -q '\"ok\":true'"
  - item: "Welcome workflow `newsletter-welcome` created — tool(send #1) → delay(3d) → tool(send #2) → delay(7d) → tool(send #3), status active"
    accept: "one ask workflow:list '{\"slug\":\"template\"}' | grep -q 'newsletter-welcome'"
  - item: "Subscribe route calls funnel:advance (contact + lifecycle) then workflow:run (welcome sequence), idempotent per address"
    accept: "grep -q 'funnel:advance\\|advanceNewsletterFunnel' site/src/pages/api/newsletter/subscribe.ts && grep -q 'workflow:run\\|triggerWelcomeWorkflow' site/src/pages/api/newsletter/subscribe.ts"
  - item: "@oneie/plugin-newsletter exposes the funnel + workflow helpers so the site route stays thin"
    accept: "grep -q 'advanceNewsletterFunnel' packages/plugin-newsletter/src/index.ts && grep -q 'triggerWelcomeWorkflow' packages/plugin-newsletter/src/index.ts"
  - item: "A real form submission is traceable end-to-end: contact resolved, lifecycle stage moved, workflow run started"
    accept: "one ask workflow:runs '{\"workflowId\":\"<id-from-deliverable-3>\",\"limit\":1}' | grep -q '\"status\"'"

assumes:
  - "ONE_API_KEY set and backend-connected (one() returns non-null) — already true, verified this session"
  - "audience:subscribe / visitor:identify / entity:tag / funnel:* / workflow:* receivers exist and are callable with the workspace owner key — verified this session (receivers.js, schemas.js)"
  - "PENDING — the `tool` step's `config` JSON shape for invoking message:send/broadcast:send inside a workflow is NOT yet confirmed. Resolve via SURVEY (workflow:list templates=true → workflow:get on an existing example) before DESIGN commits to the exact diff for deliverable 3."

proof: "test -f data/lifecycles/newsletter.toml && grep -q 'id.*=.*\"newsletter\"' data/lifecycles/newsletter.toml && one ask funnel:advance '{\"workspaceSlug\":\"template\",\"funnelSlug\":\"newsletter-signup\",\"stepSlug\":\"capture-email\",\"visitorHash\":\"promise-probe\",\"formData\":{\"email\":\"probe@example.com\"}}' | grep -q '\"ok\":true' && one ask workflow:list '{\"slug\":\"template\"}' | grep -q 'newsletter-welcome' && grep -q 'funnel:advance\\|advanceNewsletterFunnel' site/src/pages/api/newsletter/subscribe.ts && grep -q 'workflow:run\\|triggerWelcomeWorkflow' site/src/pages/api/newsletter/subscribe.ts && grep -q 'advanceNewsletterFunnel' packages/plugin-newsletter/src/index.ts && grep -q 'triggerWelcomeWorkflow' packages/plugin-newsletter/src/index.ts"

derives:
  plan: true
  todo: true
  docs: false
  tests: false

world:
  lifecycle: ["subscribed → confirmed: audience:confirm click, entity:tag move", "confirmed → engaged: first workflow tool step fires, entity:tag move"]
  workflow: ["trigger: form submission via funnel:advance", "tool: message:send welcome email #1", "delay: 3 days", "tool: message:send email #2", "delay: 7 days", "tool: message:send email #3"]
  agents: []
  skills: []
  tasks:
    tags: ["slug:newsletter-workflow"]
  tracking:
    marks: ["funnel:advance ok:true", "workflow:run started", "each workflow tool step sent"]
    warns: ["funnel:advance error", "workflow:run failure", "workflow stuck >1 step past its delay window"]
  routing: []
  views: ["lifecycle: newsletter stages visible on /u/template/lifecycles"]
---

# Newsletter → contact → welcome workflow → lifecycle

## Who this is for
A visitor to the site who submits their email in the footer newsletter form.

## What they get
Their email becomes a real, trackable contact in the workspace's CRM — not just a consent-list row — that automatically receives a 3-touch welcome sequence over the following week and is visible moving through a `newsletter` lifecycle (subscribed → confirmed → engaged) on `/u/template/lifecycles`.

## Why it matters
Before: `audience:subscribe` writes a consent tag and nothing else is traceable — no contact id, no lifecycle visibility, no automated follow-up. After: one form submission resolves a real contact, moves it through a named lifecycle, and starts a workflow that sends three welcome emails on a schedule, all inspectable via `workflow:runs`.

## The promise (PROVE checks this)
Submitting the footer form with a real email address results in: (1) a resolvable contact (via `funnel:advance` → `visitor:identify`), (2) a `newsletter` lifecycle stage move recorded via `entity:tag`, and (3) a started `newsletter-welcome` workflow run, visible via `workflow:runs`, whose first step sends a welcome email immediately and whose remaining steps are scheduled 3 and 7 days out.

## The deliverables (the schedule of work)

| # | Deliverable | Accepted when |
|---|---|---|
| 1 | `newsletter` lifecycle defined and pushed | `data/lifecycles/newsletter.toml` exists with the right stages, `one push` succeeds |
| 2 | `newsletter-signup` funnel created + published | `funnel:advance` on its first step returns `ok:true` |
| 3 | `newsletter-welcome` workflow authored (3 sends, 2 delays) | `workflow:list` shows it, status active |
| 4 | Subscribe route calls funnel:advance then workflow:run | grep confirms both calls in the route (or the plugin functions it delegates to) |
| 5 | Plugin exposes the two new helpers | grep confirms both exports in `packages/plugin-newsletter/src/index.ts` |
| 6 | End-to-end trace works on a real submission | `workflow:runs` shows a run for a real subscribe |

**Completeness clause:** this schedule is exhaustive and acceptance is indivisible — every line delivered and green together, or the promise settles broken.

## Out of scope (excluded, in writing)

- Not this: re-engagement/winback sends for existing contacts — that's `audience:winback`, a separate concern.
- Not this: a visual funnel/workflow builder UI in this repo — funnels and workflows are authored via `one ask` calls (CLI), not a drag-and-drop surface here.
- Not this: unsubscribe handling changes — `audience:unsubscribe`/`audience:confirm` already exist and are untouched by this promise.
- Not this: confirming the exact `tool` step config shape for arbitrary receivers beyond `message:send` — only the welcome-email send path is designed here.

## The proof (the acceptance test the whole spine points at)
Every deliverable's accept check, `&&`-joined — see `proof:` above. True only when the lifecycle, funnel, and workflow all exist server-side, the route calls both correctly, and a real submission produces an inspectable workflow run.

## Tone
Concrete, verifiable, no hand-waving on the one open unknown (tool-step config shape) — name it, resolve it at SURVEY, don't paper over it.
