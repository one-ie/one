import * as React from "react";
import { Button } from "../../ui/button";
import { Plus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useApiErrorHandler } from "../../misc/errors";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { routes, useCurrentAgentId } from "../../../routes";
import { AgentAvatar } from "@/components/ui/agent-avatar";

type Agent = {
  _id: Id<"agents">;
  name: string;
  description: string;
  status: "idle" | "active" | "processing";
  avatarUrl: string;
};

export const AgentList = () => {
  const agents = useQuery(api.agents.queries.listMine);
  const createAgent = useMutation(api.agents.mutations.create);
  const onApiError = useApiErrorHandler();
  const currentAgentId = useCurrentAgentId();

  return (
    <>
      <div className="p-4">
        <Button
          className="w-full"
          variant="default"
          onClick={() =>
            createAgent()
              .then((agentId) => routes.agent({ agentId }).push())
              .catch(onApiError)
          }
        >
          <Plus className="h-5 w-5" />
          New Agent
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {agents?.map((agent) => (
          <div
            key={agent._id}
            onClick={() => routes.agent({ agentId: agent._id }).push()}
            className={`p-4 cursor-pointer hover:bg-accent flex items-center gap-3 ${
              agent._id === currentAgentId ? "bg-accent" : ""
            }`}
          >
            <AgentAvatar
              size="sm"
              avatarUrl={agent.avatarUrl}
              name={agent.name}
            />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-primary-foreground truncate">
                {agent.name}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {agent.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
