import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus } from "lucide-react";

interface AgentSelectorProps {
  conversation: Doc<"conversations">;
  trigger?: React.ReactNode;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  conversation,
  trigger,
}) => {
  const agents = useQuery(api.agents.queries.listMine);
  const addAgent = useMutation(api.conversationParticipants.mutations.addAgent);
  const participants = useQuery(
    api.conversationParticipants.queries.listDetailsForMe,
    {
      conversationId: conversation._id,
    },
  );

  // Filter out agents that are already in the conversation
  const availableAgents = agents?.filter(
    (agent) =>
      !participants?.some((p) => p.kind === "agent" && p.name === agent.name),
  );

  const handleAddAgent = async (agentId: Id<"agents">) => {
    await addAgent({
      conversationId: conversation._id,
      agentId,
    });
  };

  if (!availableAgents?.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button className="w-full" variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Agent
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        {availableAgents.map((agent) => (
          <DropdownMenuItem
            key={agent._id}
            onClick={() => handleAddAgent(agent._id)}
            className="flex items-center gap-2 p-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={agent.avatarUrl} />
              <AvatarFallback>{agent.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="text-sm font-medium">{agent.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {agent.description}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
