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
import type { ChatConfig } from "@/schema/chat";
import { cn } from "@/lib/utils";

interface ChatProps extends ComponentPropsWithoutRef<"div"> {
  chatConfig?: ChatConfig;
  content?: string; // Add support for markdown content
}

export function Chat({ className, chatConfig, content = '', ...props }: ChatProps) {
  // Process and validate content
  const sanitizedContent = (() => {
    try {
      if (!content) return '';
      // If it looks like JSON, try to extract real content
      if (content.startsWith('{') && content.endsWith('}')) {
        try {
          const parsed = JSON.parse(content);
          // Look for actual content properties
          return parsed.content || parsed.body || '';
        } catch {
          return content;
        }
      }
      return content;
    } catch (e) {
      console.error('Error processing content:', e);
      return '';
    }
  })();

 // Process the system prompt
  const processedSystemPrompt = chatConfig?.systemPrompt 
    ? (typeof chatConfig.systemPrompt === 'string' 
        ? chatConfig.systemPrompt 
        : Array.isArray(chatConfig.systemPrompt) 
          ? chatConfig.systemPrompt.map(p => p.text).join('\n\n')
          : '')
    : '';

  // Process welcome message and avatar
  const welcomeMessage = chatConfig?.welcome?.message;
  const avatarUrl = chatConfig?.welcome?.avatar;

  // Create initial messages
  const initialMessages = [];
  
  // Add welcome message if available
  if (welcomeMessage) {
    initialMessages.push({
      id: "welcome",
      role: "assistant" as const,
      content: welcomeMessage
    });
  }
  
  // Add any additional initial messages
  if (chatConfig?.initialMessages) {
    initialMessages.push(...chatConfig.initialMessages);
  }
  
  // If no messages were added, add a default one
  if (initialMessages.length === 0) {
    initialMessages.push({
      id: "1",
      role: "user" as const,
      content: "Hi! I need help writing code. Can you help me?"
    });
  }

  const { messages, input, handleInputChange, handleSubmit, status, stop, setInput } =
    useChat({
      api: chatConfig?.api || "/api/chatsimple",
      body: {
        config: chatConfig,
        provider: chatConfig?.provider,
        model: chatConfig?.model,
        apiEndpoint: chatConfig?.apiEndpoint,
        temperature: chatConfig?.temperature,
        maxTokens: chatConfig?.maxTokens,
        systemPrompt: processedSystemPrompt,
        addSystemPrompt: chatConfig?.addSystemPrompt,
        addBusinessPrompt: chatConfig?.addBusinessPrompt,
        content: sanitizedContent // Pass the sanitized content to the API
      },
      initialMessages
    });

  // Debug request body
  console.log('Chat component request body:', {
    provider: chatConfig?.provider,
    model: chatConfig?.model,
    contentLength: sanitizedContent.length,
    contentPreview: sanitizedContent.substring(0, 50)
  });

  // Define isLoading based on status
  const isLoading = status === 'streaming' || status === 'submitted';
  const [showTyping, setShowTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatWrapperRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(76); // Default height for input area

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
    
    // Measure input height after mount
    const inputContainer = document.querySelector('.chat-input-container');
    if (inputContainer) {
      const height = inputContainer.getBoundingClientRect().height;
      setInputHeight(height);
    }
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

  // Render suggestions if available
  const renderSuggestions = () => {
    if (!chatConfig?.welcome?.suggestions || chatConfig.welcome.suggestions.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-3 mt-6 mb-8 justify-center max-w-[600px] mx-auto">
        {chatConfig.welcome.suggestions.map((suggestion, index) => {
          // Handle both string and object suggestions
          const label = typeof suggestion === 'string' ? suggestion : suggestion.label;
          const prompt = typeof suggestion === 'string' ? suggestion : suggestion.prompt;
          
          return (
            <button
              key={index}
              onClick={() => {
                setInput(prompt);
                setTimeout(() => handleSubmit(), 50);
              }}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-2"
            >
              {/* Add a sparkle emoji before each suggestion */}
              <span className="opacity-70">✨</span>
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full w-full bg-background relative overflow-hidden ${className}`} {...props} ref={chatWrapperRef}>
      {/* Message area with improved styling */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-auto pb-24 relative"
        style={{ paddingBottom: `${inputHeight + 16}px` }} // Dynamic padding based on input height
      >
        <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
         {messages.map((message, index) => {
           const isAssistant = message.role === "assistant";
           const isWelcomeMessage = isAssistant && index === 0 && message.id === "welcome";
           const suggestions = chatConfig?.welcome?.suggestions || [];
           
           return (
             <div key={message.id}>
               <ChatMessage
                 id={message.id}
                 variant="bubble"
                 type={isAssistant ? undefined : "outgoing"}
                 className={isAssistant ? "animate-fade-in" : "animate-slide-in"}
               >
                 <div className={isWelcomeMessage ? "welcome-message" : ""}>
                   <ChatMessageContent
                     content={isAssistant ? message.content : (editedMessages[message.id] || message.content)}
                     className={cn(
                       isAssistant ? "prose prose-base dark:prose-invert max-w-none prose-a:text-blue-500" : "font-medium text-base",
                       isWelcomeMessage ? "[&_button]:hidden" : ""
                     )}
                     onContentChange={isAssistant ? undefined : handleMessageEdit}
                     onResubmit={isAssistant && !isWelcomeMessage ? handleResubmit : undefined}
                   />
                 </div>
                 {!isAssistant && <ChatMessageAvatar />}
               </ChatMessage>

               {/* Show suggestions after welcome message */}
               {isWelcomeMessage && suggestions.length > 0 && (
                 <div className="mt-4 mb-8">
                   {renderSuggestions()}
                 </div>
               )}
             </div>
           );
         })}
          
          {/* Typing indicator */}
          {showTyping && <ChatMessageTyping />}
          
          {/* Show suggestions button after some messages */}
          {messages.length > 2 && !showTyping && (
            <div className="flex justify-center my-4">
              <Button
                onClick={() => {
                  setInput("Can you give me more suggestions?");
                  setTimeout(() => handleSubmit(), 50);
                }}
                variant="secondary"
                size="sm"
                className="text-sm bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
              >
                <span className="mr-2">✨</span>
                Show more suggestions
              </Button>
            </div>
          )}
          
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

      {/* Input area at the bottom with width matching the chat container */}
      <div className="absolute bottom-0 left-0 right-0 py-3 bg-background chat-input-container">
        <div className="px-4 w-full max-w-2xl mx-auto">
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmitMessage}
            loading={isLoading}
            onStop={stop}
            variant="unstyled"
            className="transition-all duration-300 border-0 shadow-none bg-[#2a2a2a] p-3 rounded-full"
          >
            <ChatInputTextArea 
              placeholder="Type a message..." 
              className="focus:ring-0 focus:outline-none focus:border-0 transition-all text-base border-0 text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <ChatInputSubmit className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center" />
          </ChatInput>
        </div>
      </div>
    </div>
  );
}
