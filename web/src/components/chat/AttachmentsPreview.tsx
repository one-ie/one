'use client'

import { Attachment, Attachments, AttachmentPreview, AttachmentRemove } from '@/components/ai-elements/attachments'
import { PromptInputHeader } from '@/components/ai-elements/prompt-input'
import { usePromptInputAttachments } from '@/components/ai-elements/prompt-input'

export function AttachmentsPreview() {
  const attachments = usePromptInputAttachments()
  if (attachments.files.length === 0) return null
  return (
    <PromptInputHeader>
      <Attachments variant="inline">
        {attachments.files.map((a) => (
          <Attachment data={a} key={a.id} onRemove={() => attachments.remove(a.id)}>
            <AttachmentPreview />
            <AttachmentRemove />
          </Attachment>
        ))}
      </Attachments>
    </PromptInputHeader>
  )
}
