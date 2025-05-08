import * as React from "react";
import { ChatArea } from "./chat/ChatArea";
import { Sidebar } from "./sidebar/Sidebar";
import { useRoute, routes, useCurrentConversationId } from "../../routes";
import { Id } from "convex/_generated/dataModel";
import { AgentProfile } from "./agents/AgentProfile";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: string;
  agentName?: string;
}

export const AuthenticatedContent: React.FC = () => {
  const route = useRoute();
  const currentConversationId = useCurrentConversationId();

  // If we're not in a conversation or agent view, show a welcome message
  if (!currentConversationId && route.name !== "agent")
    return (
      <div className="h-screen flex bg-background">
        <div className="w-64 bg-card border-r border-border flex flex-col dark">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Agent Inbox</h1>
            <p className="text-muted-foreground">
              Select a conversation or agent to get started
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <div className="w-64 bg-card border-r border-border flex-shrink-0 dark">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        {route.name === "conversation" ? (
          <ChatArea
            conversationId={route.params.conversationId as Id<"conversations">}
          />
        ) : null}

        {route.name === "agent" ? (
          <AgentProfile agentId={route.params.agentId as Id<"agents">} />
        ) : null}
      </div>
    </div>
  );
};
