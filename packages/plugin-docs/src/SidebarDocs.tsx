import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export interface DocEntry {
  slug: string
  data: {
    title: string
    order?: number
  }
}

export interface SidebarFolder {
  folder: string
  label: string
  icon?: string
}

export interface SidebarDocsProps {
  entries: DocEntry[]
  currentSlug: string
  sidebar?: SidebarFolder[]
}

function groupByFolder(entries: DocEntry[]): Record<string, DocEntry[]> {
  const groups: Record<string, DocEntry[]> = {}
  for (const entry of entries) {
    const folder = entry.slug.includes('/') ? entry.slug.split('/')[0] : '_root'
    if (!groups[folder]) groups[folder] = []
    groups[folder].push(entry)
  }
  // Sort entries within each folder by order then title
  for (const folder of Object.keys(groups)) {
    groups[folder].sort((a, b) => {
      const ao = a.data.order ?? 999
      const bo = b.data.order ?? 999
      if (ao !== bo) return ao - bo
      return a.data.title.localeCompare(b.data.title)
    })
  }
  return groups
}

function FolderSection({
  folderKey,
  label,
  icon,
  entries,
  currentSlug,
}: {
  folderKey: string
  label: string
  icon?: string
  entries: DocEntry[]
  currentSlug: string
}) {
  const hasActive = entries.some((e) => e.slug === currentSlug)
  const [open, setOpen] = useState(hasActive || folderKey === '_root')

  return (
    <div className="mb-1">
      {folderKey !== '_root' && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          aria-expanded={open}
        >
          {icon && <span aria-hidden="true">{icon}</span>}
          <span className="flex-1 text-left">{label}</span>
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      )}
      {open && (
        <ul className={folderKey !== '_root' ? 'ml-3 border-l border-border pl-2' : ''}>
          {entries.map((entry) => {
            const isActive = entry.slug === currentSlug
            return (
              <li key={entry.slug}>
                <a
                  href={`/docs/${entry.slug}`}
                  className={[
                    'block rounded px-2 py-1 text-sm transition-colors',
                    isActive
                      ? 'text-primary font-medium bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {entry.data.title}
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/**
 * SidebarDocs — collapsible folder-grouped sidebar for the docs collection.
 * Folder order follows the `sidebar` config array; unlisted folders append at the end.
 */
export function SidebarDocs({ entries, currentSlug, sidebar = [] }: SidebarDocsProps) {
  const groups = groupByFolder(entries)

  // Build ordered folder list: sidebar config first, then remaining folders
  const configuredFolders = sidebar.map((s) => s.folder)
  const remainingFolders = Object.keys(groups).filter(
    (f) => !configuredFolders.includes(f) && f !== '_root',
  )
  const orderedFolders = [...configuredFolders, ...remainingFolders]

  // Root entries (no folder) render first without a header
  const rootEntries = groups['_root'] ?? []

  return (
    <nav
      aria-label="Documentation navigation"
      className="h-full overflow-y-auto py-4 pr-2 text-sm"
    >
      {rootEntries.length > 0 && (
        <FolderSection
          folderKey="_root"
          label=""
          entries={rootEntries}
          currentSlug={currentSlug}
        />
      )}
      {orderedFolders.map((folderKey) => {
        const folderEntries = groups[folderKey]
        if (!folderEntries?.length) return null
        const config = sidebar.find((s) => s.folder === folderKey)
        const label = config?.label ?? folderKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        return (
          <FolderSection
            key={folderKey}
            folderKey={folderKey}
            label={label}
            icon={config?.icon}
            entries={folderEntries}
            currentSlug={currentSlug}
          />
        )
      })}
    </nav>
  )
}
