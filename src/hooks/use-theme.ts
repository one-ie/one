import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'high-contrast';

// Define window interface to include our theme functions
declare global {
  interface Window {
    setTheme?: (theme: Theme) => void;
    getThemePreference?: () => Theme;
    cycleTheme?: () => void;
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Initialize theme state from global function or localStorage
    const initialTheme = window.getThemePreference?.() || 
      (localStorage.getItem('theme') as Theme) || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    setThemeState(initialTheme);

    // Listen for theme changes from other sources
    const handleThemeChange = (e: CustomEvent<Theme>) => {
      setThemeState(e.detail);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    // Use global function if available
    if (window.setTheme) {
      window.setTheme(newTheme);
    } else {
      // Fallback implementation
      document.documentElement.classList.remove('light', 'dark', 'high-contrast');
      if (newTheme !== 'light') {
        document.documentElement.classList.add(newTheme);
      }
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }
    
    // Update local state
    setThemeState(newTheme);
  };

  const cycleTheme = () => {
    // Use global function if available
    if (window.cycleTheme) {
      window.cycleTheme();
    } else {
      // Fallback implementation
      switch (theme) {
        case 'light':
          setTheme('dark');
          break;
        case 'dark':
          setTheme('high-contrast');
          break;
        case 'high-contrast':
          setTheme('light');
          break;
        default:
          setTheme('light');
      }
    }
  };

  return { 
    theme, 
    setTheme, 
    cycleTheme 
  };
}