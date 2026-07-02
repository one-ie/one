import { Search } from 'lucide-react'

export interface DocSearchProps {
  value?: string
  placeholder?: string
}

/**
 * DocSearch — form-based full-text search for the docs collection.
 * Submits to /docs with ?search= preserving view/folder/tag params.
 */
export function DocSearch({ value = '', placeholder = 'Search docs…' }: DocSearchProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem('search') as HTMLInputElement
    const params = new URLSearchParams(window.location.search)
    params.set('search', input.value)
    // Preserve view/folder/tag but reset pagination
    params.delete('page')
    window.location.href = `/docs?${params.toString()}`
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
        <Search className="h-4 w-4" />
      </span>
      <input
        type="search"
        name="search"
        defaultValue={value}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Search documentation"
      />
    </form>
  )
}
