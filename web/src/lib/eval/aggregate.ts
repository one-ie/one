import type { RunResult } from './runner'
import type { GradingResult } from './grader'

export interface Stats {
  pass_rate: number
  tokens: number
  time: number
}

export interface BenchmarkResult {
  skillName: string
  iteration: number
  with_skill: Stats
  without_skill: Stats
  delta: Stats
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

export function aggregate(
  skillName: string,
  iteration: number,
  withPairs: Array<{ run: RunResult; grade: GradingResult }>,
  withoutPairs: Array<{ run: RunResult; grade: GradingResult }>,
): BenchmarkResult {
  const toStats = (pairs: typeof withPairs): Stats => ({
    pass_rate: mean(pairs.map(({ grade }) => (grade.total > 0 ? grade.passed / grade.total : 0))),
    tokens: mean(pairs.map(({ run }) => run.tokens)),
    time: mean(pairs.map(({ run }) => run.timeMs)),
  })
  const ws = toStats(withPairs)
  const wos = toStats(withoutPairs)
  return {
    skillName,
    iteration,
    with_skill: ws,
    without_skill: wos,
    delta: {
      pass_rate: ws.pass_rate - wos.pass_rate,
      tokens: ws.tokens - wos.tokens,
      time: ws.time - wos.time,
    },
  }
}
