import { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, FileText, Camera, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input'

function FileInput({
  inputRef,
  accept,
  label,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  accept?: string
  label: string
}) {
  const attachments = usePromptInputAttachments()
  return (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple
      aria-label={label}
      className="sr-only"
      onChange={(e) => {
        const files = Array.from(e.currentTarget.files ?? [])
        if (files.length) attachments.add(files)
        e.currentTarget.value = ''
      }}
    />
  )
}

function CameraDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const attachments = usePromptInputAttachments()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelled) {
          for (const t of stream.getTracks()) t.stop()
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
      .catch((e: Error) => {
        setError(e.message || 'Camera unavailable')
      })
    return () => {
      cancelled = true
      const s = streamRef.current
      if (s) for (const t of s.getTracks()) t.stop()
      streamRef.current = null
    }
  }, [open])

  if (!open) return null

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        attachments.add([file])
        onClose()
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl bg-background rounded-2xl overflow-hidden border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {error ? (
          <div className="p-8 text-center text-font">
            <p className="mb-4">Camera unavailable: {error}</p>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-auto bg-black" playsInline muted />
            <div className="flex justify-between items-center gap-3 p-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={capture} className="bg-primary text-on-primary">
                <Camera className="size-4 mr-2" />
                Capture
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function AddMenu() {
  const attachments = usePromptInputAttachments()
  const [open, setOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const picturesRef = useRef<HTMLInputElement | null>(null)
  const filesRef = useRef<HTMLInputElement | null>(null)

  const captureScreenshot = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      console.error('Screen capture unsupported')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      const track = stream.getVideoTracks()[0]
      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true
      await video.play()
      await new Promise((r) => setTimeout(r, 120))
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.drawImage(video, 0, 0)
      track.stop()
      canvas.toBlob((blob) => {
        if (!blob) return
        const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' })
        attachments.add([file])
      }, 'image/png')
    } catch (e) {
      console.error('screenshot error', e)
    }
  }
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 400)
  }
  return (
    <>
      <FileInput inputRef={picturesRef} accept="image/*" label="Pictures" />
      <FileInput inputRef={filesRef} label="Files" />
      <PromptInputActionMenu open={open} onOpenChange={setOpen} modal={false}>
        <div
          className="inline-flex self-end pb-2 pl-2"
          onMouseEnter={() => {
            cancelClose()
            setOpen(true)
          }}
          onMouseLeave={scheduleClose}
        >
          <PromptInputActionMenuTrigger
            aria-label="Add attachment"
            className="!size-9 !rounded-full [&>svg]:!size-4 !bg-foreground hover:!bg-primary hover:!text-on-primary data-[state=open]:!bg-primary data-[state=open]:!text-on-primary"
          />
        </div>
        <PromptInputActionMenuContent
          sideOffset={4}
          className="bg-foreground"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <DropdownMenuItem
            className="focus:!bg-primary focus:!text-on-primary"
            onSelect={(e) => {
              e.preventDefault()
              setOpen(false)
              picturesRef.current?.click()
            }}
          >
            <ImageIcon className="mr-2 size-4 shrink-0" />
            Pictures
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:!bg-primary focus:!text-on-primary"
            onSelect={(e) => {
              e.preventDefault()
              setOpen(false)
              filesRef.current?.click()
            }}
          >
            <FileText className="mr-2 size-4 shrink-0" />
            Files
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:!bg-primary focus:!text-on-primary"
            onSelect={(e) => {
              e.preventDefault()
              setOpen(false)
              setCameraOpen(true)
            }}
          >
            <Camera className="mr-2 size-4 shrink-0" />
            Camera
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:!bg-primary focus:!text-on-primary"
            onSelect={(e) => {
              e.preventDefault()
              setOpen(false)
              void captureScreenshot()
            }}
          >
            <Monitor className="mr-2 size-4 shrink-0" />
            Screenshot
          </DropdownMenuItem>
        </PromptInputActionMenuContent>
      </PromptInputActionMenu>
      <CameraDialog open={cameraOpen} onClose={() => setCameraOpen(false)} />
    </>
  )
}
