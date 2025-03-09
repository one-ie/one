import { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useStore } from '@nanostores/react';
import { layoutStore } from '../stores/layout';
import type { Theme } from '../types/theme';
import {
  Newspaper, Headphones, Download, Shield, Sun, Moon, CircleDot,
  type LucideIcon
} from 'lucide-react';

// Default navigation items
const defaultNavigation = [
  { title: 'Blog', path: '/blog', icon: Newspaper },
  { title: 'Podcast', path: '/podcast', icon: Headphones },
  { title: 'Download', path: '/download', icon: Download },
  { title: 'License', path: '/free-license', icon: Shield }
];

interface NavigationItem {
  title: string;
  path: string;
  icon?: LucideIcon;
  variant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'primary';
}

interface SidebarProps {
  navigation?: NavigationItem[];
  type?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Left({ navigation, isOpen, onOpenChange }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [sidebarState, setSidebarState] = useState<'closed' | 'open' | 'expanded'>('open');
  const [theme, setTheme] = useState<Theme>('dark');
  const layout = useStore(layoutStore);

  // Use the navigation prop or fall back to default navigation
  const mainNavItems = navigation || defaultNavigation;

  const isMobileDevice = () => window.innerWidth < 640;

  useEffect(() => {
    setMounted(true);
    const isMobile = isMobileDevice();
    setSidebarState(isMobile ? 'closed' : 'open');

    if (typeof window !== 'undefined' && window.getThemePreference) {
      setTheme(window.getThemePreference());
    }

    const handleThemeChange = (e: CustomEvent<Theme>) => {
      setTheme(e.detail);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);
    const handleResize = () => {
      const isMobile = isMobileDevice();
      if (isMobile && sidebarState !== 'closed') {
        setSidebarState('closed');
        onOpenChange?.(false);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    setCurrentPath(window.location.pathname);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
    };
  }, [onOpenChange]);

  useEffect(() => {
    if (isMobileDevice()) {
      setSidebarState(isOpen ? 'open' : 'closed');
    }
  }, [isOpen]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobileDevice() && sidebarState === 'open') {
      setSidebarState('expanded');
    }
  }, [sidebarState]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobileDevice() && sidebarState === 'expanded') {
      setSidebarState('open');
    }
  }, [sidebarState]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 
                       theme === 'light' ? 'high-contrast' : 
                       'dark';
    if (typeof window !== 'undefined' && window.setTheme) {
      window.setTheme(next);
    }
  }, [theme]);

  if (!mounted) return null;
  if (layout.mode === 'Full') return null;

  return (
    <>
      {isMobileDevice() && sidebarState !== 'closed' && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => {
            setSidebarState('closed');
            onOpenChange?.(false);
          }}
          aria-hidden="true"
        />
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="complementary"
        aria-label="Main navigation"
        className={cn(
          "fixed left-0 top-0 h-screen z-40",
          "bg-[hsl(var(--one-background-nav))] border-r border-[hsl(var(--one-border-nav))]",
          "transition-all duration-300 ease-in-out will-change-transform",
          "transform",
          {
            "-translate-x-full sm:translate-x-0 w-0 sm:w-16": sidebarState === 'closed',
            "translate-x-0 w-16": sidebarState === 'open',
            "translate-x-0 w-[173px]": sidebarState === 'expanded'
          }
        )}
      >
        <nav
          role="navigation"
          aria-label="Primary navigation"
          className={cn(
            "h-full flex flex-col bg-[hsl(var(--one-background-nav))]",
            sidebarState === 'closed' && "invisible sm:visible"
          )}
        >
          {/* Logo Section with black background */}
          <div className="flex items-center justify-center bg-[hsl(var(--one-background-logo))]">
            <Button
              variant="ghost"
              className={cn(
                "relative w-16 h-16 flex items-center justify-center rounded-none",
                sidebarState === 'expanded' ? "w-full" : "",
                "transition-colors duration-200",
                "hover:bg-[hsl(var(--one-background-nav))]"
              )}
              asChild
            >
              <a href="/" className="flex items-center gap-4">
                <div className="absolute inset-0 flex items-center justify-center w-16 h-16">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img
                      src="/icon.svg"
                      alt="ONE Logo"
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <span className={cn(
                  "transition-all duration-200 text-foreground font-medium",
                  sidebarState === 'expanded' ? "opacity-100 pl-4" : "opacity-0 w-0",
                  "truncate"
                )}>
                  ONE
                </span>
              </a>
            </Button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col" role="menu">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.path} role="none">
                  <Button
                    variant="ghost"
                    aria-current={currentPath === item.path ? 'page' : undefined}
                    aria-label={item.title}
                    className={cn(
                      "relative w-16 h-16 flex items-center justify-center rounded-none one-nav-item",
                      sidebarState === 'expanded' ? "w-full" : "",
                      currentPath === item.path ? 
                        "bg-[hsl(var(--one-background-logo))]" : 
                        "hover:bg-[hsl(var(--one-background-logo))]",
                      "transition-colors duration-200"
                    )}
                    asChild
                  >
                    <a href={item.path} className="flex items-center gap-4" role="menuitem">
                      {Icon && (
                        <div className="absolute inset-0 flex items-center justify-center w-16 h-16">
                          <div className="w-8 h-8 flex items-center justify-center">
                            <Icon
                              className="w-full h-full text-foreground/70 group-hover:text-foreground/90 transition-colors"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      )}
                      <span className={cn(
                        "transition-all duration-200 text-foreground",
                        sidebarState === 'expanded' ? "opacity-100 pl-4" : "opacity-0 w-0",
                        "truncate"
                      )}>
                        {item.title}
                      </span>
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <div className={cn(
            "flex items-center justify-center",
            "bg-[hsl(var(--one-background-logo))]"
          )}>
            <Button
              variant="ghost"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : theme === 'high-contrast' ? 'dark' : 'high-contrast'} theme`}
              aria-pressed={theme === 'dark'}
              className={cn(
                "w-16 h-16 flex items-center justify-center rounded-none",
                sidebarState === 'expanded' ? "w-full" : "",
                "hover:bg-[hsl(var(--one-background-nav))]",
                "focus-visible:ring-1 focus-visible:ring-ring",
                "transition-colors duration-200"
              )}
              onClick={toggleTheme}
            >
              <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                <div className="w-10 h-10 flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-foreground" strokeWidth={1.5} aria-hidden="true" />
                  ) : theme === 'high-contrast' ? (
                    <CircleDot className="w-5 h-5 text-foreground" strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Sun className="w-5 h-5 text-foreground" strokeWidth={1.5} aria-hidden="true" />
                  )}
                </div>
              </div>
              <span className={cn(
                "transition-all duration-200 text-foreground",
                sidebarState === 'expanded' ? "opacity-100 pl-4" : "opacity-0 w-0",
                "truncate"
              )}>
                {theme === 'dark' ? 'Light Mode' : theme === 'high-contrast' ? 'Dark Mode' : 'High Contrast'}
              </span>
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Left;