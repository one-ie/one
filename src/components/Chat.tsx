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
  ChatMessageTyping,
} from "@/components/chat/chat-message";
import { Button } from "@/components/ui/button";
import { useChat } from '@ai-sdk/react';
import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useState, useRef } from "react";

export function Chat({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  const { messages, input, handleInputChange, handleSubmit, status, stop, setInput } =
    useChat({
      api: "/api/chatsimple",
      initialMessages: [
        {
          id: "1",
          role: "user",
          content: "Hi! I need help writing code. Can you help me?"
        }
      ]
    });

  // Define isLoading based on status
  const isLoading = status === 'streaming' || status === 'submitted';

  const [showTyping, setShowTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check if we need to show the scroll button
  const checkScrollPosition = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 100;
    setShowScrollButton(!atBottom);
  };

  // Set initial load complete after component mounts
  useEffect(() => {
    setInitialLoadComplete(true);
  }, []);

  // Auto-scroll to bottom when messages change, but only after initial load
  useEffect(() => {
    if (initialLoadComplete && (messages.length > 1 || showTyping)) {
      scrollToBottom();
    }
  }, [messages, showTyping, initialLoadComplete]);

  // Add scroll event listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', checkScrollPosition);
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      checkScrollPosition();
    }, 100);
  };

  // Show typing indicator when loading
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      setShowTyping(true);
    } else {
      // Keep typing indicator for a short time after loading completes for a smoother transition
      const timer = setTimeout(() => {
        setShowTyping(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmitMessage = () => {
    if (status === 'streaming' || status === 'submitted') {
      return;
    }
    handleSubmit();
    // Always scroll to bottom when user sends a message
    setTimeout(scrollToBottom, 100);
  };

  // Handle message content editing
  const handleMessageEdit = (id: string, newContent: string) => {
    setEditedMessages(prev => ({
      ...prev,
      [id]: newContent
    }));
  };

  // Handle resubmitting assistant message as a user message
  const handleResubmit = (content: string) => {
    if (status === 'streaming' || status === 'submitted') return;
    
    setInput(content);
    // Use a small timeout to ensure the UI updates before submitting
    setTimeout(() => {
      handleSubmit();
      scrollToBottom();
    }, 50);
  };

  return (
    <div className={`flex flex-col h-full w-full bg-background ${className}`} {...props}>
      {/* Message area with improved styling */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-auto pb-24 relative"
      >
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
          {messages.map((message) => {
            if (message.role !== "user") {
              return (
                <ChatMessage 
                  key={message.id} 
                  id={message.id}
                  variant="bubble"
                  className="animate-fade-in"
                >
                  <ChatMessageContent 
                    content={message.content} 
                    className="prose prose-base dark:prose-invert max-w-none prose-a:text-blue-500"
                    onResubmit={handleResubmit}
                  />
                </ChatMessage>
              );
            }
            return (
              <ChatMessage
                key={message.id}
                id={message.id}
                variant="bubble"
                type="outgoing"
                className="animate-slide-in"
              >  
                <ChatMessageContent 
                  content={editedMessages[message.id] || message.content} 
                  className="font-medium text-base"
                  onContentChange={handleMessageEdit}
                />
                <ChatMessageAvatar />
              </ChatMessage>
            );
          })}
          
          {/* Typing indicator */}
          {showTyping && <ChatMessageTyping />}
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            className="absolute bottom-28 right-4 rounded-full w-10 h-10 flex items-center justify-center bg-blue-600 text-white shadow-lg hover:shadow-xl animate-bounce-subtle z-10 hover:bg-blue-700"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Fixed input area at the bottom with background matching the page */}
      <div className="fixed bottom-0 left-0 right-0 py-4 bg-background z-50">
        <div className="px-4 w-full max-w-2xl mx-auto">
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmitMessage}
            loading={isLoading}
            onStop={stop}
            className="shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ChatInputTextArea 
              placeholder="Type a message..." 
              className="focus:ring-1 focus:ring-blue-600/50 transition-all text-base"
            />
            <ChatInputSubmit className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center" />
          </ChatInput>
        </div>
      </div>
    </div>
  );
}
