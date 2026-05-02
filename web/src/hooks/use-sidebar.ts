import { useEffect, useState } from 'react'
import { emitClick } from '@/lib/ui-signal'

const KEY = 'one:sidebar:open'

export function useSidebar(initial: boolean): {
  open: boolean
  toggle: () => void
  set: (next: boolean) => void
} {
  const [open, setOpen] = useState(initial)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved !== null) setOpen(saved === 'true')
    } catch {}
  }, [])

  const set = (next: boolean) => {
    setOpen(next)
    try {
      localStorage.setItem(KEY, String(next))
    } catch {}
  }

  const toggle = () => {
    set(!open)
    emitClick('ui:sidebar:toggle', { open: !open })
  }

  return { open, toggle, set }
}

export function usePathname(): string {
  const [path, setPath] = useState('/')
  useEffect(() => {
    if (typeof window === 'undefined') return
    setPath(window.location.pathname)
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return path
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}
