import * as React from "react"

import { cn } from "@/lib/utils"

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number
}

function AspectRatio({ ratio = 1, className, style, children, ...props }: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: String(ratio), ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

export { AspectRatio }
