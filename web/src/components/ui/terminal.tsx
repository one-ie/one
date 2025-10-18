'use client';

import * as React from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

type AnimatedSpanProps = React.ComponentProps<typeof motion.div> & {
  delay?: number;
};

export const AnimatedSpan: React.FC<AnimatedSpanProps> = ({
  children,
  delay = 0,
  className,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className={cn('block text-left text-sm font-normal tracking-tight', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

type TypingAnimationProps = React.ComponentProps<typeof motion.span> & {
  children: string;
  duration?: number;
  delay?: number;
};

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  children,
  className,
  duration = 60,
  delay = 0,
  ...props
}) => {
  if (typeof children !== 'string') {
    throw new Error('TypingAnimation: children must be a string.');
  }

  const [displayedText, setDisplayedText] = React.useState('');
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setStarted(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  React.useEffect(() => {
    if (!started) {
      setDisplayedText('');
      return;
    }

    let i = 0;
    const typingEffect = window.setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1));
        i += 1;
      } else {
        window.clearInterval(typingEffect);
      }
    }, duration);

    return () => window.clearInterval(typingEffect);
  }, [children, duration, started]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      transition={{ duration: 0.2, delay: delay / 1000 }}
      className={cn('text-left text-sm font-normal tracking-tight', className)}
      {...props}
    >
      {displayedText}
    </motion.span>
  );
};

type TerminalProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export const Terminal: React.FC<TerminalProps> = ({
  children,
  className,
  ...props
}) => {
  const preRef = React.useRef<globalThis.HTMLPreElement | null>(null);

  React.useEffect(() => {
    const node = preRef.current;
    const Observer = globalThis.MutationObserver;
    if (!node || !Observer) {
      return;
    }

    const observer = new Observer(() => {
      const { scrollHeight, clientHeight, scrollTop } = node;
      const hasOverflow = scrollHeight > clientHeight + 1;
      if (!hasOverflow) {
        return;
      }

      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      const shouldFollow = distanceFromBottom <= 24;
      if (shouldFollow) {
        node.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      }
    });

    observer.observe(node, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        'relative z-0 flex h-[420px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[hsl(var(--sidebar))] text-slate-100 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.75)] backdrop-blur',
        className
      )}
      {...props}
    >
      <div className="relative border-b border-white/10 bg-white/5 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febb2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            ONE CLI
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" />
      <pre ref={preRef} className="relative flex-1 overflow-auto px-6 py-6">
        <code className="flex flex-col gap-3 text-[13px] leading-relaxed text-slate-200">
          {children}
        </code>
      </pre>
    </div>
  );
};
