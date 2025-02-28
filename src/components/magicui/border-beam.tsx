"use client";

import React from 'react';
import { cn } from '../../lib/utils';

export interface BorderBeamProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  size?: number;
  borderRadius?: string;
  containerClassName?: string;
  as?: React.ElementType;
}

export function BorderBeam({
  children,
  className,
  duration = 2.5,
  size = 0.25,
  borderRadius = '1rem',
  containerClassName,
  as = 'div',
}: BorderBeamProps) {
  const Comp = as as any;
  
  return (
    <Comp
      className={cn(
        'relative rounded-[--border-radius] p-[1px] overflow-hidden',
        containerClassName
      )}
      style={
        {
          '--border-radius': borderRadius,
          '--duration': `${duration}s`,
          '--border-size': `${size}rem`,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 h-full w-full overflow-hidden rounded-[calc(var(--border-radius)-1px)]"
        style={{
          filter: 'blur(calc(var(--border-size) * 2))',
        }}
      >
        <div
          className="absolute inset-0 h-[100%] w-[100%] animate-[border-beam_var(--duration)_linear_infinite]"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0 220deg, #fff 250deg 290deg, transparent 300deg 360deg)',
          }}
        />
      </div>
      <div
        className={cn(
          'relative z-10 rounded-[calc(var(--border-radius)-var(--border-size))]',
          className
        )}
      >
        {children}
      </div>
    </Comp>
  );
} 