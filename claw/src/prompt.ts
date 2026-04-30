/**
 * systemPromptWithPack — inject structured memory pack into the base system prompt.
 *
 * The pack renders as a "MEMORY" section prepended to the persona's system prompt.
 * Only high-confidence hypotheses (>= 0.5) are included. Recent messages are
 * omitted (they arrive as the messages[] array to the LLM).
 */

import type { ContextPack } from './pipeline'

/**
 * Render a ContextPack into a memory block string to prepend to the system prompt.
 */
function renderMemoryBlock(pack: ContextPack): string {
  const lines: string[] = ['--- MEMORY ---']

  // Profile
  lines.push(`User: ${pack.profile.handle} (${pack.profile.messageCount} messages in history)`)

  // High-confidence hypotheses — directly quotable (verbalize threshold: 0.85)
  const facts = pack.hypotheses.filter((h) => h.confidence >= 0.85)
  if (facts.length > 0) {
    lines.push('\nEstablished facts about this user:')
    for (const h of facts) {
      lines.push(`  [fact] [${h.status}] ${h.statement} (${Math.round(h.confidence * 100)}%)`)
    }
  }

  // Mid-confidence hints — shape generation silently, do not quote verbatim
  const hints = pack.hypotheses.filter((h) => h.confidence >= 0.5 && h.confidence < 0.85)
  if (hints.length > 0) {
    lines.push('\nSubtle hints (do not quote these directly):')
    for (const h of hints) {
      lines.push(`  [hint] [${h.status}] ${h.statement}`)
    }
  }

  // Highways (top interests)
  if (pack.highways.length > 0) {
    lines.push('\nTop interests (by path strength):')
    for (const hw of pack.highways.slice(0, 5)) {
      lines.push(`  - ${hw.to} (strength: ${hw.strength.toFixed(1)})`)
    }
  }

  // Tools
  if (pack.tools.length > 0) {
    lines.push(`\nAvailable skills: ${pack.tools.join(', ')}`)
  }

  lines.push('--- END MEMORY ---')
  return lines.join('\n')
}

/**
 * Inject the memory pack into the base system prompt.
 * Returns the enhanced system prompt string.
 */
export function systemPromptWithPack(basePrompt: string, pack: ContextPack): string {
  // Skip memory block if there's nothing useful in the pack
  const hasMemory = pack.hypotheses.some((h) => h.confidence >= 0.5) || pack.highways.length > 0

  if (!hasMemory) return basePrompt

  const memoryBlock = renderMemoryBlock(pack)
  return `${memoryBlock}\n\n${basePrompt}`
}
