import { useState } from 'react'
import { Check, Copy, RefreshCcw, Share2, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { emitClick } from '@/lib/ui-signal'

type Vote = 'up' | 'down' | null

interface Props {
  text: string
  onRetry: () => void
  canRetry: boolean
}

function ActionButton({
  label,
  onClick,
  active,
  children,
  disabled,
}: {
  label: string
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={
            'inline-flex items-center justify-center size-7 rounded-md transition ' +
            (active
              ? 'text-primary bg-primary/10'
              : 'text-font/60 hover:text-font hover:bg-foreground') +
            ' disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed'
          }
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

export function MessageActions({ text, onRetry, canRetry }: Props) {
  const [copied, setCopied] = useState(false)
  const [vote, setVote] = useState<Vote>(null)
  const [shared, setShared] = useState(false)

  const copy = async () => {
    if (!text) return
    emitClick('ui:showcase:copy')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard denied */
    }
  }

  const share = async () => {
    if (!text) return
    emitClick('ui:showcase:share')
    const data = { title: 'ONE chat', text }
    const nav = navigator as Navigator & {
      share?: (d: ShareData) => Promise<void>
    }
    try {
      if (typeof nav.share === 'function') await nav.share(data)
      else await nav.clipboard.writeText(text)
      setShared(true)
      setTimeout(() => setShared(false), 1500)
    } catch {
      /* user cancelled */
    }
  }

  const like = () => {
    emitClick('ui:showcase:like')
    setVote((v) => (v === 'up' ? null : 'up'))
  }
  const dislike = () => {
    emitClick('ui:showcase:dislike')
    setVote((v) => (v === 'down' ? null : 'down'))
  }
  const retry = () => {
    emitClick('ui:showcase:retry')
    onRetry()
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <ActionButton label={copied ? 'Copied!' : 'Copy'} onClick={copy} active={copied}>
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </ActionButton>
      <ActionButton label="Retry" onClick={retry} disabled={!canRetry}>
        <RefreshCcw className="size-3.5" />
      </ActionButton>
      <ActionButton label="Like" onClick={like} active={vote === 'up'}>
        <ThumbsUp className="size-3.5" />
      </ActionButton>
      <ActionButton label="Dislike" onClick={dislike} active={vote === 'down'}>
        <ThumbsDown className="size-3.5" />
      </ActionButton>
      <ActionButton label={shared ? 'Shared!' : 'Share'} onClick={share} active={shared}>
        <Share2 className="size-3.5" />
      </ActionButton>
    </div>
  )
}
