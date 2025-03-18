import { cn } from '../lib/utils';
import { Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Breadcrumbs() {
  const [pathSegments, setPathSegments] = useState<string[]>([]);
  const [isHome, setIsHome] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const currentPath = window.location.pathname;
    setPathSegments(currentPath.split('/').filter(Boolean));
    setIsHome(currentPath === '/');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY === 0);
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
    { text: <Home className="h-4 w-4" />, href: '/', key: 'home' },
    { text: 'Pages', href: '/pages', key: 'pages' }
  ];

  // Add the current page name if it exists
  const currentPage = pathSegments[pathSegments.length - 1];
  if (currentPage) {
    breadcrumbs.push({
      key: currentPage,
      text: currentPage
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      href: '/' + pathSegments.join('/')
    });
  }

  if (isHome || !isVisible) return null;

  return (
    <div className={cn(
      "h-16",
      "flex items-center",
      "bg-transparent"
    )}>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center px-4 gap-2 text-sm text-muted-foreground"
      >
        {breadcrumbs.map((crumb) => (
          <div key={crumb.key || crumb.href} className="flex items-center">
            {crumb !== breadcrumbs[0] && (
              <span className="text-muted-foreground/50 mx-2">/</span>
            )}
            <a
              href={crumb.href}
              className={cn(
                'hover:text-foreground transition-colors',
                { 'flex items-center': crumb === breadcrumbs[0] },
                { 'text-foreground font-medium': crumb === breadcrumbs[breadcrumbs.length - 1] }
              )}
              aria-current={crumb === breadcrumbs[breadcrumbs.length - 1] ? 'page' : undefined}
            >
              {crumb.text}
            </a>
          </div>
        ))}
      </nav>
    </div>
  );
}