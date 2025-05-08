import * as React from "react";
import { Doc } from "convex/_generated/dataModel";
import { SystemMessage } from "./SystemMessage";
import { ParticipantMessage } from "./ParticipantMessage";
import { exhaustiveCheck } from "../../../../shared/misc";

interface ChatMessageProps {
  message: Doc<"conversationMessages">;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  if (message.kind == "system") return <SystemMessage message={message} />;

  if (message.kind == "participant")
    return <ParticipantMessage message={message} />;

  exhaustiveCheck(message);
};
