"use client";

import { useChat } from "ai/react";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/ui/chat-input";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "@/components/ui/chat-message";
import { ChatMessageArea } from "@/components/ui/chat-message-area";
import type { ComponentPropsWithoutRef } from "react";

interface SimpleChatProps extends ComponentPropsWithoutRef<"div"> {
  apiEndpoint?: string;
  welcomeMessage?: string;
}

export function SimpleChat({ 
  className, 
  apiEndpoint = "/api/chat",
  welcomeMessage = "Hello! How can I help you today?",
  ...props 
}: SimpleChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: apiEndpoint,
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: welcomeMessage
      }
    ]
  });

  const handleSubmitMessage = () => {
    if (isLoading) return;
    handleSubmit();
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto ${className}`} {...props}>
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              id={message.id}
              variant={message.role === "user" ? "bubble" : "default"}
              type={message.role === "user" ? "outgoing" : "incoming"}
            >
              {message.role !== "user" && <ChatMessageAvatar />}
              <ChatMessageContent content={message.content} />
            </ChatMessage>
          ))}
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