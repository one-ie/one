/**
 * Middleware — substrate + devtools wrappers for AI SDK v6.
 *
 * substrateMiddleware: deposits pheromone (mark/warn) on every generate call.
 * resolveBaseModel: picks groq or gateway based on model prefix + env keys.
 * wrappedModel: composes substrate (+ optional devtools) middleware on a base model.
 */

import { wrapLanguageModel, gateway, type LanguageModelMiddleware } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { devToolsMiddleware } from '@ai-sdk/devtools'
import { mark, warn } from './substrate'
import type { Env } from './types'

export const substrateMiddleware = (env: Env, group: string): LanguageModelMiddleware => ({
  specificationVersion: 'v3',

  wrapGenerate: async ({ doGenerate, model }) => {
    const target = `${model.provider}/${model.modelId}`

    try {
      const result = await doGenerate()

      const cacheRead = result.usage.inputTokens.cacheRead ?? 0
      const total = result.usage.inputTokens.total ?? 1
      const cacheRatio = cacheRead / Math.max(1, total)

      const strength = result.finishReason.unified === 'stop' ? 1 + cacheRatio : 0.5
      mark(env, `claw:${group}`, target, strength).catch(() => {})

      return result
    } catch (err) {
      warn(env, `claw:${group}`, target, 1).catch(() => {})
      throw err
    }
  },

  wrapStream: ({ doStream }) => doStream(),
})

export const resolveBaseModel = (env: Env, modelId: string) => {
  if (modelId.startsWith('groq/') && env.GROQ_API_KEY) {
    return createGroq({ apiKey: env.GROQ_API_KEY })(modelId.slice(5))
  }
  return gateway(modelId)
}

export const wrappedModel = (env: Env, modelId: string, group: string) => {
  const base = resolveBaseModel(env, modelId)
  const middleware: LanguageModelMiddleware[] =
    env.MODE === 'development'
      ? [substrateMiddleware(env, group), devToolsMiddleware()]
      : [substrateMiddleware(env, group)]

  return wrapLanguageModel({ model: base, middleware })
}
