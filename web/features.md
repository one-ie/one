# web — features map

_Generated 2026-05-06 from haiku zone scans._

## Pages (`src/pages/*.astro`)

- src/pages/agents.astro — Browse and select available agents; redirects to chat with selected agent
- src/pages/chat.astro — Main chat interface with full-height viewport; AI conversation with agents
- src/pages/design.astro — Design token editor; preview 6 editable colors with live theme switching
- src/pages/get-yours.astro — Sign-in landing page; passkey entry point for user provisioning
- src/pages/index.astro — Marketing homepage; product hero and features overview
- src/pages/motion.astro — Motion system showcase; animation primitives and performance demo
- src/pages/recovery-codes.astro — Recovery codes display; BIP39 backup for wallet restoration
- src/pages/showcase.astro — Demo chat with model selection; public sandbox for testing

## User pages (`src/pages/u/**`)

- src/pages/u/[slug]/[kind]/[name].astro — Renders markdown document from R2 with frontmatter title support
- src/pages/u/[slug]/[kind]/index.astro — Lists all files under a content category (kind) for owner
- src/pages/u/[slug]/chat.astro — Chat interface with fullpage mode, optional seed parameter
- src/pages/u/[slug]/.well-known/agent-card.json.ts — Builds agent metadata card from R2 agent.md frontmatter
- src/pages/u/[slug]/.well-known/did.json.ts — Generates DID document from R2 agent metadata
- src/pages/u/[slug]/export.ts — Passkey-authenticated ZIP export of user's agent workspace
- src/pages/u/[slug]/history/[entry].astro — Shows version history of edited documents with restore links
- src/pages/u/[slug]/index.astro — Owner profile listing grouped content, share, and controls
- src/pages/u/[slug]/media/[name].ts — Serves cached user media files from R2 with immutable etag
- src/pages/u/[slug]/robots.txt.ts — Generates robots.txt with configurable directive from site.md
- src/pages/u/[slug]/settings.astro — Manage passkeys, recovery email, wallet, integrations, export
- src/pages/u/[slug]/sitemap.xml.ts — Generates sitemap from R2 workspace directory structure

## API routes (`src/pages/api/**`)

- src/pages/api/chat.ts — AI chat with tools for skills, eval, write, compile, payments
- src/pages/api/chat/warmup.ts — Warm up Groq LLM on server startup
- src/pages/api/commit-media.ts — Upload media (images) with passkey challenge verification
- src/pages/api/commit.ts — Write/update/delete site content with passkey verification
- src/pages/api/domain.ts — Register and verify custom domains via DNS TXT record
- src/pages/api/eval.ts — Run skill evaluation: with-skill vs without, benchmark delta
- src/pages/api/health.ts — Report agent status, model, OpenRouter availability
- src/pages/api/notifications.ts — List and mark notifications read (passkey-authenticated)
- src/pages/api/openrouter-models.ts — Fetch and cache OpenRouter model list
- src/pages/api/pay/create-intent.ts — Create Stripe payment intent (pro/team plans)
- src/pages/api/pay/webhook.ts — Handle Stripe payment events, emit pheromone signals
- src/pages/api/provision.ts — Create wallet: register passkey, generate recovery words
- src/pages/api/recover.ts — Initiate device recovery via HMAC-signed magic link tokens
- src/pages/api/report.ts — Log client errors to DB with rate limiting (5/hr per IP)
- src/pages/api/settings.ts — Update owner settings (wallet, agentverse key, recovery email)
- src/pages/api/showcase-chat.ts — Public chat: crawl URLs, planning, OpenRouter streaming
- src/pages/api/skill/refresh.ts — Import/refresh skills via refs (bearer auth, internal)
- src/pages/api/tts.ts — Text-to-speech (OpenAI/Cloudflare) with voice selection
- src/pages/api/webhook/discord.ts — Discord webhook ingress, normalize, run agent
- src/pages/api/webhook/telegram.ts — Telegram webhook ingress, normalize, run agent

## Root components

- src/components/AddDeviceButton.tsx — Passkey device registration with challenge-response flow
- src/components/Chat.tsx — Full chat interface with streaming, voice, TTS, attachments, payment panel
- src/components/ChatHost.tsx — Chat layout mode manager (wide, rail, icon, none) with persistence
- src/components/ChatLazy.tsx — Lazy-loaded chat component wrapper with Suspense fallback
- src/components/ChatWidget.tsx — Fixed position floating chat widget toggle button
- src/components/Features.tsx — Feature grid cards with icon badges and descriptions
- src/components/GetYoursButton.tsx — Passkey registration flow with ToS, name input, recovery codes
- src/components/Hero.tsx — Landing page hero section with CTAs and brand messaging
- src/components/InboxBell.tsx — Notification bell icon with unread count polling
- src/components/OwnerControls.tsx — Edit and new seed buttons visible only to wallet owner
- src/components/Pricing.tsx — Three-tier pricing plan cards with features and CTAs
- src/components/RecoveryCodes.tsx — BIP39 recovery codes display and confirmation UI
- src/components/ReportButton.tsx — Report modal for spam/content with kind selector
- src/components/Showcase.tsx — AI elements demo with model picker, tool calls, reasoning display

