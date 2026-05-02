import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { emitClick } from '@/lib/ui-signal'

interface Props {
  open: boolean
}

export function ThemeToggle({ open }: Props) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      const stored = JSON.parse(localStorage.getItem('one:theme') || '{}')
      localStorage.setItem('one:theme', JSON.stringify({ ...stored, mode: next ? 'dark' : 'light' }))
    } catch {}
    emitClick('ui:sidebar:theme', { mode: next ? 'dark' : 'light' })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
        'text-font/60 hover:bg-foreground/60 hover:text-font',
        !open && 'justify-center px-0',
      )}
      style={{ transition: 'background-color var(--ease), color var(--ease)' }}
    >
      <Icon icon={dark ? Sun : Moon} size={open ? 'md' : 'lg'} />
      {open && <span>{dark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  )
}
