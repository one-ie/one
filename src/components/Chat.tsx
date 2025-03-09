"use client";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/chat/chat-input";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "@/components/chat/chat-message";
import { ChatMessageArea } from "@/components/chat/chat-message-area";
import { useChat } from "ai/react";
import type { ComponentPropsWithoutRef } from "react";

export function Chat({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      api: "/api/chatsimple",
      initialMessages: [
        {
          id: "1",
          role: "user",
          content: "Hi! I need help organizing my project management workflow. Can you guide me through some best practices?"
        }
      ]
    });

  const handleSubmitMessage = () => {
    if (isLoading) {
      return;
    }
    handleSubmit();
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto ${className}`} {...props}>
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
          {messages.map((message) => {
            if (message.role !== "user") {
              return (
                <ChatMessage key={message.id} id={message.id}>
                  <ChatMessageAvatar />
                  <ChatMessageContent content={message.content} />
                </ChatMessage>
              );
            }
            return (
              <ChatMessage
                key={message.id}
                id={message.id}
                variant="bubble"
                type="outgoing"
              >
                <ChatMessageContent content={message.content} />
              </ChatMessage>
            );
          })}
        </div>
      </ChatMessageArea>
      <div className="px-2 py-4 max-w-2xl mx-auto w-full">
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmitMessage}
          loading={isLoading}
          onStop={stop}
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <ChatInputSubmit />
        </ChatInput>
      </div>
    </div>
  );
}
