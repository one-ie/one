/**
 * builder.ts — AI SDK v6 agent factory.
 *
 * `makeAgent(env, persona, group)` returns a `ToolLoopAgent` wired to:
 *  - a Groq model (via `wrappedModel`)
 *  - the claw tool set
 *  - per-call group + channel context appended to instructions
 */

import { ToolLoopAgent, Output, stepCountIs } from 'ai'
import { z } from 'zod'

import type { CallOptions, Env } from '../types'
import type { Persona } from '../personas'
import { buildTools } from '../aitools'
import { wrappedModel } from '../middleware'

// ---------------------------------------------------------------------------
// Call-options schema — mirrors CallOptions from types.ts
// ---------------------------------------------------------------------------

export const callOptionsSchema = z.object({
  group: z.string(),
  channel: z.enum(['web', 'telegram', 'discord', 'api']),
  userId: z.string().optional(),
})

export type { CallOptions }

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Build a `ToolLoopAgent` bound to the given persona and group.
 *
 * The `group` parameter seeds the wrapped model's context label so pheromone
 * is attributed to the right path in the substrate.
 */
type TextOutput = ReturnType<typeof Output.text>

export function makeAgent(
  env: Env,
  persona: Persona,
  group: string,
): ToolLoopAgent<CallOptions, ReturnType<typeof buildTools>, TextOutput> {
  const model = wrappedModel(env, persona.model, group)

  return new ToolLoopAgent<CallOptions, ReturnType<typeof buildTools>, TextOutput>({
    model,
    instructions: persona.systemPrompt,
    tools: buildTools(env),
    stopWhen: stepCountIs(persona.maxSteps ?? 5),
    callOptionsSchema,
    output: Output.text(),

    // Append group + channel context to instructions; pass callOptions to tools via experimental_context.
    prepareCall(opts) {
      const ctx = opts.options
        ? `\n\n[context] group=${opts.options.group} channel=${opts.options.channel}`
        : ''
      return {
        model: opts.model,
        instructions: `${opts.instructions ?? persona.systemPrompt}${ctx}`,
        experimental_context: opts.options,
      }
    },
  })
}
