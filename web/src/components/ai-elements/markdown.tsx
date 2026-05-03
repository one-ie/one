import Markdown from 'markdown-to-jsx'
import type { ReactNode } from 'react'
import type { BundledLanguage } from 'shiki'
import { CodeBlock, CodeBlockCopyButton } from './code-block'

function extractCode(node: ReactNode): { code: string; lang: BundledLanguage } | null {
  if (!node || typeof node !== 'object' || !('props' in node)) return null
  const child = (node as { props?: { children?: unknown; className?: string } }).props
  if (!child) return null
  const code = typeof child.children === 'string' ? child.children : null
  if (code === null) return null
  const m = /lang-(\w+)/.exec(child.className ?? '')
  return { code: code.replace(/\n$/, ''), lang: ((m?.[1] ?? 'text') as BundledLanguage) }
}

function Pre({ children }: { children?: ReactNode }) {
  const extracted = extractCode(children)
  if (!extracted) return <pre className="my-2">{children}</pre>
  return (
    <CodeBlock code={extracted.code} language={extracted.lang} className="my-2">
      <div className="absolute right-2 top-2">
        <CodeBlockCopyButton />
      </div>
    </CodeBlock>
  )
}

const overrides = {
  pre: Pre,
  code: {
    props: {
      className: 'rounded bg-foreground px-1.5 py-0.5 text-[0.9em] font-mono',
    },
  },
  a: {
    props: {
      className: 'text-primary underline underline-offset-2',
      target: '_blank',
      rel: 'noreferrer',
    },
  },
  ul: { props: { className: 'list-disc ml-5 my-2 space-y-1' } },
  ol: { props: { className: 'list-decimal ml-5 my-2 space-y-1' } },
  li: { props: { className: 'leading-relaxed' } },
  p: { props: { className: 'leading-relaxed' } },
  h1: { props: { className: 'text-xl font-bold mt-3 mb-2' } },
  h2: { props: { className: 'text-lg font-bold mt-3 mb-2' } },
  h3: { props: { className: 'text-base font-bold mt-2 mb-1' } },
  blockquote: {
    props: {
      className: 'border-l-2 border-font/20 pl-3 italic text-font/80 my-2',
    },
  },
  table: { props: { className: 'border-collapse my-2 text-sm' } },
  th: { props: { className: 'border border-font/20 px-2 py-1 font-semibold text-left' } },
  td: { props: { className: 'border border-font/20 px-2 py-1' } },
  hr: { props: { className: 'border-font/15 my-3' } },
}

export function MarkdownView({ children, className }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <Markdown options={{ overrides, forceBlock: true }}>{children}</Markdown>
    </div>
  )
}
