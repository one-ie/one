import * as React from "react";
import { ConversationList } from "./ConversationList";
import { AgentList } from "./AgentList";
import { Button } from "../../ui/button";
import { UserProfile } from "@/components/authenticated/conversations/UserProfile";

type Tab = "conversations" | "agents";

export const Sidebar = () => {
  const [activeTab, setActiveTab] = React.useState<Tab>("conversations");

  return (
    <div className="flex flex-col h-full border-r">
      <div className="h-16 border-b border-border flex items-center px-4">
        <img
          src="/logo.svg"
          alt="ONE"
          className="h-[40px] w-auto object-contain"
        />
      </div>
      <div className="flex border-b">
        <Button
          variant={activeTab === "conversations" ? "default" : "ghost"}
          className="flex-1 rounded-none text-primary-foreground"
          onClick={() => setActiveTab("conversations")}
        >
          Conversations
        </Button>
        <Button
          variant={activeTab === "agents" ? "default" : "ghost"}
          className="flex-1 rounded-none text-primary-foreground"
          onClick={() => setActiveTab("agents")}
        >
          Agents
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {activeTab === "conversations" ? <ConversationList /> : <AgentList />}
        </div>
      </div>
      <UserProfile />
    </div>
  );
};
