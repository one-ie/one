// src/components/Chat.tsx
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useVercelUseChatRuntime } from "@assistant-ui/react-ai-sdk";
import { MyThread as CustomThread } from "@/components/chat/thread";
import { type ChatConfig, createDefaultConfig } from "@/schema/chat";
import { useChat } from "ai/react";
import { useCallback, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
  
export function MyThread({
  config = createDefaultConfig(),
  content
}: {
  config?: ChatConfig,
  content?: string
}) {
  // Client-side only rendering
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure we always have a valid config
  const safeConfig = config || createDefaultConfig();

  const chat = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: nanoid(),
        role: "system" as const,
        content: `${safeConfig.systemPrompt?.[0]?.text || "I am an AI assistant. How can I help you?"}\n\n${content ? `Context:\n${content}` : ''}`
      }
    ],
    body: {
      config: safeConfig
    },
    onError: (error) => {
      console.error("Chat error:", error);
    }
  });

  const runtime = useVercelUseChatRuntime(chat);

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((prompt: string) => {
    // Set the input value first
    chat.setInput(prompt);
    
    // Create minimal form event data
    const submitEvent = {
      preventDefault() {},
      target: { message: { value: prompt } }
    };
    
    // Submit the chat
    chat.handleSubmit(submitEvent as any);

    // Force scroll to bottom
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      // Initial scroll
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      
      // Keep scrolling to follow messages
      const scrollInterval = setInterval(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 100);

      // Stop following after 2 seconds
      setTimeout(() => clearInterval(scrollInterval), 2000);
    }
  }, [chat]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-full">
      <AssistantRuntimeProvider runtime={runtime}>
        <CustomThread 
          welcome={safeConfig.welcome}
          onSuggestionClick={handleSuggestionClick}
        />
      </AssistantRuntimeProvider>
    </div>
  );
}