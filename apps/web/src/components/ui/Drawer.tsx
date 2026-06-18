import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { emitClick } from "@/lib/ui-signal"

export interface DrawerProps {
  id: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  /** Optional node rendered left of the title (e.g. an IconBadge for kind identity). */
  titlePrefix?: React.ReactNode
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  headerControls?: React.ReactNode
  modal?: boolean
}

export function Drawer({
  id,
  open,
  onOpenChange,
  title,
  titlePrefix,
  description,
  children,
  footer,
  headerControls,
  modal = true,
}: DrawerProps) {
  // Deep-link: on mount, check ?drawer=<id> and open if matched
  const [internalOpen, setInternalOpen] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const params = new URLSearchParams(window.location.search)
    return params.get("drawer") === id
  })

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      emitClick('ui:drawer', next ? 'open' : 'close', { id })

      // Sync query param
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        if (next) {
          url.searchParams.set("drawer", id)
        } else {
          url.searchParams.delete("drawer")
        }
        history.replaceState(null, "", url.toString())
      }

      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [id, isControlled, onOpenChange]
  )

  return (
    <DialogPrimitive.Root
      data-slot="drawer"
      modal={modal}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      {/* Overlay */}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="drawer-overlay"
          className={cn(
            "fixed inset-0 isolate z-50 bg-black/20 duration-200",
            "supports-backdrop-filter:backdrop-blur-xs",
            "data-open:animate-in data-open:fade-in-0",
            "data-closed:animate-out data-closed:fade-out-0"
          )}
        />

        {/* Panel — slides in from the right */}
        <DialogPrimitive.Content
          data-slot="drawer-content"
          className={cn(
            // Position: fixed, right-aligned, full height
            "fixed inset-y-0 right-0 z-50 flex flex-col",
            // Width: full on mobile, fixed on md+
            "w-full md:w-[480px]",
            // Background uses design token
            "bg-background",
            // Slide-in animation
            "duration-300 ease-out",
            "data-open:animate-in data-open:slide-in-from-right",
            "data-closed:animate-out data-closed:slide-out-to-right"
          )}
          style={{
            borderLeft: "1px solid",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b shrink-0"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                {titlePrefix}
                <DialogPrimitive.Title
                  data-slot="drawer-title"
                  className="font-heading text-base font-medium leading-none text-font"
                >
                  {title}
                </DialogPrimitive.Title>
              </div>
              {description && (
                <DialogPrimitive.Description
                  data-slot="drawer-description"
                  className="text-sm text-font/60"
                >
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>

            <div className="flex flex-col items-center gap-1 shrink-0">
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon-sm">
                  <XIcon />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogPrimitive.Close>
              {headerControls}
            </div>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>

          {/* Footer — optional */}
          {footer && (
            <div
              className="shrink-0 px-5 py-4 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
