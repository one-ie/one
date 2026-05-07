/**
 * Adaptive starter chips (M11).
 *
 * Replaces the 10-string `STARTER_PROMPTS` Set with a lookup keyed by
 * (surface, lifecycle, viewer). The substrate then learns: chips that get
 * clicked deposit pheromone via `ui:chat:starter:<id>`; over time, ranking
 * shifts by mark/warn ratio. This file owns the cold-start defaults only —
 * the warm path comes from substrate.highways(receiver='ui:chat:starter:*').
 *
 * 3 surfaces tabled (chat, agents, payments). Other surfaces fall through
 * to chat defaults. 5 chips per (lifecycle, viewer) cell — enough to fill
 * the chip rail, few enough to compare deltas.
 */

import type { Surface } from './cards'
import type { Chip } from './chat-frames'

export type Viewer = 'creator' | 'developer' | 'end_user'
export type Lifecycle = 'empty' | 'active' | 'revenue'

export interface StarterCtx {
  surface: Surface
  viewer: Viewer
  has_agents: boolean
  has_revenue: boolean
  lifecycle: Lifecycle
}

export type { Chip } from './chat-frames'

type Cell = readonly Chip[]
type ViewerMap = Readonly<Record<Viewer, Cell>>
type LifecycleMap = Readonly<Record<Lifecycle, ViewerMap>>
type SurfaceMap = Readonly<Partial<Record<Surface, LifecycleMap>>>

const c = (id: string, label: string): Chip => ({ id, label, receiver: `ui:chat:starter:${id}` })

const CHAT_TABLE: LifecycleMap = {
  empty: {
    creator: [
      c('create-home', 'Create my homepage'),
      c('write-about', 'Write an about page'),
      c('add-pricing', 'Add a pricing page'),
      c('first-agent', 'Create my first AI agent'),
      c('what-is-one', 'What is ONE?'),
    ],
    developer: [
      c('signal-howto', 'Show a TypeScript signal handler'),
      c('schema-path', 'Show the schema for a path entity'),
      c('routing-loops', 'Explain L1-L7 routing loops'),
      c('install-cli', 'How do I install the oneie CLI?'),
      c('what-is-one', 'What is ONE?'),
    ],
    end_user: [
      c('what-is-one', 'What is ONE?'),
      c('how-buy', 'How do I buy?'),
      c('how-sell', 'How do I sell a skill?'),
      c('show-highways', 'Show me the signal highways'),
      c('pheromone-routing', 'How does pheromone routing work?'),
    ],
  },
  active: {
    creator: [
      c('update-home', 'Update my homepage'),
      c('add-blog', 'Add a blog post'),
      c('improve-agent', 'Improve my support agent'),
      c('check-settings', 'Check my settings'),
      c('add-skill', 'Add a paid skill'),
    ],
    developer: [
      c('eval-skill', 'Run evals on my skill'),
      c('compile-py', 'Compile my agent to Python'),
      c('compile-mcp', 'Compile my agent to MCP'),
      c('inspect-paths', 'Show my top signal paths'),
      c('check-deploy', 'Check deploy status'),
    ],
    end_user: [
      c('browse-skills', 'Browse skills marketplace'),
      c('top-agents', 'Show top agents this week'),
      c('how-buy', 'How do I buy?'),
      c('show-highways', 'Show me the signal highways'),
      c('what-new', "What's new?"),
    ],
  },
  revenue: {
    creator: [
      c('revenue-week', 'How much did I earn this week?'),
      c('top-skill', 'Which skill earns the most?'),
      c('iterate-best', 'Iterate my top-earning skill'),
      c('marketing', 'Help me promote my best agent'),
      c('add-skill', 'Add another paid skill'),
    ],
    developer: [
      c('eval-best', 'Run evals on top-earning skill'),
      c('iterate-best', 'Iterate my top-earning skill'),
      c('inspect-paths', 'Show top revenue paths'),
      c('compile-py', 'Compile my agent to Python'),
      c('check-deploy', 'Check deploy status'),
    ],
    end_user: [
      c('browse-skills', 'Browse skills marketplace'),
      c('top-agents', 'Show top agents this week'),
      c('what-new', "What's new?"),
      c('how-sell', 'How do I sell a skill?'),
      c('show-highways', 'Show me the signal highways'),
    ],
  },
}

