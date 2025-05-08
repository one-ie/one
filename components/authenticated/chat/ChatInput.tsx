import * as React from "react";
import { MentionsInput, Mention, SuggestionDataItem } from "react-mentions";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useApiErrorHandler } from "@/components/misc/errors";
import { ReactNode } from "react";
import { useChatContext } from "./ChatContext";

// Define our custom suggestion data type
interface CustomSuggestionData extends SuggestionDataItem {
  type: "agent" | "user";
  avatarUrl?: string;
  display: string;
}

interface ChatInputProps {
  conversationId: Id<"conversations">;
}

export const ChatInput: React.FC<ChatInputProps> = ({ conversationId }) => {
  const [message, setMessage] = React.useState("");
  const agents = useQuery(api.agents.queries.listMine) ?? [];
  const sendMessage = useMutation(
    api.conversationMessages.mutations.sendFromMe,
  );
  const apiError = useApiErrorHandler();
  const {
    replyToMention,
    setReplyToMention,
    shouldFocusInput,
    setShouldFocusInput,
  } = useChatContext();
  const mentionsRef = React.useRef<HTMLDivElement>(null);

  // Apply the reply mention when it changes
  React.useEffect(() => {
    if (replyToMention) {
      setMessage(replyToMention);
      setReplyToMention(null); // Clear after applying
    }
  }, [replyToMention, setReplyToMention]);

  // Handle focus when triggered
  React.useEffect(() => {
    if (shouldFocusInput && mentionsRef.current) {
      // Focus the input element inside the mentions wrapper
      const input =
        mentionsRef.current.querySelector("textarea") ||
        mentionsRef.current.querySelector("input");
      if (input) {
        input.focus();
        setShouldFocusInput(false);
      }
    }
  }, [shouldFocusInput, setShouldFocusInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessage("");

    await sendMessage({
      content: message,
      conversationId: conversationId,
    }).catch(apiError);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestions: CustomSuggestionData[] = [
    ...agents.map((agent) => ({
      id: `agent:${agent._id}`,
      display: agent.name ?? "",
      type: "agent" as const,
      avatarUrl: agent.avatarUrl,
    })),
  ];

  return (
    <div className="p-4 sticky bottom-0 z-10">
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 bg-card shadow-lg p-2 rounded-lg border border-border"
      >
        <div className="flex-1 min-w-0" ref={mentionsRef}>
          <MentionsInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mentions"
            style={{
              control: {
                backgroundColor: "transparent",
                fontSize: 16,
                fontWeight: "normal",
              },
              input: {
                margin: 0,
                padding: "8px 12px",
                overflow: "auto",
                minHeight: "40px",
                maxHeight: "120px",
                border: "none",
                borderRadius: 6,
                backgroundColor: "transparent",
                color: "inherit",
                outline: "none",
              },
              suggestions: {
                list: {
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.375rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  fontSize: "14px",
                  maxHeight: "300px",
                  overflow: "auto",
                  width: "300px",
                  minWidth: "100%",
                  position: "absolute" as const,
                  bottom: "100%",
                  left: 0,
                  right: 0,
                  marginBottom: "0.5rem",
                  zIndex: 1000,
                },
                item: {
                  padding: "8px 12px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  "&focused": {
                    backgroundColor: "var(--accent)",
                  },
                },
              },
            }}
            placeholder="Type a message... Use @ to mention agents or users"
            singleLine={false}
            allowSpaceInQuery={true}
          >
            <Mention
              trigger="@"
              data={suggestions}
              displayTransform={(id, display) => `@${display}`}
              markup="@[__display__](__id__)"
              appendSpaceOnAdd={true}
              style={{
                backgroundColor: "var(--accent)",
                borderRadius: "6px",
              }}
              renderSuggestion={
                ((
                  suggestion: CustomSuggestionData,
                  search: string,
                  highlightedDisplay: ReactNode,
                ) => (
                  <div className="flex items-center gap-2 p-0 hover:bg-accent cursor-pointer">
                    {suggestion.type === "agent" ? (
                      <AgentAvatar
                        size="sm"
                        avatarUrl={suggestion.avatarUrl ?? ""}
                        name={suggestion.display}
                      />
                    ) : (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={suggestion.avatarUrl} />
                        <AvatarFallback>
                          {(suggestion.display?.[0] ?? "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span>{highlightedDisplay}</span>
                  </div>
                )) as any
              }
            />
          </MentionsInput>
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Send
        </button>
      </form>

      <style>
        {`
        .mentions {
          width: 100%;
        }
        .mentions--focused {
          outline: none;
        }
        .mentions__suggestions__list {
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: 6px;
          margin-top: 8px;
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          z-index: 10;
        }
        .mentions__suggestions__item {
          padding: 8px;
          cursor: pointer;
        }
        .mentions__suggestions__item--focused {
          background-color: var(--accent);
        }
        .mentions__highlighter {
          padding: 8px 12px;
          overflow: hidden;
        }
        `}
      </style>
    </div>
  );
};
