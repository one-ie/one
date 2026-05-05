import { useEffect, useState } from 'react'
import { emitClick } from '@/lib/ui-signal'

export function RecoveryCodes() {
  const [words, setWords] = useState<string[]>([])
  const [next, setNext] = useState('/')

  useEffect(() => {
    const raw = sessionStorage.getItem('rc:words')
    if (raw) {
      try {
        setWords(JSON.parse(raw) as string[])
        sessionStorage.removeItem('rc:words')
      } catch { /* noop */ }
    }
    const params = new URLSearchParams(window.location.search)
    setNext(params.get('next') ?? '/')
  }, [])

  if (!words.length) {
    return (
      <p className="text-font/60 text-sm text-center">
        Recovery codes are no longer available here. Keep your paper copy safe.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <div className="grid grid-cols-3 gap-2">
        {words.map((word, i) => (
          <div
            key={i}
            className="flex gap-2 items-center p-2 bg-foreground rounded-lg border"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-font/40 text-xs w-4 text-right">{i + 1}</span>
            <span className="font-mono text-sm">{word}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => { emitClick('ui:recovery-codes:saved'); window.location.href = next }}
        className="px-6 py-3 rounded-xl font-semibold bg-primary text-on-primary hover:brightness-110 transition-all"
      >
        I've saved them — continue
      </button>
    </div>
  )
}