## Nested components

- src/components/ai-elements/agent.tsx — Agent card with name, model badge, collapsible toolbar
- src/components/ai-elements/artifact.tsx — Artifact container with header, body, footer, close button
- src/components/ai-elements/attachments.tsx — File/document attachment preview with grid/inline/list variants
- src/components/ai-elements/audio-player.tsx — Media player with controls: play, seek, volume, time display
- src/components/ai-elements/canvas.tsx — ReactFlow canvas wrapper with pan, zoom, selection controls
- src/components/ai-elements/chain-of-thought.tsx — Collapsible reasoning steps with streaming support
- src/components/ai-elements/checkpoint.tsx — Bookmark checkpoint indicator with separator
- src/components/ai-elements/code-block.tsx — Syntax-highlighted code with copy button and language selector
- src/components/ai-elements/commit.tsx — Git commit collapsible with diff, file stats, copy hash button
- src/components/ai-elements/confirmation.tsx — Tool approval gate with context state management
- src/components/ai-elements/connection.tsx — ReactFlow connection line component with bezier path
- src/components/ai-elements/context.tsx — Token context display with usage progress bar and model info
- src/components/ai-elements/controls.tsx — ReactFlow pan/zoom controls styled as toolbar
- src/components/ai-elements/conversation.tsx — Sticky-bottom message container with empty state
- src/components/ai-elements/edge.tsx — ReactFlow edge with dashed animation and endpoint circle
- src/components/ai-elements/environment-variables.tsx — Secret environment variable list with show/hide toggle
- src/components/ai-elements/file-tree.tsx — Expandable file/folder tree with selection callback
- src/components/ai-elements/image.tsx — Generated image display from base64 data
- src/components/ai-elements/inline-citation.tsx — Hoverable citation badge with carousel navigation
- src/components/ai-elements/jsx-preview.tsx — JSX/HTML preview with error boundary and streaming support
- src/components/ai-elements/markdown.tsx — Markdown renderer with code blocks, links, syntax highlighting
- src/components/ai-elements/message.tsx — Chat message container with role-based alignment and styling
- src/components/ai-elements/mic-selector.tsx — Audio device selector dropdown with device IDs
- src/components/ai-elements/model-selector.tsx — LLM model picker dialog with command search
- src/components/ai-elements/node.tsx — ReactFlow node card with input/output handles
- src/components/ai-elements/open-in-chat.tsx — Dropdown to open prompt in ChatGPT/Claude
- src/components/ai-elements/package-info.tsx — Package version display with major/minor/patch badges
- src/components/ai-elements/panel.tsx — ReactFlow panel wrapper with styling and positioning
- src/components/ai-elements/persona.tsx — Rive animation character with state machine (idle/thinking/speaking)
- src/components/ai-elements/plan.tsx — Collapsible plan/task with streaming shimmer effect
- src/components/ai-elements/prompt-input-context.tsx — Context provider for text input and file attachments
- src/components/ai-elements/prompt-input-layout.tsx — Chat input layout with action menu and controls
- src/components/ai-elements/prompt-input-textarea.tsx — Auto-expanding textarea with Enter-to-send
- src/components/ai-elements/prompt-input.tsx — Full prompt input with file upload, voice, model selector
- src/components/ai-elements/queue.tsx — Collapsible message/task queue with completion indicators
- src/components/ai-elements/reasoning.tsx — Collapsible reasoning block with auto-close and duration timer
- src/components/ai-elements/sandbox.tsx — Tool execution sandbox with tabs and status badge
- src/components/ai-elements/schema-display.tsx — API schema viewer with method, path, parameters display
- src/components/ai-elements/shimmer.tsx — Text shimmer loading animation with dynamic spread
- src/components/ai-elements/snippet.tsx — Inline code snippet display with copy button
- src/components/ai-elements/sources.tsx — Expandable sources list with citation links
- src/components/ai-elements/speech-input.tsx — Web Speech API microphone input with transcript display
- src/components/ai-elements/stack-trace.tsx — Parsed error stack trace with frame expansion
- src/components/ai-elements/suggestion.tsx — Horizontal scrollable suggestion pills with click handler
- src/components/ai-elements/task.tsx — Collapsible task item with file badges and search icon
- src/components/ai-elements/terminal.tsx — Terminal output display with ANSI parsing and auto-scroll
- src/components/ai-elements/test-results.tsx — Test summary with pass/fail/skip counts and duration
- src/components/ai-elements/tool.tsx — Tool execution block with status badge and approval gate
- src/components/ai-elements/toolbar.tsx — ReactFlow node toolbar positioned at bottom
- src/components/ai-elements/transcription.tsx — Audio transcription segments with time sync
- src/components/ai-elements/voice-selector.tsx — Text-to-speech voice picker with gender icons
- src/components/ai-elements/web-preview.tsx — Iframe web preview with URL input and console toggle
- src/components/chat/AddMenu.tsx — File/camera/web upload menu for attachments
- src/components/chat/AttachmentsPreview.tsx — Inline preview list of attached files in input
- src/components/chat/EvalCard.tsx — Benchmark result display with pass rate delta
- src/components/chat/MessageList.tsx — Chat message renderer with tools, reasoning, attachments
- src/components/chat/PaymentCard.tsx — Crypto skill payment form with wallet copy and receipt input
- src/components/chat/PreviewCard.tsx — Write commit preview with passkey signing approval
- src/components/chat/VoiceMenu.tsx — Text-to-speech voice selector dropdown
- src/components/motion/demo/CounterDemo.tsx — Scrollbar-driven counter animation demo
- src/components/motion/demo/GlowGrid.tsx — Animated 3x3 grid of pulsing dots
- src/components/motion/demo/HeroScene.tsx — Hero section with animated connection lines and nodes
- src/components/motion/demo/ScrollCounter.tsx — Scroll-driven counter with step highlighting
- src/components/motion/demo/TypewriterDemo.tsx — Word switcher with typewriter animation
- src/components/motion/FeatureTabs.tsx — Tabbed feature showcase with animated transitions
- src/components/motion/Parallax.tsx — Scroll parallax effect wrapper component
- src/components/motion/Reveal.astro — View-timeline-driven scroll reveal animation with configurable distance, speed, delay
- src/components/motion/ScrollScene.tsx — Sticky scroll-driven animation container with progress tracking
- src/components/motion/Stagger.astro — Cascading staggered reveal animation with layout-friendly child timing
- src/components/pay/PayPanel.tsx — Payment plan selector with Stripe checkout integration
- src/components/pay/PriceCards.tsx — Pro/Team pricing cards with feature lists
- src/components/pay/StripeCheckoutForm.tsx — Stripe payment form with card submission
- src/components/pay/StripeProvider.tsx — Stripe Elements provider with theme sync
- src/components/showcase/MessageActions.tsx — Message action buttons: copy, retry, upvote, downvote
- src/components/showcase/ShowcaseMessageList.tsx — Chat renderer with lazy markdown and message actions
- src/components/showcase/ShowcaseModelPicker.tsx — OpenRouter model selector with pricing info
- src/components/sidebar/MenuItem.tsx — Sidebar menu row with nested submenu collapse
- src/components/sidebar/SheetMenu.tsx — Mobile slide-out menu sheet with overlay
- src/components/sidebar/Sidebar.tsx — Desktop/mobile sidebar toggle with theme and navigation
- src/components/sidebar/ThemeToggle.tsx — Dark/light mode toggle button
- src/components/ui/Icon.tsx — Lucide icon wrapper with 4 size presets and accessible labels
- src/components/ui/IconBadge.tsx — Colored icon badge (3 sizes) with tone-based background/border mixing
- src/components/ui/accordion.tsx — Radix-UI collapsible expand/collapse sections with chevron icons
- src/components/ui/alert.tsx — Styled alert containers with title, description, action slots
- src/components/ui/avatar.tsx — Circular images with fallback, badge, and group display support
- src/components/ui/badge.tsx — Compact label with 6 variants (default, secondary, destructive, outline, ghost, link)
- src/components/ui/button-group.tsx — Joined buttons with horizontal/vertical orientation and separator
- src/components/ui/button.tsx — 6 variants × 8 sizes button component with icon support
- src/components/ui/card.tsx — Multi-slot card layout (header, title, action, content, footer) with size variant
- src/components/ui/carousel.tsx — Embla-powered image carousel with arrow navigation and keyboard support
- src/components/ui/collapsible.tsx — —
- src/components/ui/command.tsx — Searchable command palette dialog with groups, shortcuts, checkmarks
- src/components/ui/dialog.tsx — Modal overlay with content, header, footer, close button management
- src/components/ui/dropdown-menu.tsx — Radix dropdown with submenus, radio groups, checkboxes, labels
- src/components/ui/hover-card.tsx — Positioned tooltip card on hover with alignment control
- src/components/ui/input-group.tsx — Input container with prefix/suffix addon, button, text, textarea support
- src/components/ui/input.tsx — Text input with validation states, file upload, focus ring styling
- src/components/ui/popover.tsx — Positioned popover with header, title, description slots and arrow
- src/components/ui/progress.tsx — Radix linear progress bar with animated fill indicator
- src/components/ui/scroll-area.tsx — Custom scrollbar with vertical/horizontal orientation
- src/components/ui/select.tsx — Radix dropdown select with scroll buttons, item indicators, groups
- src/components/ui/separator.tsx — Horizontal/vertical divider line with decorative option
- src/components/ui/spinner.tsx — Animated loader icon with accessible status/label attributes
- src/components/ui/switch.tsx — Toggle switch (2 sizes) with dark mode thumb contrast
- src/components/ui/tabs.tsx — Tabbed interface with default/line variants and vertical orientation
- src/components/ui/textarea.tsx — Multi-line text input with field-sizing-content and validation states
- src/components/ui/tooltip.tsx — Radix tooltip with zero delay, arrow, and max-width constraint

