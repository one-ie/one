import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import type { TestCase, RunResult } from './runner'

export interface GradingResult {
  caseId: string
  passed: number
  total: number
  evidence: string[]
}

async function judgeAssertion(
  assertion: string,
  output: string,
  groqApiKey: string,
): Promise<boolean> {
  const groq = createGroq({ apiKey: groqApiKey })
  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: 'You are a strict evaluator. Respond with only YES or NO.',
    prompt: `Does this output satisfy the assertion?\n\nAssertion: ${assertion}\n\nOutput:\n${output.slice(0, 2000)}\n\nAnswer:`,
    maxOutputTokens: 5,
  })
  return text.trim().toUpperCase().startsWith('YES')
}

export async function gradeCase(
  testCase: TestCase,
  result: RunResult,
  groqApiKey: string,
): Promise<GradingResult> {
  const evidence: string[] = []
  let passed = 0
  for (const assertion of testCase.assertions) {
    const ok = await judgeAssertion(assertion, result.output, groqApiKey)
    if (ok) { passed++; evidence.push(`✓ ${assertion}`) }
    else evidence.push(`✗ ${assertion}`)
  }
  return { caseId: testCase.id, passed, total: testCase.assertions.length, evidence }
}
