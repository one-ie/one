/**
 * MinimalSidebar Component
 *
 * Simplified navigation for non-ONE organizations
 * Shows only: Blog + License + Website link
 */

import * as React from "react";
import { ExternalLink, X, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

interface MinimalSidebarProps {
  orgName: string;
  orgWebsite: string;
  children: React.ReactNode;
}

export function MinimalSidebar({ orgName, orgWebsite, children }: MinimalSidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState('');
  const isMobile = useIsMobile();
  const websiteDisplay = orgWebsite.replace(/^https?:\/\//, "");

  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - fixed width on desktop, overlay on mobile */}
      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col border-r bg-[hsl(var(--color-sidebar))] text-sidebar-foreground transition-all duration-300 ease-in-out z-50 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ width: '256px' }}
      >
        {/* Header with logo/name */}
        <div className="flex h-16 items-center border-b px-4 shrink-0 relative z-10 justify-between">
          <a
            href="/"
            className="flex items-center gap-3 px-3 transition-opacity hover:opacity-80"
            aria-label="Navigate to homepage"
          >
            <span className="font-semibold text-xl">{orgName}</span>
          </a>

          {/* Close button for mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation - scrollable */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {/* Blog */}
            <a
              href="/blog"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                currentPath === '/blog' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
              }`}
            >
              <span className="text-lg">📝</span>
              <span>Blog</span>
            </a>

            {/* License */}
            <a
              href="/license"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                currentPath === '/license' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
              }`}
            >
              <span className="text-lg">📜</span>
              <span>License</span>
            </a>

            {/* Divider */}
            <div className="my-4 border-t border-border/50" />

            {/* Website Link */}
            <a
              href={orgWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-xs text-muted-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>{websiteDisplay}</span>
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t p-4 shrink-0">
          {/* Mode Toggle */}
          <div className="mb-4 flex justify-center">
            <ModeToggle />
          </div>

          {/* Powered by ONE */}
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Built with{" "}
            <a
              href="https://one.ie"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              ONE Platform
            </a>
          </p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">{orgName}</span>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
