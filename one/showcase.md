# showcase

> **Position:** extends [`ai-elements.md`](ai-elements.md) by defining **which** element each starter routes to. `ai-elements.md` installs the 48; this doc spends them.
> **Surface:** `/chat` empty state — `web/src/pages/chat.astro` → `web/src/components/Chat.tsx` lines 43-48 (STARTERS), 220-265 (grid).
> **Owns:** the starter→element mapping, routing mechanics, phasing.

```yaml
mode: lean
lifecycle: construction
priors:
  spec_locked: yes      # ai-elements.md fixes the 48; this doc fixes the mapping
  variance_known: yes   # one shape — replace STARTERS array, group with labels, expand grid
  exit_scalar: yes      # M/N starters render their target element, M/N >= 0.85
  files_known: yes      # Chat.tsx, ai-elements/*, claw/src/tools.ts
```

---

## why

Today `/chat` ships 48 AI Elements and renders 4 of them in normal use (`Conversation`, `Message`, `PromptInput`, `Reasoning`). The empty state shows four plain text starters that all submit identically and all return identically-shaped markdown. That's wasted real estate at the highest-intent moment of the funnel.

Turn the grid into a **demo router**. Each starter is engineered so the response forces a specific AI Element to render. Click → see the substrate's surface area. Acquisition lifts because users discover by playing; onboarding shortens because the second message is informed by what the first one rendered.

The surface stays the empty state — no new route, no new component. Just a richer `STARTERS` array plus 2-3 category headers.

---

## lighthouse 100 is a hard budget (non-negotiable)

`/chat` currently scores **100 / 100 / 100 / 100** (Performance / Accessibility / Best Practices / SEO) — locked in by commit `cb350de0` "perf: optimize for 100% Lighthouse score". This showcase MUST NOT regress any of the four. The score is the gate; everything below is how we hit it.

