import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

/**
 * CodeBlock — dark code block with optional filename tab, language badge, and copy button.
 * Copy state resets after 2 seconds.
 */
export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — silently no-op
    }
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-sm">
      {/* Top bar: filename tab + language badge */}
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
          {filename ? (
            <span className="font-mono text-xs text-slate-400">{filename}</span>
          ) : (
            <span />
          )}
          {language && (
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-400">
              {language}
            </span>
          )}
        </div>
      )}

      {/* Language badge when no filename bar */}
      {!filename && !language && null}

      {/* Code content */}
      <div className="relative overflow-x-auto p-4">
        <pre className="m-0 font-mono text-sm leading-relaxed text-slate-100">
          <code>{code}</code>
        </pre>

        {/* Copy button — appears on group hover */}
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 opacity-0 transition-all hover:bg-slate-700 hover:text-white group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
