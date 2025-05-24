'use client';

import { useEffect, useRef, useState } from "react";
import { marked } from 'marked';

interface RevealPresentationProps {
  slides: string[];
  title?: string;
  theme?: string;
  config?: any;
}

export default function RevealPresentation({ 
  slides, 
  title = "Presentation",
  theme = "black",
  config = {} 
}: RevealPresentationProps) {
  const deckDivRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slides || slides.length === 0) {
      setError('No slides provided');
      return;
    }
    setIsLoaded(false);
    setError(null);

    let isMounted = true;
    let revealInstance: any = null;

    const loadReveal = async () => {
      try {
        const [{ default: Reveal }] = await Promise.all([
          import('reveal.js'),
          import('reveal.js/dist/reveal.css'),
          import('reveal.js/dist/theme/black.css')
        ]);
        if (!isMounted) return;

        const defaultConfig = {
          controls: true,
          progress: true,
          center: true,
          hash: false,
          transition: 'slide',
          backgroundTransition: 'fade',
          embedded: true,
          ...config
        };

        revealInstance = new Reveal(deckDivRef.current!, defaultConfig);
        await revealInstance.initialize();
        if (isMounted) setIsLoaded(true);
        deckRef.current = revealInstance;
      } catch (error) {
        setError(`Failed to load presentation: ${error}`);
      }
    };

    loadReveal();

    return () => {
      isMounted = false;
      if (revealInstance) {
        try { revealInstance.destroy(); } catch {}
      }
      deckRef.current = null;
    };
    // Only run on mount/unmount
    // eslint-disable-next-line
  }, []); // <--- empty dependency array

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] relative">
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Presentation Error</h3>
            <p className="text-sm">{error}</p>
            <div className="mt-4 text-xs">
              <p>Slides available: {slides?.length || 0}</p>
              <p>Browser: {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading presentation...</p>
            <p className="text-xs mt-2">{slides?.length || 0} slides to load</p>
          </div>
        </div>
      )}
      <div className="reveal" ref={deckDivRef} style={{ width: '100%', height: '100%' }}>
        <div className="slides">
          {slides?.map((slide, index) => (
            <section 
              key={index}
              dangerouslySetInnerHTML={{ 
                __html: marked.parse(slide.trim()) 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 