**The four perf invariants from `cb350de0` (don't break):**

| invariant | where | why |
|---|---|---|
| `client:idle` on `<Chat>` | `chat.astro:9` | hydration deferred until browser idle → fast LCP |
| raw `<button type="submit">`, not `<Suggestion>` | `Chat.tsx:251-262` | no extra ai-element JS shipped to empty state |
| `<form method="get" action="/chat">` with `name="q"` | `Chat.tsx:236-249` | starters work **without JS**; SSR-friendly progressive enhancement |
| `prerender = true` on `chat.astro` | `chat.astro:2` | static HTML shell, zero TTFB |

**Bundle budget for the empty state:** the empty state imports zero new ai-elements at module top level. The 4 already-imported (`Conversation`, `Message`, `PromptInput`, `Reasoning`) are the cap until a starter is *clicked*. Every other element renders only after a message is sent — by which point hydration has happened anyway. The grid itself is plain `<button>` + plain `<form>`; no React state, no `useState` for "show more", no JS-driven category collapse.

**"Show more" is CSS-only.** Use `<details><summary>` or a checkbox-hack — never React state. Hydrating the empty state for a disclosure widget would burn the score.

**Lazy-loaded elements (post-click).** Heavy elements (`Canvas`, `WebPreview`, `Sandbox`, `Plan`) are dynamic-imported inside `MessageList` so they only enter the bundle when a message containing their stream-part lands. Use `lazy(() => import('@/components/ai-elements/canvas'))` + `<Suspense fallback={null}>` per `react.md`. Already the existing pattern for `MessageList` (Chat.tsx:268).

**Accessibility budget.**
- every starter `<button>` keeps `name="q" value="..."` — works without JS, screen-reader friendly form submit
- category labels are real `<h3>` or `<h2>` (not div+styling), at the right heading level under `<Layout>`'s h1
- color contrast: stays inside the 6-token system (`design.md`); category labels use `text-font/60`, which is contrast-checked

**Pre-merge gate.** `bunx lhci autorun` (or manual Chrome Lighthouse) on `https://localhost:4321/chat` must report `[100, 100, 100, 100]` after every Phase. Document the run in W4 receipts. If a new starter requires breaking an invariant above, **change the starter**, not the invariant.

---

## the mapping

Each row: starter text (copy-paste into `STARTERS`) → user intent → trigger mechanism → AI Element rendered → element file.

| starter (exact text)                         | intent                  | trigger                                 | element            | file                                              |
|----------------------------------------------|-------------------------|-----------------------------------------|--------------------|---------------------------------------------------|
| `Why did you pick that path?`                | reasoning               | LLM emits `<reasoning>` stream part     | `Reasoning`        | `ai-elements/reasoning.tsx`                       |
| `Plan a skill launch`                        | plan / task             | claw `plan` tool → plan stream part     | `Plan` + `Task`    | `ai-elements/plan.tsx`, `task.tsx`                |
| `Show me the engine in 20 lines`             | code artifact           | LLM markdown ` ```ts `                  | `CodeBlock`        | `ai-elements/code-block.tsx`                      |
| `Cite the dictionary on highways`            | sources                 | claw `recall` tool → sources part       | `Sources` + `InlineCitation` | `ai-elements/sources.tsx`, `inline-citation.tsx` |
| `Buy 100 ONE`                                | rich payment confirm    | response carries `data.rich.payment`    | `Confirmation`     | `ai-elements/confirmation.tsx`                    |
| `Run the test suite`                         | test results            | claw `test` tool → test-results part    | `TestResults`      | `ai-elements/test-results.tsx`                    |
| `Open a sandbox for a hello-world skill`     | sandbox                 | claw `sandbox` tool → sandbox part      | `Sandbox`          | `ai-elements/sandbox.tsx`                         |
| `Preview one.ie/buy`                         | embedded web            | claw `preview` tool → web-preview part  | `WebPreview`       | `ai-elements/web-preview.tsx`                     |
| `Show the repo layout`                       | file tree               | claw `tree` tool → file-tree part       | `FileTree`         | `ai-elements/file-tree.tsx`                       |
| `What's the Signal type?`                    | schema                  | claw `schema` tool → schema part        | `SchemaDisplay`    | `ai-elements/schema-display.tsx`                  |
| `Show highways`                              | graph viz               | claw `highways` tool → canvas/edges     | `Canvas` + `Node` + `Edge` | `ai-elements/canvas.tsx`, `node.tsx`, `edge.tsx` |
| `Walk me through how a signal closes a loop` | chain of thought        | LLM emits multi-step reasoning          | `ChainOfThought`   | `ai-elements/chain-of-thought.tsx`                |
| `Queue 5 starter signals`                    | queue                   | claw `queue` tool → queue part          | `Queue`            | `ai-elements/queue.tsx`                           |
| `Switch persona to seller`                   | persona / voice         | claw `persona` tool → persona part      | `Persona`          | `ai-elements/persona.tsx`                         |

14 starters, 14 distinct elements. Default 4 visible; rest behind "show more".

---

## routing mechanics

Three trigger classes — pick the cheapest that gets the element on screen.

```
class A · keyword → markdown            (Phase 1 · no claw change)
  starter → useChat submit → LLM → ```ts``` in reply → CodeBlock auto-renders

class B · tool-backed                   (Phase 2 · claw tool stub)
  starter → useChat submit → LLM picks tool → claw tool emits stream part → element renders

class C · ui event                      (Phase 0 · already wired)
  starter → emitClick('ui:chat:claim', { payment }) → Confirmation renders inline
```

Full flow:

```
+----------+   click    +-----------+  text   +--------+  tool   +-----------+  part   +-------------+
| starter  | ---------> | emitClick | ------> | useChat |-------->|  claw     |-------->| AI Element  |
+----------+            +-----------+         +--------+         +-----------+         +-------------+
                          ui:chat:                                    /chat              renders in
                          suggestion                                  api                Conversation
```

Class A starters need only a system-prompt hint that the assistant should answer in code/markdown. Class B starters require a matching tool in `claw/src/tools.ts` that emits the right stream part shape (the AI SDK `UIMessage` part type the element consumes). Class C is already covered by `.claude/rules/ui.md`.

| class | starters | claw work |
|-------|----------|-----------|
| A     | reasoning, code, chain-of-thought | none — system prompt nudge |
| B     | plan, test, sandbox, preview, tree, schema, highways, queue, sources, persona | one tool stub per element |
| C     | buy 100 ONE | none — already wired |

---

## surface ux

Keep the existing form-submit grid (preserves the `?q=` deep-link path at Chat.tsx:236-249). Add a tiny category label above each row. Default visible: one starter per category. "Show more" reveals the rest.

```
        Hello!
        Ask me anything about ONE.

  Reason
  [ Why did you pick that path? ]  [ Walk me through how a signal closes a loop ]

  Build
  [ Show me the engine in 20 lines ]  [ Plan a skill launch ]  [ Run the test suite ]

  Buy
  [ Buy 100 ONE ]  [ Show highways ]

                        show more
```

Buttons keep the existing class verbatim — `border h-auto px-5 py-3 text-base rounded-2xl hover:bg-foreground` — and the existing border-color style. No new colors. Category label: `text-xs text-font/60 uppercase tracking-wide`. The grid stays inside the same `<form method="get" action="/chat">` so SSR/no-JS users still navigate to `/chat?q=...`.

**"Show more" implementation — CSS only.** Wrap the secondary buttons in `<details>`:

```astro
<details class="contents">
  <summary class="text-xs text-font/60 cursor-pointer list-none hover:text-font">show more</summary>
  <button type="submit" name="q" value="...">…</button>
  <!-- more buttons -->
</details>
```

`class="contents"` keeps flex-wrap layout intact. No React state, no hydration cost. `<summary>` is keyboard-accessible by default.

---

## threat model row

| defends                                                       | accepts                                                       |
|---------------------------------------------------------------|---------------------------------------------------------------|
| mismatch between marketed feature and shipped feature — every starter must point at an element actually installed in `ai-elements/` | a Class B starter whose tool isn't wired yet falls back to plain markdown — graceful degrade, never an error |
| dictionary drift — uses `skill`, `path`, `highway`, `signal` only (per `dictionary.md`) | LLM occasionally picks a different tool than expected — measured by exit scalar, not blocked |

---

## phasing

```
phase 1 · keyword-driven        (Class A — 3 starters)
  · update STARTERS array (Chat.tsx:43-48)
  · add category labels in grid
  · system-prompt hints in claw for code/reasoning style
  · zero new claw tools
  → ship. M=3/N=3 of Class A.

phase 2 · tool-backed           (Class B — 10 starters)
  · stub one claw tool per element in claw/src/tools.ts
  · each tool emits the AI-SDK UIMessage stream-part shape the element consumes
  · per-tool rubric: element renders on first response
  → ship. M/N >= 0.85 across all 14.

phase 3 · substrate-backed      (real data)
  · highways tool reads TypeDB top-N paths (persist().open())
  · recall tool feeds Sources from real TypeDB knowledge
  · sandbox/preview hit real endpoints
  → ship. Same 14 starters, real receipts.
```

---

## success metric (exit scalar)

Two numbers, both gates:

```
1. Lighthouse on /chat                      [100, 100, 100, 100]   (hard gate, not a target)
2. M = starters rendering target element    M/N >= 0.85
   N = total starters in grid (14)
```

Ship only when **both** pass. Lighthouse first — if any score drops below 100, M/N is irrelevant. Measured by `bunx lhci autorun` for #1, headless test against `/api/chat` for #2 (assert response contains expected stream-part type, or expected markdown pattern for Class A).

---

## don't

- **Don't drop Lighthouse below 100** on any of the four scores — it's the gate, not a target
- **Don't switch `<Chat>` from `client:idle` to `client:load`** — kills LCP
- **Don't replace `<button>` with `<Suggestion>`** — adds JS to the empty state
- **Don't add `useState` for "show more"** — use `<details>`, CSS-only
- **Don't eagerly import** heavy elements (`Canvas`, `WebPreview`, `Sandbox`, `Plan`) at the top of `Chat.tsx` — `lazy()` them in `MessageList`
- Don't reinvent `ai-elements.md` — this doc is the **mapping**, that doc is the **inventory**
- Don't add a starter whose target element isn't already in `web/src/components/ai-elements/`
- Don't break the `?q=` deep-link form-submit path (Chat.tsx:236-249) — keep `<form method="get" action="/chat">`
- Don't tint the grid — card body is `foreground`, buttons stay bordered (per `.claude/rules/design.md`)
- Don't introduce a new onClick without `emitClick('ui:chat:suggestion', { text })` (per `.claude/rules/ui.md`)
- Don't use dead names — `skill` not `task`, `path` not `connection`, `highway` not `trail`, `signal` not `scent` (per `dictionary.md`)
- Don't ship Phase 2 without the per-tool rubric — silent tool failures break the demo router promise

---

## appendix — element catalog (47 files in `web/src/components/ai-elements/`)

Verbatim recon — exports, what each renders, and a sample starter that would naturally trigger it. Use this when picking new starters or wiring new claw tools.

| file | exports | renders | starter prompt |
|------|---------|---------|-----------------|
| agent.tsx | Agent, AgentHeader, AgentContent, AgentInstructions, AgentTools, AgentTool, AgentOutput | container with bot icon, agent name/model header, instructions, collapsible tools, output schema | "Show me an AI agent with its tools and output schema" |
| artifact.tsx | Artifact, ArtifactHeader, ArtifactClose, ArtifactTitle, ArtifactDescription, ArtifactActions, ArtifactAction, ArtifactContent | card-like container with header bar, title, description, actions, content area | "Display an artifact with a title and some actions" |
| attachments.tsx | Attachments, Attachment, AttachmentPreview, AttachmentInfo, AttachmentRemove, AttachmentHoverCard, … | media containers with type icons (image/video/audio/document), preview hover cards, remove actions | "Show a list of attached files with media icons" |
| audio-player.tsx | AudioPlayer, AudioPlayerControlBar, AudioPlayerPlayButton, AudioPlayerSeekBackwardButton, … | media player with play/pause, seek, time display, volume controls | "Show an audio player for a podcast episode" |
| canvas.tsx | Canvas | ReactFlow graph canvas with background, delete-key, scroll/selection | "Display a node-based workflow diagram" |
| chain-of-thought.tsx | ChainOfThought, ChainOfThoughtHeader, ChainOfThoughtStep, ChainOfThoughtSearchResults, … | collapsible section with brain icon, expandable reasoning steps, search results, images | "Show the reasoning process with search results" |
| checkpoint.tsx | Checkpoint, CheckpointIcon, CheckpointTrigger | horizontal line with bookmark icon and trigger button for saved checkpoints | "Display a checkpoint marker in a workflow" |
| code-block.tsx | CodeBlock, CodeBlockContainer, CodeBlockHeader, CodeBlockTitle, CodeBlockFilename, CodeBlockActions, … | syntax-highlighted code with copy button, language selector, optional filename | "Show a Python code snippet with syntax highlighting" |
| commit.tsx | Commit, CommitHeader, CommitHash, CommitMessage, CommitMetadata, CommitDiff, … | collapsible git commit with hash, message, author avatar, timestamp, expandable diff stats | "Show a git commit with diff information" |
| confirmation.tsx | Confirmation, ConfirmationTitle, ConfirmationRequest, ConfirmationAccepted, ConfirmationRejected, … | alert box for tool approval; conditional request/accepted/rejected states; action buttons | "Show a confirmation dialog for a tool action" |
| connection.tsx | Connection | SVG animated curved path with circle endpoint for ReactFlow connections | "Draw a connection line between nodes" |
| context.tsx | Context, ContextTrigger, ContextContent, ContextInputUsage, ContextOutputUsage, ContextReasoningUsage, ContextCacheUsage | hover card with token-usage progress bars (input/output/reasoning/cache) | "Show token usage statistics for an API call" |
| controls.tsx | Controls | styled ReactFlow controls (zoom, fit, lock) | "Add zoom and pan controls to a canvas" |
| conversation.tsx | Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton, ConversationDownload | sticky-to-bottom message container with empty state, auto-scroll button, markdown export | "Display a chat conversation history" |
| edge.tsx | Edge | Temporary + Standard edge types for ReactFlow connections (animated/dashed) | "Connect two nodes in a flow diagram" |
| environment-variables.tsx | EnvironmentVariables, EnvironmentVariablesHeader, EnvironmentVariableGroup, EnvironmentVariable, … | collapsible env var list with show/hide toggle, copy buttons | "Display environment variables with a show/hide toggle" |
| file-tree.tsx | FileTree, FileTreeIcon, FileTreeName, FileTreeFolder, FileTreeFile, FileTreeActions | interactive tree view with expandable folders, file icons, action buttons | "Show a file/folder structure tree" |
| image.tsx | Image | base64 image wrapper with responsive sizing and rounded corners | "Display a generated AI image" |
| inline-citation.tsx | InlineCitation, InlineCitationText, InlineCitationCard, InlineCitationCarousel, … | inline badge with hover-card carousel of multiple citation sources | "Display a citation reference in text" |
| jsx-preview.tsx | JSXPreview, JSXPreviewContent, JSXPreviewError, useJSXPreview | live JSX previewer with error boundary and streaming support | "Preview and render a JSX component dynamically" |
| markdown.tsx | MarkdownView | markdown renderer with custom overrides for code, links, lists, headings, tables | "Render markdown content with code examples" |
| message.tsx | Message, MessageContent, MessageActions, MessageAction, MessageBranch, MessageBranchSelector, … | chat message with role styling, action buttons, branch navigation | "Show a user and assistant message in a chat" |
| mic-selector.tsx | MicSelector, MicSelectorTrigger, MicSelectorContent, MicSelectorInput, MicSelectorList, … | popover dropdown for selecting audio input devices | "Let user choose a microphone for input" |
| model-selector.tsx | ModelSelector, ModelSelectorTrigger, ModelSelectorContent, ModelSelectorDialog, … | modal dialog for selecting AI models with searchable command interface | "Show a dialog to select an AI model" |
| node.tsx | Node, NodeHeader, NodeTitle, NodeDescription, NodeAction, NodeContent, NodeFooter | card with ReactFlow source/target handles, header, content, footer | "Display a node in a workflow diagram" |
| open-in-chat.tsx | OpenIn, OpenInContent, OpenInItem, OpenInChatGPT, OpenInClaude, OpenInT3, OpenInScira | dropdown to open content in ChatGPT/Claude/T3/Scira | "Let user share content to different AI chat tools" |
| package-info.tsx | PackageInfo, PackageInfoHeader, PackageInfoName, PackageInfoVersion, PackageInfoDependencies, … | card with npm package name/version, change-type badge, description, deps | "Display information about a package update" |
| panel.tsx | Panel | ReactFlow panel wrapper with border, background, rounded corners | "Add a control panel to a canvas view" |
| persona.tsx | Persona, PersonaState | animated Rive character (6 variants): idle, listening, thinking, speaking, asleep | "Show an animated AI assistant avatar" |
| plan.tsx | Plan, PlanHeader, PlanTitle, PlanDescription, PlanAction, PlanContent, PlanFooter, PlanTrigger | collapsible card with streaming shimmer for AI planning steps | "Display an AI-generated plan with steps" |
| prompt-input.tsx | PromptInput, PromptInputBody, PromptInputTextarea, PromptInputSendButton, PromptInputProvider, … | multi-line textarea with attachment actions, provider integration, send button | "Let user type and send a chat message" |
| queue.tsx | QueueMessage, QueueTodo, QueueItem, QueueItemIndicator, QueueItemContent, QueueItemActions, … | list items for messages/todos with completion indicators, descriptions, attachments | "Show a queue of pending tasks" |
| reasoning.tsx | Reasoning, ReasoningTrigger, ReasoningContent, useReasoning | collapsible section with brain icon and streaming shimmer, displays AI reasoning + duration | "Show AI reasoning process details" |
| sandbox.tsx | Sandbox, SandboxHeader, SandboxContent, SandboxTabs, SandboxTabsBar, SandboxTabContent | collapsible container for tool execution with input/output tabs and status | "Display tool execution environment and results" |
| schema-display.tsx | SchemaDisplayHeader, SchemaDisplayMethod, SchemaDisplayPath, SchemaDisplayParameters, SchemaDisplayRequest, SchemaDisplayResponse | collapsible API schema with method badge, path, params, request/response bodies | "Show API endpoint schema details" |
| shimmer.tsx | Shimmer | animated gradient text shimmer for streaming placeholders | "Show a loading shimmer effect on text" |
| snippet.tsx | Snippet, SnippetAddon, SnippetText, SnippetInput, SnippetCopyButton | single-line code input with copy button, monospace | "Display a copyable code snippet" |
| sources.tsx | Sources, SourcesTrigger, SourcesContent, Source, SourcesList, SourcesItem | collapsible section showing number of sources, expandable list with links | "List the sources used to answer a query" |
| speech-input.tsx | SpeechInput | button for speech-to-text with recording state and status display | "Enable voice input for chat" |
| stack-trace.tsx | StackTrace, StackTraceHeader, StackTraceError, StackTraceFrames, StackTraceFrame, … | collapsible error display with formatted stack frames, file paths, copy/expand | "Show an error stack trace with details" |
| suggestion.tsx | Suggestions, Suggestion | horizontally scrollable button list for quick action suggestions | "Show suggested user messages to click" |
| task.tsx | Task, TaskItem, TaskItemFile, TaskTrigger, TaskContent | collapsible task item with file badges and expandable details | "Display a task with associated files" |
| terminal.tsx | Terminal, TerminalHeader, TerminalTitle, TerminalStatus, TerminalActions, TerminalContent, … | dark-themed terminal output with ANSI color, copy and clear buttons | "Show command output in a terminal view" |
| test-results.tsx | TestResults, TestResultsHeader, TestResultsDuration, TestResultsSummary, TestSuite, TestCase, … | collapsible test suites with pass/fail/skip counts, progress bar, duration | "Display test execution results and statistics" |
| tool.tsx | Tool, ToolPart, ToolHeader, ToolContent, ToolInput, ToolOutput, getStatusBadge | collapsible container for a tool call with status badge and input/output code | "Show a tool call with inputs and results" |
| toolbar.tsx | Toolbar | ReactFlow node toolbar with gap and positioning | "Add a toolbar to a canvas node" |
| transcription.tsx | Transcription, TranscriptionSegment | interactive transcription display with seekable segments linked to audio | "Display speech-to-text transcription" |
| voice-selector.tsx | VoiceSelector, VoiceSelectorTrigger, VoiceSelectorDialog, VoiceSelectorList, useVoiceSelector | modal dialog for selecting TTS voice with gender/tone indicators and preview | "Let user choose a voice for text-to-speech" |
| web-preview.tsx | WebPreview, WebPreviewNavigation, WebPreviewUrl, WebPreviewBody, WebPreviewConsole | iframe-based web preview with URL bar, navigation, console output | "Show a live preview of generated HTML" |

---

## see also

- [ai-elements.md](ai-elements.md) — the 48 installed
- [dictionary.md](dictionary.md) — canonical names
- [integrate.md](integrate.md) — claw ↔ web wire
- [`.claude/rules/ui.md`](../.claude/rules/ui.md) — `emitClick` contract
- [`.claude/rules/design.md`](../.claude/rules/design.md) — 6 tokens, no palette colors
- [showcase-todo.md](showcase-todo.md) — wave plan (W1 recon → W2 decide → W3 edit → W4 verify)

---

*48 installed. 14 routed. One empty state earns its keep.*
