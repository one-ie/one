import { cn } from '../lib/utils';
import { Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Breadcrumbs() {
  const [pathSegments, setPathSegments] = useState<string[]>([]);
  const [isHome, setIsHome] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updatePath = () => {
      const currentPath = window.location.pathname;
      setPathSegments(currentPath.split('/').filter(Boolean));
      setIsHome(currentPath === '/');
    };

    // Initial path update
    updatePath();

    // Listen for navigation events
    window.addEventListener('popstate', updatePath);
    // Also listen for click navigation
    const handleClick = () => {
      setTimeout(updatePath, 0);
    };
    document.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('popstate', updatePath);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  interface Breadcrumb {
    text: React.ReactNode;
    href: string;
    key?: string;
  }

  const breadcrumbs: Breadcrumb[] = [
    { text: <Home className="h-4 w-4" />, href: '/', key: 'home' }
  ];

  // Add section (blog or docs)
  if (pathSegments[0]) {
    const section = pathSegments[0];
    if (section === 'blog' || section === 'docs') {
      breadcrumbs.push({
        text: section.charAt(0).toUpperCase() + section.slice(1),
        href: `/${section}`,
        key: section
      });
    }
  }

  // Add intermediate segments (if any)
  for (let i = 1; i < pathSegments.length - 1; i++) {
    const segment = pathSegments[i];
    breadcrumbs.push({
      key: segment,
      text: segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      href: '/' + pathSegments.slice(0, i + 1).join('/')
    });
  }

  // Add the current page name if it exists
  const currentPage = pathSegments[pathSegments.length - 1];
  if (currentPage && pathSegments.length > 0) {
    breadcrumbs.push({
      key: currentPage,
      text: currentPage
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      href: '/' + pathSegments.join('/')
    });
  }

  // Only hide breadcrumbs on the actual homepage
  if (isHome) return null;

  // Don't show breadcrumbs if we only have the home icon and nothing else
  if (breadcrumbs.length <= 1) return null;

  return (
    <div className={cn(
      "h-16",
      "flex items-center",
      "bg-transparent",
      "transition-opacity duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center px-4 gap-2 text-sm text-muted-foreground"
      >
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.key || crumb.href} className="flex items-center">
            {index > 0 && (
              <span className="text-muted-foreground/50 mx-2">/</span>
            )}
            <a
              href={crumb.href}
              className={cn(
                'hover:text-foreground transition-colors',
                { 'flex items-center': index === 0 },
                { 'text-foreground font-medium': index === breadcrumbs.length - 1 }
              )}
              aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
            >
              {crumb.text}
            </a>
          </div>
        ))}
      </nav>
    </div>
  );
}