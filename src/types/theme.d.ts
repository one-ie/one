export type Theme = 'light' | 'dark' | 'high-contrast';

declare global {
  interface Window {
    setTheme?: (theme: Theme) => void;
    getThemePreference?: () => Theme;
  }
}