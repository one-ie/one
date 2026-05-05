import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { emitClick } from '@/lib/ui-signal'

export const VOICES = [
  { id: 'alloy', label: 'Alloy', desc: 'Neutral, balanced' },
  { id: 'echo', label: 'Echo', desc: 'Warm, conversational' },
  { id: 'fable', label: 'Fable', desc: 'British, expressive' },
  { id: 'onyx', label: 'Onyx', desc: 'Deep, authoritative' },
  { id: 'nova', label: 'Nova', desc: 'Bright, friendly' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft, calm' },
] as const

export type VoiceId = (typeof VOICES)[number]['id']

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  voice: VoiceId
  onVoiceChange: (v: VoiceId) => void
}

export function VoiceMenu({ open, onOpenChange, voice, onVoiceChange }: Props) {
  const current = VOICES.find((v) => v.id === voice)
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 px-3 text-sm gap-1.5"
          onClick={() => emitClick('ui:chat:voice-open')}
        >
          <Volume2 className="size-4" />
          {current?.label ?? 'Voice'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="bg-foreground min-w-56 p-1"
      >
        {VOICES.map((v) => {
          const active = v.id === voice
          return (
            <DropdownMenuItem
              key={v.id}
              data-active={active || undefined}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2 focus:!bg-primary focus:!text-on-primary data-[active]:!bg-primary/15"
              onSelect={(e) => {
                e.preventDefault()
                emitClick('ui:chat:voice-pick', { voice: v.id })
                onVoiceChange(v.id)
                onOpenChange(false)
              }}
            >
              <span className="font-medium">{v.label}</span>
              <span className="text-font/60 text-xs">{v.desc}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
