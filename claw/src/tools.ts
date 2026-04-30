/**
 * Function-calling tools the LLM can invoke during a turn.
 * Returned as OpenAI-format tool definitions and dispatched by name.
 */

import { browser } from './browser'
import { highways, mark, query, rememberHypothesis, suggestRoute, warn } from './substrate'
import type { Env } from './types'

export const tools = [
  {
    name: 'discover',
    description: 'Find units in the substrate that offer a capability, ranked by path strength',
    input_schema: {
      type: 'object',
      properties: { skill: { type: 'string', description: 'Skill to find' } },
      required: ['skill'],
    },
  },
  {
    name: 'remember',
    description: 'Store a fact about the current conversation in long-term memory',
    input_schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Fact key' },
        value: { type: 'string', description: 'Fact value' },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'recall',
    description: 'Retrieve stored knowledge by query',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'What to recall' } },
      required: ['query'],
    },
  },
  {
    name: 'highways',
    description: 'Get the most-traveled paths in the substrate',
    input_schema: {
      type: 'object',
      properties: { limit: { type: 'number', description: 'Max paths', default: 5 } },
    },
  },
  {
    name: 'mark',
    description: 'Strengthen a path (after a successful collaboration)',
    input_schema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Unit that helped' },
        strength: { type: 'number', default: 1 },
      },
      required: ['target'],
    },
  },
  {
    name: 'warn',
    description: 'Add resistance to a path (after a failed collaboration)',
    input_schema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Unit that failed' },
        strength: { type: 'number', default: 1 },
      },
      required: ['target'],
    },
  },
  {
    name: 'browse',
    description: 'Fetch a URL and extract title, summary, and key facts. Cached 5 min.',
    input_schema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'http or https URL' } },
      required: ['url'],
    },
  },
]

export const executeTool = async (
  env: Env,
  group: string,
  tool: string,
  input: Record<string, unknown>,
): Promise<unknown> => {
  const selfId = `claw:${group}`

  switch (tool) {
    case 'discover': {
      const units = await suggestRoute(env, selfId, input.skill as string)
      return { skill: input.skill, units }
    }

    case 'remember': {
      const key = input.key as string
      const value = input.value as string
      await env.KV.put(`knowledge:${group}:${key}`, value).catch(() => {})
      rememberHypothesis(env, group, key, value)
      return { stored: key }
    }

    case 'recall': {
      const q = input.query as string
      const local = await env.KV.get(`knowledge:${group}:${q}`)
      if (local) return { key: q, value: local, source: 'local' }
      const rows = await query(
        env,
        `match $h isa hypothesis, has statement $s; $s contains "${q}"; select $s; limit 5;`,
      )
      return { query: q, results: rows, source: 'substrate' }
    }

    case 'highways': {
      const limit = (input.limit as number) || 5
      const paths = await highways(env, limit)
      return { highways: paths }
    }

    case 'mark':
      await mark(env, selfId, input.target as string, (input.strength as number) || 1)
      return { marked: input.target }

    case 'warn':
      await warn(env, selfId, input.target as string, (input.strength as number) || 1)
      return { warned: input.target }

    case 'browse':
      return browser.fetch(input.url as string, env.KV)

    default:
      return { error: `Unknown tool: ${tool}` }
  }
}