const AGENTS_TABLE: LifecycleMap = {
  empty: {
    creator: [
      c('first-agent', 'Create my first AI agent'),
      c('agent-template', 'Show me an agent template'),
      c('agent-howto', 'How do agents work?'),
      c('import-agent', 'Import an agent from markdown'),
      c('agent-price', 'How do I price an agent?'),
    ],
    developer: [
      c('agent-md-spec', 'Show the agent.md spec'),
      c('compile-py', 'Compile an agent to Python'),
      c('compile-mcp', 'Compile an agent to MCP'),
      c('agent-tools', 'How do I add tools to an agent?'),
      c('agent-eval', 'How do I eval an agent?'),
    ],
    end_user: [
      c('top-agents', 'Show top agents this week'),
      c('browse-agents', 'Browse all agents'),
      c('agent-howto', 'How do agents work?'),
      c('what-is-one', 'What is ONE?'),
      c('how-buy', 'How do I buy?'),
    ],
  },
  active: {
    creator: [
      c('improve-agent', 'Improve my support agent'),
      c('agent-evolve', 'Evolve my agent prompt'),
      c('agent-trace', 'Show recent agent traces'),
      c('add-tool', 'Add a tool to my agent'),
      c('agent-price', 'Adjust agent pricing'),
    ],
    developer: [
      c('agent-trace', 'Show recent agent traces'),
      c('agent-evolve', 'Evolve my agent prompt'),
      c('eval-agent', 'Run evals on my agent'),
      c('compile-py', 'Compile my agent to Python'),
      c('compile-mcp', 'Compile my agent to MCP'),
    ],
    end_user: [
      c('top-agents', 'Show top agents this week'),
      c('browse-agents', 'Browse all agents'),
      c('how-buy', 'How do I buy?'),
      c('what-new', "What's new?"),
      c('agent-howto', 'How do agents work?'),
    ],
  },
  revenue: {
    creator: [
      c('top-agent-rev', 'Which agent earns the most?'),
      c('iterate-best', 'Iterate my top-earning agent'),
      c('agent-evolve', 'Evolve my agent prompt'),
      c('marketing', 'Help me promote my best agent'),
      c('agent-price', 'Adjust agent pricing'),
    ],
    developer: [
      c('agent-trace', 'Show top revenue traces'),
      c('eval-agent', 'Run evals on top-earning agent'),
      c('iterate-best', 'Iterate my top-earning agent'),
      c('agent-evolve', 'Evolve my agent prompt'),
      c('compile-py', 'Compile my agent to Python'),
    ],
    end_user: [
      c('top-agents', 'Show top agents this week'),
      c('browse-agents', 'Browse all agents'),
      c('how-sell', 'How do I sell an agent?'),
      c('what-new', "What's new?"),
      c('agent-howto', 'How do agents work?'),
    ],
  },
}

const PAYMENTS_TABLE: LifecycleMap = {
  empty: {
    creator: [
      c('add-skill', 'Add a paid skill'),
      c('agent-price', 'Price an agent'),
      c('how-payments', 'How do payments work?'),
      c('connect-wallet', 'Connect a wallet'),
      c('what-x402', 'What is x402?'),
    ],
    developer: [
      c('what-x402', 'What is x402?'),
      c('payment-flow', 'Show the payment flow diagram'),
      c('skill-price-md', 'How do I set a price in skill.md?'),
      c('verify-receipt', 'How do I verify a payment receipt?'),
      c('connect-wallet', 'Connect a wallet'),
    ],
    end_user: [
      c('how-buy', 'How do I buy?'),
      c('how-payments', 'How do payments work?'),
      c('connect-wallet', 'Connect a wallet'),
      c('what-x402', 'What is x402?'),
      c('browse-skills', 'Browse skills marketplace'),
    ],
  },
  active: {
    creator: [
      c('add-skill', 'Add another paid skill'),
      c('agent-price', 'Adjust pricing'),
      c('payout-status', 'Check payout status'),
      c('how-payments', 'How do payments work?'),
      c('connect-wallet', 'Manage wallets'),
    ],
    developer: [
      c('verify-receipt', 'Verify a recent receipt'),
      c('payment-flow', 'Show the payment flow diagram'),
      c('payout-status', 'Check payout status'),
      c('skill-price-md', 'Set price in skill.md'),
      c('connect-wallet', 'Manage wallets'),
    ],
    end_user: [
      c('how-buy', 'How do I buy?'),
      c('browse-skills', 'Browse skills marketplace'),
      c('connect-wallet', 'Manage wallets'),
      c('how-payments', 'How do payments work?'),
      c('what-new', "What's new?"),
    ],
  },
  revenue: {
    creator: [
      c('revenue-week', 'How much did I earn this week?'),
      c('top-skill', 'Which skill earns the most?'),
      c('payout-status', 'Check payout status'),
      c('iterate-best', 'Iterate my top earner'),
      c('agent-price', 'Adjust pricing'),
    ],
    developer: [
      c('payout-status', 'Check payout status'),
      c('verify-receipt', 'Verify recent receipts'),
      c('top-skill', 'Top revenue skill'),
      c('iterate-best', 'Iterate top earner'),
      c('payment-flow', 'Show payment flow'),
    ],
    end_user: [
      c('browse-skills', 'Browse skills marketplace'),
      c('top-agents', 'Show top agents this week'),
      c('how-buy', 'How do I buy?'),
      c('what-new', "What's new?"),
      c('how-payments', 'How do payments work?'),
    ],
  },
}

const TABLE: SurfaceMap = {
  chat: CHAT_TABLE,
  agents: AGENTS_TABLE,
  payments: PAYMENTS_TABLE,
}

/**
 * Cold-start chip selector. Falls through to chat defaults for surfaces
 * without a dedicated table. Always returns 5 chips.
 */
export function computeStarters(ctx: StarterCtx): Chip[] {
  const surfaceTable = TABLE[ctx.surface] ?? CHAT_TABLE
  const lifecycle = surfaceTable[ctx.lifecycle] ?? CHAT_TABLE[ctx.lifecycle]
  const cell = lifecycle[ctx.viewer] ?? lifecycle.end_user
  return [...cell]
}

