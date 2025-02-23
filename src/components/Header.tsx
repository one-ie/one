// src/components/Header.tsx
import {
  Home,
  Newspaper,
  Headphones,
  Download,
  FileText,
  Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Default navigation items
const defaultNavigation = [
  { title: 'Home', path: '/', icon: Home },
  { title: 'Blog', path: '/blog', icon: Newspaper },
  { title: 'Podcast', path: '/podcast', icon: Headphones },
  { title: 'Download', path: '/download', icon: Download },
  { title: 'Docs', path: '/docs', icon: FileText },
  { title: 'License', path: '/free-license', icon: Shield }
];

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className="flex items-center justify-between h-[65px] px-4 border-b bg-[hsl(var(--one-background-nav))] sm:bg-transparent backdrop-blur relative z-50">
      {/* Left column */}
      <div className="sm:hidden">
        <a
          href="/menu"
          className="p-2 hover:bg-accent/10 rounded-md focus:outline-none transition-colors duration-200 block"
          aria-label="Menu"
        >
          <svg
            className="h-5 w-5 text-muted-foreground/70 hover:text-foreground/90 transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </a>
      </div>
      
      {/* Center column with Logo */}
      <div className="flex-1 flex items-center justify-center sm:ml-[80px]">
        <a href="/" className="flex items-center justify-center">
          <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
        </a>
      </div>
      
      {/* Right column */}
      <div className="flex items-center justify-end">
        <a
          href="/download"
          className="group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 ease-in-out"
        >
          <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          <span className="hidden sm:inline">Download</span>
        </a>
      </div>
    </header>
  );
}

export { Header };