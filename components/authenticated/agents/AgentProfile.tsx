import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useApiErrorHandler } from "@/components/misc/errors";
import { routes } from "@/routes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Confirm } from "@/components/ui/confirm";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { AgentDescription } from "./AgentDescription";
import { AgentPersonality } from "./AgentPersonality";
import { AgentTools } from "./AgentTools";
import { Loader2, Shuffle, Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AgentToolName } from "../../../../shared/tools";

export const AgentProfile = ({ agentId }: { agentId: Id<"agents"> }) => {
  const agent = useQuery(api.agents.queries.findMine, { agentId });
  const deleteAgent = useMutation(api.agents.mutations.removeMine);
  const shuffleAvatar = useMutation(api.agents.mutations.shuffleAvatar);
  const updateAgent = useMutation(api.agents.mutations.updateMine);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const [isShufflingAvatar, setIsShufflingAvatar] = React.useState(false);
  const onApiError = useApiErrorHandler();

  React.useEffect(() => {
    if (agent?.name) setEditedName(agent.name);
  }, [agent?.name]);

  const handleNameSubmit = async () => {
    if (!editedName.trim() || editedName === agent?.name) {
      setIsEditingName(false);
      return;
    }

    if (!agent) return;

    await updateAgent({
      agentId,
      name: editedName,
      description: agent.description,
      personality: agent.personality,
      tools: agent.tools,
    })
      .catch(onApiError)
      .finally(() => setIsEditingName(false));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      setEditedName(agent?.name ?? "");
    }
  };

  if (!agent)
    return (
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-48 w-48 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="relative inline-block">
            <AgentAvatar
              avatarUrl={agent.avatarUrl}
              name={agent.name}
              size="lg"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-6 -right-2"
              disabled={isShufflingAvatar}
              onClick={async () => {
                setIsShufflingAvatar(true);
                await shuffleAvatar({
                  agentId,
                })
                  .catch(onApiError)
                  .finally(() => setIsShufflingAvatar(false));
              }}
            >
              {isShufflingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shuffle className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-2xl font-bold text-center w-64"
                  autoFocus
                />
                <Button variant="ghost" size="icon" onClick={handleNameSubmit}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold">{agent.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingName(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <AgentDescription
          agentId={agent._id}
          name={agent.name}
          description={agent.description}
          personality={agent.personality}
          tools={agent.tools}
        />
        <div className="grid grid-cols-2 gap-6">
          <AgentPersonality
            agentId={agent._id}
            name={agent.name}
            description={agent.description}
            personality={agent.personality}
            tools={agent.tools}
          />
          <AgentTools
            agentId={agent._id}
            name={agent.name}
            description={agent.description}
            personality={agent.personality}
            tools={agent.tools as AgentToolName[]}
          />
        </div>
        <div className="text-sm text-muted-foreground text-center">
          Last active: {new Date(agent.lastActiveTime).toLocaleString()}
        </div>
        <div className="flex justify-center">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Agent
          </Button>
        </div>

        <Confirm
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Agent"
          description={`Are you sure you want to delete ${agent.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() =>
            deleteAgent({ agentId: agent._id })
              .then(() => routes.home().push())
              .catch(onApiError)
          }
          variant="destructive"
        />
      </div>
    </div>
  );
};
