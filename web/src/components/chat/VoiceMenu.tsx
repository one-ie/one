import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { emitClick } from '@/lib/ui-signal'
import {
  VoiceSelector,
  VoiceSelectorContent,
  VoiceSelectorEmpty,
  VoiceSelectorGroup,
  VoiceSelectorInput,
  VoiceSelectorItem,
  VoiceSelectorList,
  VoiceSelectorTrigger,
} from '@/components/ai-elements/voice-selector'

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
  return (
    <VoiceSelector
      open={open}
      onOpenChange={onOpenChange}
      value={voice}
      onValueChange={(v) => v && onVoiceChange(v as VoiceId)}
    >
      <VoiceSelectorTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 px-3 text-sm gap-1.5"
          onClick={() => emitClick('ui:chat:voice-open')}
        >
          <Volume2 className="size-4" />
          {VOICES.find((v) => v.id === voice)?.label ?? 'Voice'}
        </Button>
      </VoiceSelectorTrigger>
      <VoiceSelectorContent>
        <VoiceSelectorInput placeholder="Search voices…" />
        <VoiceSelectorList>
          <VoiceSelectorEmpty>No voice found.</VoiceSelectorEmpty>
          <VoiceSelectorGroup heading="OpenAI voices">
            {VOICES.map((v) => (
              <VoiceSelectorItem
                key={v.id}
                value={v.id}
                onSelect={(value) => {
                  emitClick('ui:chat:voice-pick', { voice: value })
                  onVoiceChange(value as VoiceId)
                  onOpenChange(false)
                }}
              >
                <span className="font-medium">{v.label}</span>
                <span className="text-font/60 text-xs ml-2">{v.desc}</span>
              </VoiceSelectorItem>
            ))}
          </VoiceSelectorGroup>
        </VoiceSelectorList>
      </VoiceSelectorContent>
    </VoiceSelector>
  )
}
