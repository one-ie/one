import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus } from "lucide-react";
import { useApiErrorHandler } from "../../misc/errors";
import { routes, useCurrentConversationId } from "../../../routes";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex-helpers/react/cache";

const DEFAULT_THREAD_TITLE = "New Conversation";

export const ConversationList = () => {
  const conversations = useQuery(api.conversations.queries.listMine);
  const createConversation = useMutation(api.conversations.mutations.create);
  const onApiError = useApiErrorHandler();
  const currentConversationId = useCurrentConversationId();

  return (
    <>
      <div className="p-4">
        <Button
          className="w-full"
          variant="default"
          onClick={() =>
            createConversation({ title: DEFAULT_THREAD_TITLE })
              .then((conversationId) =>
                routes.conversation({ conversationId }).push(),
              )
              .catch(onApiError)
          }
        >
          <Plus className="h-5 w-5" />
          New Conversation
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations?.map((conversation) => (
          <div
            key={conversation._id}
            onClick={() =>
              routes.conversation({ conversationId: conversation._id }).push()
            }
            className={`p-4 cursor-pointer hover:bg-accent ${
              conversation._id === currentConversationId ? "bg-accent" : ""
            }`}
          >
            <div className="font-medium text-primary-foreground truncate">
              {conversation.title}
            </div>
            <div className="text-sm text-muted-foreground/80 truncate">
              {new Date(conversation._creationTime).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
