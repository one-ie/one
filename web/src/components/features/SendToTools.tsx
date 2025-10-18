import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Code2,
  Folders,
  SquareCode,
  Wind,
  MessageSquare,
  ClipboardCopy,
  Check,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_SNIPPET = `FEATURE: Generate welcome kit

GET latest onboarding tasks
CREATE email with onboarding checklist
ATTACH starter resources
SEND to new member
RECORD onboarding email sent`;

type ToolId = "claude" | "codex" | "cursor" | "v0" | "windsurf" | "chatgpt";

type Tool = {
  id: ToolId;
  label: string;
  display: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  instructions: ReactNode;
  link: string;
  tone: string;
};

const TOOLS: Tool[] = [
  {
    id: "claude",
    label: "Claude Code",
    display: "Claude Code",
    icon: Sparkles,
    link: "https://claude.ai/new",
    tone: "from-amber-400/30 via-orange-500/20 to-yellow-400/10",
    instructions: (
      <ol className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li>1. Open Claude Code or Claude Desktop and create a new tab.</li>
        <li>2. Paste the copied brief into the chat composer.</li>
        <li>3. Add any repository notes, then press Cmd/Ctrl + Enter to start.</li>
      </ol>
    ),
  },
  {
    id: "codex",
    label: "OpenAI Playground",
    display: "Codex",
    icon: Code2,
    link: "https://platform.openai.com/playground",
    tone: "from-sky-500/30 via-blue-500/20 to-indigo-500/10",
    instructions: (
      <ol className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li>1. Open the OpenAI Playground and choose the latest GPT-4o or GPT-4 model.</li>
        <li>2. Paste the prompt into the input area with ``` fences if desired.</li>
        <li>3. Press Submit or hit Cmd/Ctrl + Enter to generate the response.</li>
      </ol>
    ),
  },
  {
    id: "cursor",
    label: "Cursor",
    display: "Cursor",
    icon: Folders,
    link: "https://www.cursor.com/",
    tone: "from-emerald-500/30 via-teal-500/20 to-cyan-400/10",
    instructions: (
      <ol className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li>1. In Cursor, press Cmd/Ctrl + I to open the Command palette.</li>
        <li>2. Choose “Chat” or “New Task” and paste the copied brief.</li>
        <li>3. Confirm the files to change and let Cursor iterate with you.</li>
      </ol>
    ),
  },
  {
    id: "v0",
    label: "v0 by Vercel",
    display: "v0",
    icon: SquareCode,
    link: "https://v0.dev/",
    tone: "from-purple-500/30 via-violet-500/20 to-fuchsia-500/10",
    instructions: (
      <ol className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li>1. Visit v0.dev and start a new canvas or chat.</li>
        <li>2. Paste the brief as the initial instruction.</li>
        <li>3. Iterate on the generated UI or export to continue in code.</li>
      </ol>
    ),
  },
  {
    id: "windsurf",
    label: "Windsurf",
    display: "Windsurf",
    icon: Wind,
    link: "https://windsurf.ai/",
    tone: "from-cyan-400/30 via-blue-400/20 to-slate-400/10",
    instructions: (
      <ol className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li>1. Launch Windsurf and open the Command Center (Cmd/Ctrl + Shift + L).</li>
        <li>2. Paste the brief into the “New Objective” field.</li>
        <li>3. Select the files or services to modify and kick off the run.</li>
      </ol>
    ),
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    display: "ChatGPT",
    icon: MessageSquare,
    link: "https://chat.openai.com/",
    tone: "from-rose-500/30 via-pink-500/20 to-orange-400/10",
    instructions: (
      <ol className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li>1. Open ChatGPT and start a new conversation.</li>
        <li>2. Paste the prompt, optionally prefixing with “You are an ontology-aligned engineer.”</li>
        <li>3. Ask for code, docs, or design support and refine iteratively.</li>
      </ol>
    ),
  },
];

interface SendToToolsProps {
  snippet?: string;
  className?: string;
}

export function SendToTools({ snippet = DEFAULT_SNIPPET, className }: SendToToolsProps) {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [copiedState, setCopiedState] = useState<"snippet" | "brief" | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveTool(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const copy = async (text: string, key: "snippet" | "brief") => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) return;
      await navigator.clipboard.writeText(text);
      setCopiedState(key);
      setTimeout(() => setCopiedState((current) => (current === key ? null : current)), 2000);
    } catch (error) {
      console.error("Unable to copy text to clipboard", error);
    }
  };

  const handleOpenTool = async (tool: Tool) => {
    const brief = [`### ${tool.label}`, " ", snippet.trim()].join("\n");
    await copy(brief, "brief");
    setActiveTool(tool);
  };

  const handleOpenLink = (tool: Tool) => {
    if (typeof window === "undefined") return;
    window.open(tool.link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool?.id === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleOpenTool(tool)}
              className={cn(
                "group relative flex w-28 flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card/70 p-4 text-center transition",
                "hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg",
                isActive && "border-primary/50 shadow-lg shadow-primary/10"
              )}
            >
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br",
                  tool.tone,
                  "shadow-sm"
                )}
              >
                <Icon className="h-6 w-6 text-foreground" />
              </span>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {tool.display}
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/30" />
            </button>
          );
        })}
      </div>
      <Badge variant="outline" className="text-xs uppercase">
        Click a tool to copy the brief and view instructions
      </Badge>

      {activeTool ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border/60 bg-card/95 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border/60 p-6">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                  Prompt copied
                </Badge>
                <h3 className="text-2xl font-semibold text-foreground">{activeTool.label}</h3>
                <p className="text-sm text-muted-foreground">
                  Paste the brief into {activeTool.label} and follow these steps to get started.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActiveTool(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                {activeTool.instructions}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Feature brief</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      copy(
                        [`### ${activeTool.label}`, " ", snippet.trim()].join("\n"),
                        "brief"
                      )
                    }
                  >
                    {copiedState === "brief" ? (
                      <>
                        <Check className="h-4 w-4 text-primary" />
                        Copied
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-4 w-4" />
                        Copy brief
                      </>
                    )}
                  </Button>
                </div>
                <pre className="max-h-56 overflow-y-auto rounded-xl border border-border/40 bg-background/80 p-4 text-xs leading-relaxed text-muted-foreground">
                  <code>{snippet}</code>
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
              <Button variant="secondary" className="gap-2" onClick={() => handleOpenLink(activeTool)}>
                <Send className="h-4 w-4" />
                Open {activeTool.display}
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] uppercase">
                  English → Ontology → Code
                </Badge>
                {copiedState === "brief" ? (
                  <span className="flex items-center gap-1 text-primary">
                    <Check className="h-3.5 w-3.5" />
                    Brief on clipboard
                  </span>
                ) : (
                  <span>Brief copied automatically</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SendToTools;
