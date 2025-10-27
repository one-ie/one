import * as React from "react"
import { PanelLeft, Newspaper, Shield, ChevronsUpDown, LogOut, UserPlus, LogIn, LayoutDashboard, Settings, X, Github, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/ModeToggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { authClient } from "@/lib/auth-client"

const navItems = [
  { title: 'Stream', url: '/stream', icon: Newspaper },
  { title: 'License', url: '/free-license', icon: Shield },
]

const backendProvider = (import.meta.env.PUBLIC_BACKEND_PROVIDER ?? '').toLowerCase()
const AUTH_ENABLED = backendProvider === 'one'

interface SimpleSidebarLayoutProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SimpleSidebarLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [currentPath, setCurrentPath] = React.useState('')
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const authEnabled = AUTH_ENABLED

  const [user, setUser] = React.useState<{ name: string; email: string; avatar?: string } | null>(null)

  const fetchSession = React.useCallback(async () => {
    if (!authEnabled) {
      setUser(null)
      return
    }

    try {
      const res = await fetch('/api/auth/get-session', { credentials: 'include', cache: 'no-store' })
      if (!res.ok) { setUser(null); return }
      const data = await res.json()
      if (data?.user) {
        setUser({ name: data.user.name || data.user.email || 'User', email: data.user.email || '', avatar: data.user.image || undefined })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [authEnabled])

  React.useEffect(() => {
    setCurrentPath(window.location.pathname)
    if (!authEnabled) { setUser(null); return }
    fetchSession()
    const handleVisibilityChange = () => { if (!document.hidden) fetchSession() }
    const handleFocus = () => fetchSession()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [authEnabled, fetchSession])

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  const initials = user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || "U"

  const authDisabledMenu = (
    <div className={`flex w-full py-2 text-muted-foreground ${collapsed ? 'justify-center' : 'justify-start px-2'}`}>
      <div className="ml-2.5 flex items-center gap-2">
        <a href="https://x.com/tonyoconnell" target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center transition-opacity hover:opacity-80">
          <X className="h-4 w-4" /><span className="sr-only">X profile</span>
        </a>
        <a href="https://github.com/one-ie" target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center transition-opacity hover:opacity-80">
          <Github className="h-4 w-4" /><span className="sr-only">GitHub</span>
        </a>
        <a href="https://www.youtube.com/@onedotie" target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center transition-opacity hover:opacity-80">
          <Youtube className="h-4 w-4" /><span className="sr-only">YouTube</span>
        </a>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen w-full">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r bg-[hsl(var(--color-sidebar))] text-sidebar-foreground transition-all duration-300 ease-in-out z-50 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ width: collapsed ? '80px' : '256px' }}>
        <div className="flex h-16 items-center border-b px-4 shrink-0 relative z-10">
          <a href="/" className="flex items-center gap-3 px-3 transition-opacity hover:opacity-80">
            <img src="/icon.svg" alt="Logo" className="w-8 h-8 shrink-0" />
            {!collapsed && <span className="font-semibold">ONE</span>}
          </a>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.url
              return (
                <a key={item.url} href={item.url} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`} title={collapsed ? item.title : undefined}>
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </a>
              )
            })}
          </div>
        </nav>
        <div className="border-t shrink-0">
          <div className="p-2 border-b">
            <div className={`flex ${collapsed ? 'justify-center' : 'justify-start px-2'}`}>
              <ModeToggle />
            </div>
          </div>
          <div className="p-2">
            {authEnabled ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-3 rounded-md p-2 w-full text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${collapsed ? 'justify-center' : ''}`}>
                    <Avatar className="h-10 w-10 rounded-lg shrink-0">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{user?.name || 'Guest'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email || 'guest@example.com'}</p>
                        </div>
                        <ChevronsUpDown className="h-4 w-4 shrink-0" />
                      </>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-lg bg-popover/100" side="right" align="end" sideOffset={4}>
                  {user ? (
                    <>
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{user?.name}</span>
                            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild><a href="/account" className="flex items-center"><LayoutDashboard className="mr-2" />Dashboard</a></DropdownMenuItem>
                        <DropdownMenuItem asChild><a href="/account/settings" className="flex items-center"><Settings className="mr-2" />Settings</a></DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}><LogOut />Log out</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarFallback className="rounded-lg bg-muted text-sm font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">Guest</span>
                            <span className="truncate text-xs text-muted-foreground">Not signed in</span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild><a href="/account/signin" className="flex items-center"><LogIn className="mr-2" />Sign In</a></DropdownMenuItem>
                        <DropdownMenuItem asChild><a href="/account/signup" className="flex items-center"><UserPlus className="mr-2" />Sign Up</a></DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : authDisabledMenu}
          </div>
        </div>
      </aside>
      <div className="hidden lg:block shrink-0 transition-all duration-300 ease-in-out" style={{ width: collapsed ? '80px' : '256px' }} />
      <div className="flex flex-1 flex-col min-w-0">
        <header data-home-header className="flex h-16 shrink-0 items-center border-b px-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => { if (window.innerWidth < 1024) { setMobileOpen(!mobileOpen) } else { setCollapsed(!collapsed) } }} className="h-7 w-7">
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
          <a href="/" className="absolute left-1/2 -translate-x-1/2">
            <img src="/logo.svg" alt="Logo" className="h-8" />
          </a>
        </header>
        <main id="main-content" className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
