"use client";

import { useEffect, useId, useRef, type HTMLAttributes } from "react";

// Add TagCanvas type declaration
declare global {
  interface Window {
    TagCanvas: {
      Start: (id: string, parentId: string, options: Record<string, unknown>) => void;
      Delete: (id: string) => void;
    };
  }
}

interface CloudProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[];
  canvasProps?: HTMLAttributes<HTMLCanvasElement>;
  options?: Record<string, unknown>;
  dragControl?: boolean;
}

export function Cloud({
  children,
  canvasProps,
  options = {},
  dragControl = false,
  ...props
}: CloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const id = useId();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      window.TagCanvas.Start(canvas.id, `tags-${id}`, {
        dragControl,
        textColour: null,
        dragThreshold: 4,
        initial: [0.1, -0.1],
        maxSpeed: 0.04,
        minSpeed: 0.02,
        decel: 0.95,
        reverse: true,
        ...options,
      });
    } catch (error) {
      console.error("Error initializing TagCanvas:", error);
    }

    return () => {
      try {
        window.TagCanvas.Delete(canvas.id);
      } catch (error) {
        console.error("Error cleaning up TagCanvas:", error);
      }
    };
  }, [dragControl, id, options]);

  return (
    <div {...props}>
      <canvas
        id={`canvas-${id}`}
        ref={canvasRef}
        width={600}
        height={600}
        {...canvasProps}
      />
      <div id={`tags-${id}`} className="hidden">
        {children}
      </div>
    </div>
  );
} 