import * as React from "react";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { routes } from "@/routes";
import { BaseMention } from "./BaseMention";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AgentMentionProps {
  display: string;
  agentId: Id<"agents">;
  isInUserMessage?: boolean;
}

export const AgentMention: React.FC<AgentMentionProps> = ({
  display,
  agentId,
  isInUserMessage,
}) => {
  const agent = useQuery(api.agents.queries.findMention, { agentId });
  if (!agent) return null;

  const handleClick = () => {
    routes.agent({ agentId }).push();
  };

  return (
    <BaseMention
      display={agent?.name ?? display}
      isInUserMessage={isInUserMessage}
      onClick={agent?._id ? handleClick : undefined}
      avatar={
        agent ? (
          <AgentAvatar
            size="xs"
            avatarUrl={agent.avatarUrl}
            name={agent.name ?? display}
            className="translate-y-[1px]"
          />
        ) : (
          <Avatar className="h-4 w-4 translate-y-[1px]">
            <AvatarFallback className="bg-muted">
              <Bot className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
        )
      }
    />
  );
};
