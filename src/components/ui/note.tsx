"use client"

import * as React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface NoteProps {
  children: React.ReactNode
  className?: string
}

export function Note({ children, className }: NoteProps) {
  return (
    <Alert className={`my-6 flex items-start gap-4 ${className || ''}`}>
      <InfoIcon className="h-5 w-5 mt-0.5 text-blue-500" />
      <AlertDescription className="!mt-0 [&>p]:leading-relaxed">
        {children}
      </AlertDescription>
    </Alert>
  )
} 