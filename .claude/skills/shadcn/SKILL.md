---
name: shadcn
description: Use shadcn/ui components for the Envelope System UI - Cards, Tabs, Badges, and dark theme patterns
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# shadcn/ui Development

Build consistent UI with shadcn/ui components, customized for the Envelope System's dark theme.

## Works With

| Skill      | Load when                                                                    |
|------------|------------------------------------------------------------------------------|
| `/react19` | shadcn components ARE React components — ref-as-prop, Actions, transitions apply. |
| `/astro`   | Placement inside islands + hydration strategy decisions.                       |
| `/signal`  | Buttons, menus, dialogs — every semantic click emits `ui:<surface>:<action>`. |
| `/ai-ui`   | AI Elements (reasoning cards, tool-call blocks) compose shadcn primitives.    |

Auto-loads on `*.tsx`: `rules/react.md` + `rules/ui.md` (per `.claude/settings.json`).

## When to Use This Skill

- Use existing shadcn components from `src/components/ui/`
- Customize component variants
- Add new shadcn components
- Apply the dark theme color system
- Build composite components

## Available Components

The project includes these shadcn/ui components in `src/components/ui/`:

| Component | Import | Use Case |
|-----------|--------|----------|
| `Card` | `@/components/ui/card` | Envelopes, agents, panels |
| `Tabs` | `@/components/ui/tabs` | Agent tabs in top panel |
| `Badge` | `@/components/ui/badge` | Status indicators |
| `Button` | `@/components/ui/button` | Actions, submissions |
| `ScrollArea` | `@/components/ui/scroll-area` | Scrollable lists |
| `Separator` | `@/components/ui/separator` | Visual dividers |
| `Tooltip` | `@/components/ui/tooltip` | Hover information |
| `Dialog` | `@/components/ui/dialog` | Modals |
| `Accordion` | `@/components/ui/accordion` | Collapsible sections |

## Color System (Dark Theme)

```css
/* Primary colors */
--background: #0a0a0f;        /* Near-black */
--foreground: #ffffff;        /* White text */

/* Status colors */
--status-ready: #22c55e;      /* Green - ready/resolved */
--status-pending: #eab308;    /* Amber - pending/waiting */
--status-idle: #64748b;       /* Slate - idle */
--status-error: #ef4444;      /* Red - error/rejected */

/* Borders and accents */
--border: #1e293b;            /* Subtle borders */
--accent: #3b82f6;            /* Blue accent */
```

## Core Components

### Card (Envelopes, Agents)

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EnvelopeCard({ envelope }: { envelope: Envelope }) {
  return (
    <Card className="bg-[#0f0f14] border-[#1e293b]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-mono">
          <span className="text-slate-400">envelope</span>
          <span className="text-blue-400">{envelope.id}</span>
        </CardTitle>
        <CardDescription>
          {envelope.env.action} → {envelope.metadata?.receiver}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="font-mono text-xs">
          <span className="text-slate-500">action: </span>
          <span className="text-green-400">{envelope.env.action}</span>
        </div>
        <div className="font-mono text-xs">
          <span className="text-slate-500">inputs: </span>
          <span className="text-amber-400">
            {JSON.stringify(envelope.env.inputs)}
          </span>
        </div>
        <div className="font-mono text-xs">
          <span className="text-slate-500">status: </span>
          <StatusBadge status={envelope.payload.status} />
        </div>
      </CardContent>
    </Card>
  );
}
```

### Tabs (Agent Selection)

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AgentTabs({ agents }: { agents: Agent[] }) {
  return (
    <Tabs defaultValue={agents[0]?.id} className="w-full">
      <TabsList className="bg-[#0f0f14] border border-[#1e293b]">
        {agents.map(agent => (
          <TabsTrigger
            key={agent.id}
            value={agent.id}
            className="data-[state=active]:bg-[#1e293b] data-[state=active]:text-white"
          >
            <StatusDot status={agent.status} />
            <span className="ml-2">{agent.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {agents.map(agent => (
        <TabsContent key={agent.id} value={agent.id} className="mt-4">
          <AgentContent agent={agent} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

### Badge (Status Indicators)

```tsx
import { Badge } from "@/components/ui/badge";

const statusColors = {
  ready: "bg-green-500/20 text-green-400 border-green-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  waiting: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  idle: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={statusColors[status as keyof typeof statusColors] || statusColors.idle}
    >
      {status}
    </Badge>
  );
}
```

### Button Variants

```tsx
import { Button } from "@/components/ui/button";

