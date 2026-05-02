/**
 * AI SDK v6 tool() map — wraps the same substrate semantics as tools.ts
 * with typed schemas, strict mode, approval gates, and model-output shaping.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { browser } from './browser'
import { highways, mark, query, rememberHypothesis, suggestRoute, warn } from './substrate'
import type { CallOptions, Env } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pull CallOptions out of experimental_context (set by the caller via generateText/streamText). */
function ctx(options: { experimental_context?: unknown }): CallOptions {
  return options.experimental_context as CallOptions
}

// ---------------------------------------------------------------------------
// Tool factory — returns the typed tool map bound to a single Env.
// Pass `env` once at construction; `callOptions` arrives per-call via context.
// ---------------------------------------------------------------------------

export function buildTools(env: Env) {
  const selfId = (group: string) => `claw:${group}`

  return {
    // -----------------------------------------------------------------------
    // discover — find substrate units by skill, ranked by path strength
    // -----------------------------------------------------------------------
    discover: tool({
      description: 'Find units in the substrate that offer a capability, ranked by path strength',
      inputSchema: z.object({
        skill: z.string().describe('Skill to find'),
      }),
      strict: true,
      inputExamples: [
        { input: { skill: 'translation' } },
        { input: { skill: 'code-review' } },
      ],
      execute: async ({ skill }, options) => {
        const { group } = ctx(options)
        const units = await suggestRoute(env, selfId(group), skill)
        return { skill, units }
      },
    }),

    // -----------------------------------------------------------------------
    // remember — store a fact in KV + substrate hypothesis (write)
    // -----------------------------------------------------------------------
    remember: tool({
      description: 'Store a fact about the current conversation in long-term memory',
      inputSchema: z.object({
        key: z.string().describe('Fact key'),
        value: z.string().describe('Fact value'),
      }),
      strict: true,
      needsApproval: true,
      execute: async ({ key, value }, options) => {
        const { group } = ctx(options)
        await env.KV.put(`knowledge:${group}:${key}`, value).catch(() => {})
        rememberHypothesis(env, group, key, value)
        return { stored: key }
      },
      toModelOutput: ({ output }) => {
        // Hide the raw stored key from model context — just confirm success
        const result = output as { stored: string }
        return { type: 'text', value: `Stored: ${result.stored}` } as const
      },
    }),

    // -----------------------------------------------------------------------
    // recall — retrieve stored knowledge by query
    // -----------------------------------------------------------------------
    recall: tool({
      description: 'Retrieve stored knowledge by query',
      inputSchema: z.object({
        query: z.string().describe('What to recall'),
      }),
      strict: true,
      inputExamples: [
        { input: { query: 'user preferences' } },
        { input: { query: 'project context' } },
      ],
      execute: async ({ query: q }, options) => {
        const { group } = ctx(options)
        const local = await env.KV.get(`knowledge:${group}:${q}`)
        if (local) return { query: q, value: local, source: 'local' }
        const rows = await query(
          env,
          `match $h isa hypothesis, has statement $s; $s contains "${q}"; select $s; limit 5;`,
        )
        return { query: q, results: rows, source: 'substrate' }
      },
    }),

    // -----------------------------------------------------------------------
    // highways — get most-traveled substrate paths
    // -----------------------------------------------------------------------
    highways: tool({
      description: 'Get the most-traveled paths in the substrate',
      inputSchema: z.object({
        limit: z.number().optional().default(5).describe('Max paths to return'),
      }),
      strict: true,
      execute: async ({ limit }) => {
        const paths = await highways(env, limit ?? 5)
        return { highways: paths }
      },
    }),

    // -----------------------------------------------------------------------
    // mark — strengthen a path after successful collaboration (write)
    // -----------------------------------------------------------------------
    mark: tool({
      description: 'Strengthen a path (after a successful collaboration)',
      inputSchema: z.object({
        target: z.string().describe('Unit that helped'),
        strength: z.number().optional().default(1),
      }),
      strict: true,
      needsApproval: true,
      execute: async ({ target, strength }, options) => {
        const { group } = ctx(options)
        await mark(env, selfId(group), target, strength ?? 1)
        return { marked: target, strength: strength ?? 1 }
      },
      toModelOutput: ({ output }) => {
        const result = output as { marked: string }
        return { type: 'text', value: `Marked: ${result.marked}` } as const
      },
    }),

    // -----------------------------------------------------------------------
    // warn — add resistance to a path after failed collaboration (write)
    // -----------------------------------------------------------------------
    warn: tool({
      description: 'Add resistance to a path (after a failed collaboration)',
      inputSchema: z.object({
        target: z.string().describe('Unit that failed'),
        strength: z.number().optional().default(1),
      }),
      strict: true,
      needsApproval: true,
      execute: async ({ target, strength }, options) => {
        const { group } = ctx(options)
        await warn(env, selfId(group), target, strength ?? 1)
        return { warned: target, strength: strength ?? 1 }
      },
      toModelOutput: ({ output }) => {
        const result = output as { warned: string }
        return { type: 'text', value: `Warned: ${result.warned}` } as const
      },
    }),

    // -----------------------------------------------------------------------
    // browse — fetch a URL and extract title, summary, and facts (cached 5 min)
    // -----------------------------------------------------------------------
    browse: tool({
      description: 'Fetch a URL and extract title, summary, and key facts. Cached 5 min.',
      inputSchema: z.object({
        url: z.string().url().describe('http or https URL'),
      }),
      strict: true,
      inputExamples: [
        { input: { url: 'https://example.com' } },
        { input: { url: 'https://docs.one.ie' } },
      ],
      execute: async ({ url }) => {
        return browser.fetch(url, env.KV)
      },
    }),
  } as const
}

/** Alias used by builder.ts — same factory, conventional name. */
export const clawTools = buildTools

/** Convenience type for the tool map returned by buildTools. */
export type ClawTools = ReturnType<typeof buildTools>
