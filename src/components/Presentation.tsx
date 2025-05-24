import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css'; // You can switch to another theme if desired
import 'reveal.js/plugin/highlight/monokai.css'; // Highlight.js code block theme (switch as needed)
import React, { useEffect, useRef } from "react";
import type { FC, ReactNode } from "react";

// Props for the Presentation component
interface PresentationProps {
  title: string;
  authors?: string[];
  description?: string;
  slides: string[];
  coverImage?: string;
  children?: ReactNode;
}

/**
 * Presentation component for displaying Reveal.js presentations in Astro/React.
 * - Initializes Reveal.js and highlight.js plugin on mount.
 * - Renders a container for slides (children or dynamic import in future).
 * - Minimal Tailwind styling for layout.
 * - Extendable for more plugins/configuration.
 */
const Presentation: FC<PresentationProps> = ({
  title,
  authors = [],
  description,
  slides,
  coverImage,
  children,
}) => {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined" || !revealRef.current) return;
    // Dynamically import Reveal.js and plugins
    let deck: any;
    (async () => {
      const Reveal = (await import("reveal.js")).default;
      const RevealHighlight = (await import("reveal.js/plugin/highlight/highlight.esm.js")).default;
      deck = new Reveal(revealRef.current!, {
        plugins: [RevealHighlight],
        hash: true,
        // Add more config as needed
      });
      deck.initialize();
    })();
    // Cleanup (if Reveal.js supports it)
    return () => {
      if (deck && typeof deck.destroy === "function") deck.destroy();
    };
  }, []);

  // SSR fallback: just show static content
  if (typeof window === "undefined") {
    return (
      <div className="p-8 border rounded bg-muted">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {description && <p className="mb-2 text-muted-foreground">{description}</p>}
        {coverImage && <img src={coverImage} alt={title} className="mb-4 rounded" />}
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">{title}</h2>
        {authors.length > 0 && (
          <div className="text-sm text-muted-foreground mb-1">
            By {authors.join(", ")}
          </div>
        )}
        {description && <p className="mb-2 text-muted-foreground">{description}</p>}
        {coverImage && <img src={coverImage} alt={title} className="mb-4 rounded" />}
      </div>
      <div ref={revealRef} className="reveal bg-background rounded shadow">
        <div className="slides">
          {/*
            In the future, you can map slides here or render children.
            For now, just render children (Astro/MDX can pass slide content).
          */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Presentation; 