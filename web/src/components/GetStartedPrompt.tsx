/**
 * GetStartedPrompt Component
 *
 * Simple, beautiful prompt interface for non-ONE organizations
 * Displays on homepage when ORG_NAME !== "one"
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface GetStartedPromptProps {
  orgName: string;
}

export function GetStartedPrompt({ orgName }: GetStartedPromptProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    // TODO: Implement AI prompt handling
    console.log("User prompt:", prompt);
    alert(
      `Great! Let's build: "${prompt}"\n\nThis feature will be implemented with AI assistance.`
    );
  };

  const quickStarts = [
    { emoji: "🛍️", label: "Ecommerce Store", prompt: "Create an ecommerce store" },
    { emoji: "📝", label: "Blog Platform", prompt: "Create a blog platform" },
    { emoji: "👥", label: "Community Site", prompt: "Create a community site" },
    { emoji: "📊", label: "Dashboard App", prompt: "Create a dashboard app" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold gradient-text">
            Welcome to {orgName}
          </h1>

          <p className="text-xl text-muted-foreground">
            What would you like to build?
          </p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Create an ecommerce store..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && prompt.trim()) {
                  handleSubmit();
                }
              }}
              className="text-lg p-6"
            />
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              size="lg"
              className="px-8"
            >
              Build
            </Button>
          </div>

          {/* Quick Start Options */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {quickStarts.map((option) => (
              <button
                key={option.label}
                onClick={() => setPrompt(option.prompt)}
                className="p-4 border rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Powered by ONE Platform</p>
          <p>Frontend-only mode • No backend required</p>
          <p className="text-xs">
            Enable backend features in .env.local: ONE_BACKEND=on
          </p>
        </div>
      </div>
    </div>
  );
}
