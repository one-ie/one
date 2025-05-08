import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus } from "lucide-react";
import { useApiErrorHandler } from "../../misc/errors";
import { ConversationItem } from "./ConversationItem";
import { useCurrentConversationId, routes } from "../../../routes";

const DEFAULT_THREAD_TITLE = "New Conversation";

interface ConversationListProps {}

export const ConversationList: React.FC<ConversationListProps> = ({}) => {
  const conversations = useQuery(api.conversations.queries.listMine);
  const createConversation = useMutation(api.conversations.mutations.create);
  const onApiError = useApiErrorHandler();
  const currentConversationId = useCurrentConversationId();

  const handleCreateConversation = async () => {
    try {
      const conversationId = await createConversation({
        title: DEFAULT_THREAD_TITLE,
      });
      routes.conversation({ conversationId }).push();
    } catch (error) {
      onApiError(error);
    }
  };

  return (
    <>
      <div className="h-24 border-b border-border relative overflow-hidden">
        <img
          src="/logo.svg"
          alt="Agent Inbox"
          className="absolute -right-0 -top-2 h-32 object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
      </div>
      <div className="p-4">
        <button
          onClick={handleCreateConversation}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          New Conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations?.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            id={conversation._id}
            title={conversation.title}
            lastMessageTime={conversation._creationTime}
            isSelected={conversation._id === currentConversationId}
            onSelect={(id) =>
              routes.conversation({ conversationId: id }).push()
            }
          />
        ))}
      </div>
    </>
  );
};
