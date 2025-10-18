'use client';

import { Terminal, AnimatedSpan, TypingAnimation } from '@/components/ui/terminal';

const logo = `     \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
    \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d
    \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2588\u2588\u2557 \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  
    \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551\u255a\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255d  
    \u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2551 \u255a\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
     \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u255d  \u255a\u2550\u2550\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d

       Make Your Ideas Real
          https://one.ie`;

export default function CliTerminal() {
  return (
    <Terminal className="mx-auto h-[460px] max-w-3xl font-mono rounded-[32px] border border-white/15 shadow-[0_48px_140px_-60px_rgba(15,23,42,0.85)] sm:h-[520px] sm:max-w-4xl">
      <TypingAnimation delay={0} duration={60} className="text-slate-200">
        $ npx oneie
      </TypingAnimation>

      <AnimatedSpan
        delay={900}
        className="font-mono text-[11px] leading-[1.15] text-slate-300 whitespace-pre"
      >
        {logo}
      </AnimatedSpan>

      <TypingAnimation delay={1600} duration={70} className="text-slate-300">
        Let's get the ONE Ontology working for you.
      </TypingAnimation>

      <AnimatedSpan delay={5000} className="mt-3 text-cyan-300 font-medium uppercase tracking-[0.2em]">
        STEP 1 - PROFILE
      </AnimatedSpan>
      <AnimatedSpan delay={5360} className="text-slate-300">
        What's your full name?
      </AnimatedSpan>
      <TypingAnimation delay={5470} duration={70} className="text-emerald-300">
        tony o connell
      </TypingAnimation>
      <AnimatedSpan delay={6560} className="text-slate-300">
        What's your email address?
      </AnimatedSpan>
      <TypingAnimation delay={6680} duration={70} className="text-emerald-300">
        tony@one.ie
      </TypingAnimation>

      <AnimatedSpan delay={8600} className="mt-3 text-cyan-300 font-medium uppercase tracking-[0.2em]">
        STEP 2 - ORGANIZATION
      </AnimatedSpan>
      <AnimatedSpan delay={9000} className="text-slate-300">
        Organization name?
      </AnimatedSpan>
      <TypingAnimation delay={9600} duration={70} className="text-emerald-300">
        ONE
      </TypingAnimation>
      <AnimatedSpan delay={10000} className="text-slate-300">
        Organization website?
      </AnimatedSpan>
      <TypingAnimation delay={10600} duration={70} className="text-emerald-300">
        https://one.ie
      </TypingAnimation>

      <AnimatedSpan delay={12000} className="mt-3 text-cyan-300 font-medium uppercase tracking-[0.2em]">
        STEP 3 - ONTOLOGY SYNC
      </AnimatedSpan>
      <AnimatedSpan delay={12400} className="text-slate-300">
        Copying ontology files from /one/*
      </AnimatedSpan>
      <AnimatedSpan delay={13200} className="text-slate-300">
        Installing Claude agents and commands
      </AnimatedSpan>
      <AnimatedSpan delay={14000} className="text-emerald-300">
        Ontology sync complete - ready to build.
      </AnimatedSpan>
    </Terminal>
  );
}