// Primary action
<Button className="bg-blue-600 hover:bg-blue-700">
  Send Envelope
</Button>

// Secondary action
<Button variant="outline" className="border-[#1e293b] hover:bg-[#1e293b]">
  Cancel
</Button>

// Destructive
<Button variant="destructive">
  Reject
</Button>

// Ghost (icon buttons)
<Button variant="ghost" size="icon">
  <ChevronRight className="h-4 w-4" />
</Button>
```

### ScrollArea (Lists)

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

export function EnvelopeList({ envelopes }: { envelopes: Envelope[] }) {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {envelopes.map(env => (
          <EnvelopeCard key={env.id} envelope={env} />
        ))}
      </div>
    </ScrollArea>
  );
}
```

### Tooltip (Hover Info)

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function EnvelopeId({ id, full }: { id: string; full: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="font-mono text-blue-400 cursor-help">
          {id}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-xs">{full}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

### Accordion (Collapsible Logic)

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function LogicViewer({ code }: { code: string }) {
  return (
    <Accordion type="single" collapsible defaultValue="logic">
      <AccordionItem value="logic" className="border-[#1e293b]">
        <AccordionTrigger className="text-sm">
          Agent Logic
        </AccordionTrigger>
        <AccordionContent>
          <pre className="p-4 bg-[#0a0a0f] rounded font-mono text-xs overflow-x-auto">
            <code className="text-slate-300">{code}</code>
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Composite Components

### Status Dot

```tsx
const dotColors = {
  ready: "bg-green-500",
  resolved: "bg-green-500",
  pending: "bg-amber-500 animate-pulse",
  waiting: "bg-amber-500 animate-pulse",
  idle: "bg-slate-500",
  error: "bg-red-500",
  rejected: "bg-red-500",
};

export function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        dotColors[status as keyof typeof dotColors] || dotColors.idle
      }`}
    />
  );
}
```

### Panel Header

```tsx
export function PanelHeader({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        {count !== undefined && (
          <Badge variant="secondary" className="bg-[#1e293b]">
            {count}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}
```

### Code Block

```tsx
export function CodeBlock({
  code,
  language = "typescript",
}: {
  code: string;
  language?: string;
}) {
  return (
    <Card className="bg-[#0a0a0f] border-[#1e293b]">
      <CardContent className="p-0">
        <pre className="p-4 overflow-x-auto">
          <code className="font-mono text-xs text-slate-300 whitespace-pre">
            {code}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
}
```

## Adding New Components

To add a new shadcn component:

```bash
# From project root
bunx shadcn@latest add [component-name]

# Examples
bunx shadcn@latest add sheet
bunx shadcn@latest add command
bunx shadcn@latest add popover
```

## Customization Patterns

### Extending Button

```tsx
// src/components/ui/button.tsx - add variant
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        // ... existing variants
        envelope: "bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30",
      },
    },
  }
);
```

### Custom Card Variant

```tsx
export function EnvelopeCardVariant({
  children,
  isNested,
}: {
  children: React.ReactNode;
  isNested?: boolean;
}) {
  return (
    <Card
      className={cn(
        "bg-[#0f0f14] border-[#1e293b]",
        isNested && "ml-4 border-l-2 border-l-blue-500/30"
      )}
    >
      {children}
    </Card>
  );
}
```

## Layout Patterns

### Two-Panel Layout

```tsx
export function WorkspaceLayout() {
  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      {/* Top Panel - Agent Tabs */}
      <div className="flex-none h-[40%] border-b border-[#1e293b] p-4">
        <AgentTabs />
      </div>

      {/* Bottom Panel - Envelopes & Logic */}
      <div className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full">
          <EnvelopeList />
        </ScrollArea>
      </div>
    </div>
  );
}
```

### Grid Layout

```tsx
export function AgentGrid({ agents }: { agents: Agent[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
```

## Utils

The project uses `cn()` utility for class merging:

```tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

## Best Practices

1. **Use semantic colors**: Status colors for state, not random colors
2. **Consistent spacing**: Use Tailwind's spacing scale (4, 8, 12, 16...)
3. **Dark-first**: Design for dark theme, colors should work on `#0a0a0f`
4. **Monospace for data**: Use `font-mono` for IDs, JSON, code
5. **Subtle borders**: Use `border-[#1e293b]` for separation
6. **Animate pending**: Use `animate-pulse` for pending states

---

**Version**: 1.0.0
**Tech**: shadcn/ui, Tailwind CSS 4, Radix UI
