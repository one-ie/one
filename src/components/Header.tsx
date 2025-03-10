'use client';

import { Download } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex h-[65px] items-center justify-between border-b border-[var(--one-border)] bg-[var(--one-background-main)] px-4 sm:bg-[var(--one-background-main)]">
      {/* Mobile Menu Button */}
      <div className="sm:hidden">
        <a
          href="/menu"
          className="rounded-md p-2 transition-colors hover:bg-accent/10"
          aria-label="Menu"
        >
          <svg
            className="h-5 w-5 text-muted-foreground/70 transition-colors hover:text-foreground/90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

      {/* Logo */}
      <div className="flex flex-1 items-center justify-center sm:ml-[80px]">
        <a href="/" aria-label="Home">
          <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
        </a>
      </div>

      {/* Download Button */}
      <div className="flex items-center justify-end">
        <a
          href="/download"
          className="group flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20"
        >
          <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          <span className="hidden sm:inline">Download</span>
        </a>
      </div>
    </header>
  );
}

export { Header };