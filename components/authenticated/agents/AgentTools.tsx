import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, X, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserChoosableToolName,
  userChoosableToolDefinitions,
  toolDefinitions,
  AgentToolName,
} from "../../../../shared/tools";

interface AgentToolsProps {
  agentId: Id<"agents">;
  name: string;
  description: string;
  personality: string;
  tools: AgentToolName[];
}

export const AgentTools: React.FC<AgentToolsProps> = ({
  agentId,
  name,
  description,
  personality,
  tools,
}) => {
  const updateAgent = useMutation(api.agents.mutations.updateMine);
  const [isEditing, setIsEditing] = React.useState(false);

  const handleRemoveTool = async (toolToRemove: AgentToolName) => {
    await updateAgent({
      agentId,
      name,
      description,
      personality,
      tools: tools.filter((tool) => tool !== toolToRemove),
    });
  };

  const handleAddTool = async (toolToAdd: UserChoosableToolName) => {
    if (tools.includes(toolToAdd)) return;
    await updateAgent({
      agentId,
      name,
      description,
      personality,
      tools: [...tools, toolToAdd],
    });
  };

  // Get available tools that aren't already added
  const availableTools: Array<
    [UserChoosableToolName, (typeof toolDefinitions)[UserChoosableToolName]]
  > = [];

  // Only include tools from userChoosableToolDefinitions
  Object.keys(userChoosableToolDefinitions).forEach((key) => {
    const toolKey = key as UserChoosableToolName;
    if (!tools.includes(toolKey)) {
      availableTools.push([toolKey, toolDefinitions[toolKey]]);
    }
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tools</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <Badge
            key={tool}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {tool}
            {isEditing && (
              <button
                onClick={() => handleRemoveTool(tool)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        {isEditing && availableTools.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-6">
                <Plus className="h-3 w-3 mr-1" />
                Add Tool
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableTools.map(([key, tool]) => (
                <DropdownMenuItem key={key} onClick={() => handleAddTool(key)}>
                  <div>
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {tool.description}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
};