## Lib

- src/lib/agent-md.ts — Parser for agent/skill markdown with frontmatter, intervals, endpoints
- src/lib/agent.ts — Load agent config from environment variables with default prompt
- src/lib/agents-meta.ts — Registry of agent metadata from markdown files in agents/ folder
- src/lib/agents.ts — Load and resolve agent entries with skill registry and inheritance
- src/lib/artifacts/a2a.ts — Build agent card schema for inter-agent authentication
- src/lib/artifacts/did.ts — Build W3C DID document with verification methods
- src/lib/artifacts/erc8004.ts — Build ERC-8004 agent registration on identity registry
- src/lib/artifacts/mcp-server-json.ts — Build MCP server JSON schema from agent skills
- src/lib/artifacts/sigstore.ts — Build and sign SHA-256 manifest with annotations
- src/lib/cf-env.ts — Access Cloudflare Workers env and context in Astro 6
- src/lib/channels.ts — Normalize Telegram/Discord payloads to Signal; send responses
- src/lib/cn.ts — Merge and resolve Tailwind class names with twMerge
- src/lib/compile.ts — Generate Python/MCP code from agent markdown spec
- src/lib/eval/aggregate.ts — Aggregate benchmark results for skill iterations
- src/lib/eval/grader.ts — LLM-based assertion grading for test cases via Groq
- src/lib/eval/iterate.ts — Build iteration prompts for failed test case remediation
- src/lib/eval/runner.ts — Run test cases against skill via Groq LLM API
- src/lib/handler.ts — Route signals through agent (load, chat, emit telemetry)
- src/lib/llm.ts — Chat API client supporting Groq and OpenRouter providers
- src/lib/markdown.ts — Split frontmatter; render markdown to HTML via marked
- src/lib/menu.ts — Navigation menu structure with active route detection
- src/lib/motion.ts — Motion constants (ease, duration, distance); reduced motion hook
- src/lib/passkey.ts — WebAuthn challenge/token generation; commit assertion verify
- src/lib/site.ts — Parse site config from markdown; validate color tokens and fonts
- src/lib/skill/auto-import.ts — Auto-import skill-creator reference docs into R2
- src/lib/skill/discovery.ts — Discover and list skills from R2 by directory prefix
- src/lib/skill/emit.ts — Emit flat skill to agentskills.io directory layout
- src/lib/skill/import.ts — Import skill from URL/GitHub/agentskills.io with caching
- src/lib/skill/loader.ts — Load skill from R2 (flat or directory); parse to Skill interface
- src/lib/skill/parser.ts — Parse YAML frontmatter and markdown body from skill files
- src/lib/slug.ts — Random slug generation; lookup slug owner; list/get slug context
- src/lib/storage-cap.ts — Check storage usage against 100MB cap; warn at 80%
- src/lib/telemetry.ts — Emit telemetry events to ONE API signal endpoint
- src/lib/types.ts — Core types (Signal, Message, Env, AgentConfig)
- src/lib/ui-signal.ts — Dispatch UI click signals with receiver naming convention
- src/lib/utils.ts — Class name utility function (clsx + twMerge)
- src/lib/x402.ts — Verify x402 receipt and prevent replay with KV deduplication

## Hooks + layouts

- src/hooks/use-sidebar.ts — Sidebar open state + pathname tracking + media query helpers
- src/layouts/Layout.astro — Base page layout with theme tokens, chat mode, sidebar, design system enforcement

## Scripts + config

- scripts/install-hooks.sh — Pre-commit hook runs `bun run verify` (tsc + astro check)
- astro.config.mjs — Astro 6 + React + Tailwind + Cloudflare adapter, SSR, build chunking
- wrangler.toml — KV namespaces, D1 database, R2 bucket, AI binding for demo.one.ie
- src/middleware.ts — Custom domain routing: rewrites to /u/{slug} if host verified in D1
