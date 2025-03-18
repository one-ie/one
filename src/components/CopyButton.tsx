import * as React from 'react'
import { Check, Copy } from 'lucide-react'

type CopyButtonProps = {
content: string
className?: string
label?: string
}

export default function CopyButton({ content, className = "", label = "Copy" }: CopyButtonProps) {
const [copied, setCopied] = React.useState(false)

const handleCopy = async () => {
try {
await navigator.clipboard.writeText(content)
setCopied(true)
setTimeout(() => setCopied(false), 2000)
} catch (err) {
console.error('Failed to copy:', err)
}
}

return (
<button
onClick={handleCopy}
className={`inline-flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
title={label}
>
{copied ? (
  <Check className="h-4 w-4" />
) : (
  <Copy className="h-4 w-4" />
)}
</button>
)
}