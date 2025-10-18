import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Code2,
  Folders,
  Wind,
  MessageSquare,
  Check,
  Copy,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StudioId = "claude" | "codex" | "cursor" | "windsurf" | "chatgpt";

type Studio = {
  id: StudioId;
  name: string;
  tagline: string;
  accent: string;
  icon: LucideIcon;
  instructions: string;
  cta: string;
  link?: string;
};

const DEFAULT_SNIPPET = `FEATURE: Generate welcome kit

GET latest onboarding tasks
CREATE email with onboarding checklist
ATTACH starter resources
SEND to new member
RECORD onboarding email sent`;

const STUDIOS: Studio[] = [
  {
    id: "claude",
    name: "Claude Code",
    tagline: "Anthropic’s coding studio tuned for ontology-first workflows.",
    accent: "from-amber-500/80 via-orange-500/60 to-yellow-400/40",
    icon: Sparkles,
    instructions:
      "Use `/send` in Claude Code and paste the snippet below to brief the assistant.",
    cta: "Send to Claude Code",
    link: "https://claude.ai/new",
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    tagline: "Classic Codex prompt suited for API-first transformations.",
    accent: "from-sky-500/80 via-blue-500/60 to-indigo-500/40",
    icon: Code2,
    instructions:
      "Wrap the snippet with `'''typescript` fences and provide expected outputs.",
    cta: "Share with Codex",
    link: "https://platform.openai.com/playground",
  },
  {
    id: "cursor",
    name: "Cursor",
    tagline: "Cursor’s editor takes this as a recipe for paired iteration.",
    accent: "from-emerald-500/80 via-teal-500/60 to-cyan-400/40",
    icon: Folders,
    instructions:
      "Open the Command Palette → `Insert Snippet` and paste the payload.",
    cta: "Insert into Cursor",
    link: "https://www.cursor.com/",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    tagline: "Guide Windsurf agents with structured English instructions.",
    accent: "from-violet-500/80 via-purple-500/60 to-fuchsia-500/40",
    icon: Wind,
    instructions:
      "Use `Command + Shift + L` to open the Launchpad and drop this brief.",
    cta: "Launch in Windsurf",
    link: "https://windsurf.ai/",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    tagline: "Great for brainstorming variations or fast documentation drafts.",
    accent: "from-rose-500/80 via-pink-500/60 to-orange-400/40",
    icon: MessageSquare,
    instructions:
      "Start with “You are an ontology-aligned engineer” before the snippet.",
    cta: "Open with ChatGPT",
    link: "https://chat.openai.com/",
  },
];

interface SendToStudiosProps {
  snippet?: string;
  className?: string;
}

export function SendToStudios({ snippet = DEFAULT_SNIPPET, className }: SendToStudiosProps) {
  const [active, setActive] = useState<StudioId | null>(null);
  const [feedback, setFeedback] = useState<Studio | null>(null);

  const handleSend = async (studio: Studio) => {
    const payload = [
      `### ${studio.name}`,
      studio.instructions,
      "",
      snippet.trim(),
    ].join("\n");

    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        return;
      }
      setActive(studio.id);
      await navigator.clipboard.writeText(payload);
      setTimeout(() => setActive((current) => (current === studio.id ? null : current)), 2000);
      setFeedback(studio);
      if (studio.link && typeof window !== "undefined") {
        window.open(studio.link, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Unable to copy snippet for studio:", studio.id, error);
      setActive(null);
    }
  };

  const copyRawSnippet = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        return;
      }
      await navigator.clipboard.writeText(snippet.trim());
      setActive("chatgpt");
      setTimeout(() => setActive((current) => (current === "chatgpt" ? null : current)), 2000);
    } catch (error) {
      console.error("Unable to copy raw snippet", error);
    }
  };

  return (
    <Card className={cn("relative overflow-hidden border-border/60 bg-card/70 backdrop-blur", className)}>
      <div className="absolute inset-x-12 top-12 h-64 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl" />
      <CardHeader className="relative z-10 space-y-6">
        <div className="flex flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div className="space-y-4">
            <Badge variant="outline" className="inline-flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send to any agent studio
            </Badge>
            <CardTitle className="text-3xl md:text-4xl lg:text-5xl">
              Ship this brief to Claude, Codex, Cursor, Windsurf, or ChatGPT
            </CardTitle>
            <CardDescription className="text-base leading-relaxed text-muted-foreground">
              Copy the structured instructions with one click. Each button adds
              tool-specific guidance so your favorite AI environment knows how
              to help immediately.
            </CardDescription>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-6 py-4 text-sm text-primary-foreground shadow-lg shadow-primary/20 lg:w-80">
            <p className="font-semibold text-primary">Preview Snippet</p>
            <p className="mt-2 text-xs text-primary-foreground/80">
              This is the English-first feature request we will share with the tooling
              of your choice. Customize it, then press a button to copy a tailored brief.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col gap-8 lg:flex-row">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-xl shadow-primary/5 lg:w-[420px]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Feature Brief
            </p>
            <Badge variant="secondary" className="text-xs">
              English → Ontology → Code
            </Badge>
          </div>
          <pre className="relative max-h-72 overflow-y-auto rounded-xl bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
            <code>{snippet}</code>
          </pre>
          <Button
            variant="ghost"
            className="mt-4 w-full justify-center gap-2"
            onClick={copyRawSnippet}
          >
            {active === "chatgpt" ? (
              <>
                <Check className="h-4 w-4" />
                Snippet copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy raw snippet
              </>
            )}
          </Button>
        </div>

        <div className="grid flex-1 gap-5 sm:grid-cols-2">
          {STUDIOS.map((studio) => {
            const Icon = studio.icon;
            const isActive = active === studio.id;
            return (
              <div
                key={studio.id}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/70 p-6 shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-80",
                    "bg-gradient-to-br",
                    studio.accent
                  )}
                />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/90 shadow">
                      <Icon className="h-5 w-5 text-foreground" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-foreground/80">
                        {studio.name}
                      </p>
                      <p className="text-xs text-foreground/70">{studio.tagline}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">
                    {studio.instructions}
                  </p>
                  <Button
                    className="w-full justify-center gap-2"
                    variant="secondary"
                    onClick={() => handleSend(studio)}
                  >
                    {isActive ? (
                      <>
                        <Check className="h-4 w-4" />
                        Sent! Opening…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {studio.cta}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      {feedback ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="max-w-lg w-full rounded-2xl border border-border/60 bg-card/90 p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Prompt copied
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">
                  {feedback.name} is ready
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFeedback(null)}>
                Close
              </Button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The tailored brief is on your clipboard. Paste it into {feedback.name} and follow the
              guidance below to kick off the session.
            </p>
            <div className="mt-6 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
              {feedback.instructions}
            </div>
            {feedback.link ? (
              <div className="mt-6">
                <a
                  href={feedback.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Continue in {feedback.name}
                  <Send className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export default SendToStudios;
