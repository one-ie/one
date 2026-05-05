import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export interface TestCase {
  id: string
  prompt: string
  expected: string
  files?: string[]
  assertions: string[]
}

export interface RunResult {
  caseId: string
  output: string
  tokens: number
  timeMs: number
}

export async function runCase(
  testCase: TestCase,
  skillBody: string | null,
  groqApiKey: string,
): Promise<RunResult> {
  const groq = createGroq({ apiKey: groqApiKey })
  const system = skillBody
    ? `You are a helpful assistant. Apply this skill when relevant:\n\n${skillBody}`
    : 'You are a helpful assistant.'
  const start = Date.now()
  const { text, usage } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system,
    prompt: testCase.prompt,
    maxOutputTokens: 1024,
  })
  return {
    caseId: testCase.id,
    output: text,
    tokens: usage?.totalTokens ?? 0,
    timeMs: Date.now() - start,
  }
}
