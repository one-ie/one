import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { ParticipantsDialog } from "./ParticipantsDialog";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";

interface ConversationParticipantsProps {
  conversation: Doc<"conversations"> | undefined | null;
}

export const ConversationParticipants: React.FC<
  ConversationParticipantsProps
> = ({ conversation }) => {
  const avatars = useQuery(
    api.conversationParticipants.queries.listAvatars,
    conversation
      ? {
          conversationId: conversation._id,
        }
      : "skip",
  );

  if (!conversation) return null;

  return (
    <ParticipantsDialog
      conversation={conversation}
      trigger={
        <div className="flex -space-x-2 ml-auto cursor-pointer hover:opacity-80 transition-opacity">
          {avatars?.slice(0, 3).map((url, i) => (
            <Avatar key={i} className="ring-2 ring-background w-8 h-8">
              <AvatarImage src={url} />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          ))}
          {(avatars?.length ?? 0) > 3 && (
            <div className="w-8 h-8 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-xs font-medium">
              +{avatars!.length - 3}
            </div>
          )}
        </div>
      }
    />
  );
};
