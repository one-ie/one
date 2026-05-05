import { BarChart3 } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'
import type { BenchmarkResult } from '@/lib/eval/aggregate'

interface Props {
  benchmark: BenchmarkResult
  onIterate?: () => void
}

export function EvalCard({ benchmark, onIterate }: Props) {
  const pct = (n: number) => `${Math.round(n * 100)}%`
  const pos = benchmark.delta.pass_rate >= 0

  return (
    <div
      className="bg-background border rounded-xl p-4 space-y-3"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          <span className="text-sm font-bold">{benchmark.skillName}</span>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-xs bg-foreground border text-font/60"
          style={{ borderColor: 'var(--color-border)' }}
        >
          iteration {benchmark.iteration}
        </span>
      </header>

      <div className="bg-foreground rounded-lg p-3 text-xs font-mono space-y-1.5">
        <div
          className="grid grid-cols-3 gap-2 text-font/60 pb-1 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span />
          <span className="text-center">with skill</span>
          <span className="text-center">baseline</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-font/60">pass rate</span>
          <span className="text-center text-tertiary">{pct(benchmark.with_skill.pass_rate)}</span>
          <span className="text-center">{pct(benchmark.without_skill.pass_rate)}</span>
        </div>
        <div
          className="grid grid-cols-3 gap-2 pt-1 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-font/60">delta</span>
          <span
            className={`text-center col-span-2 ${pos ? 'text-tertiary' : 'text-destructive'}`}
          >
            {pos ? '+' : ''}
            {pct(benchmark.delta.pass_rate)}
          </span>
        </div>
      </div>

      {onIterate && (
        <footer className="flex justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm"
            onClick={() => {
              emitClick('ui:chat:eval-iterate')
              onIterate()
            }}
          >
            Iterate
          </button>
        </footer>
      )}
    </div>
  )
}
