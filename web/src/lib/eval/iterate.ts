import type { TestCase, RunResult } from './runner'
import type { GradingResult } from './grader'

export interface FailedCase {
  testCase: TestCase
  run: RunResult
  grade: GradingResult
}

export function buildIterationPrompt(skillBody: string, failures: FailedCase[]): string {
  const lines = failures
    .map(f =>
      [
        `### ${f.testCase.id}`,
        `Prompt: ${f.testCase.prompt}`,
        `Expected: ${f.testCase.expected}`,
        `Actual (truncated): ${f.run.output.slice(0, 400)}`,
        `Failed: ${f.grade.evidence.filter(e => e.startsWith('✗')).join('; ')}`,
      ].join('\n'),
    )
    .join('\n\n')

  return [
    'The skill below failed these test cases. Propose the minimal diff to fix them.',
    '',
    '```markdown',
    skillBody.slice(0, 800),
    '```',
    '',
    lines,
  ].join('\n')
}
