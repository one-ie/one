import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EditableText,
  EditableTextHandle,
} from "@/components/ui/editable-text";
import { Pencil } from "lucide-react";

interface AgentDescriptionProps {
  agentId: Id<"agents">;
  name: string;
  description: string;
  personality: string;
  tools: string[];
}

export const AgentDescription: React.FC<AgentDescriptionProps> = ({
  agentId,
  name,
  description,
  personality,
  tools,
}) => {
  const updateAgent = useMutation(api.agents.mutations.updateMine);
  const descriptionEditRef = React.useRef<EditableTextHandle>(null);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">About</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => descriptionEditRef.current?.startEditing()}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <EditableText
        value={description}
        editRef={descriptionEditRef}
        onSave={async (newDescription) => {
          await updateAgent({
            agentId,
            name,
            description: newDescription,
            personality,
            tools,
          });
        }}
      />
    </Card>
  );
};
