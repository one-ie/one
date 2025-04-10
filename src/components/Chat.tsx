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
import { useChat, type Message } from '@ai-sdk/react'; // Import Message
import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useState, useRef } from "react"; // useState already imported
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

  // Component state
  const [mounted, setMounted] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
  const [attachedImageData, setAttachedImageData] = useState<string | null>(null); // State for image data
  const [inputHeight, setInputHeight] = useState(76);
  const [sentImages, setSentImages] = useState<Record<string, string>>({}); // State to track sent images
  const lastSubmittedImageRef = useRef<string | null>(null); // Ref to hold the last submitted image data

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatWrapperRef = useRef<HTMLDivElement>(null);

  // Process welcome message and config
  const welcomeMessage = chatConfig?.welcome?.message;
  const avatarUrl = chatConfig?.welcome?.avatar;

  // Initial messages array
  // Initial messages array - Allow content to be string or array
  const initialMessages: Array<{id: string; role: "assistant" | "user"; content: string | Array<any>}> = [];

  // Enhanced debug logging
  console.log('Chat initialization details:', {
    hasConfig: !!chatConfig,
    welcome: {
      message: welcomeMessage,
      avatar: avatarUrl,
      suggestions: chatConfig?.welcome?.suggestions
    },
    configDetails: chatConfig
  });
  
  // Initialize with welcome message if available
  if (welcomeMessage) {
    initialMessages.push({
      id: "welcome",
      role: "assistant" as const,
      content: welcomeMessage
    });
    console.log('Added welcome message to initialMessages:', {
      messageCount: initialMessages.length,
      welcomeMessage,
      hasSuggestions: !!chatConfig?.welcome?.suggestions?.length,
      suggestions: chatConfig?.welcome?.suggestions
    });
  } else {
    console.warn('No welcome message found in chat config');
  }

  // Then add any additional messages, filtering out system messages
  if (chatConfig?.initialMessages) {
    const validMessages = chatConfig.initialMessages.filter(
      msg => msg.role === "assistant" || msg.role === "user"
    ) as Array<{id: string; role: "assistant" | "user"; content: string}>;
    initialMessages.push(...validMessages);
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
      api: chatConfig?.api || "/api/openrouter",
      // Add attachedImageData to the body sent to the API
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
        content: sanitizedContent, // Pass the sanitized content to the API
        // Include image data here for the API route to process
        attachedImageData: attachedImageData
      },
      initialMessages: initialMessages as Message[],
      // Send attachedImageData with each request body update
      // Note: This sends the *current* image data when the hook initializes or re-evaluates.
      // For sending it *only* with the specific submit action, modifying the API call directly
      // or using the 'data' field in handleSubmit (if supported correctly) is needed.
      // Let's stick to modifying the API route to check the body for now.
    });

  // Log chat state after initialization
  useEffect(() => {
    console.log('Chat state:', {
      config: chatConfig?.welcome,
      messagesCount: messages.length,
      suggestions: chatConfig?.welcome?.suggestions,
      firstMessage: messages[0]
    });
  }, [messages, chatConfig]);

  // Debug logs for chat state
  useEffect(() => {
    if (mounted && messages) {
      console.log('Chat active state:', {
        hasConfig: !!chatConfig,
        welcome: chatConfig?.welcome,
        suggestions: chatConfig?.welcome?.suggestions,
        messagesCount: messages.length,
        firstMessage: messages[0],
        isWelcomeMessage: messages[0]?.id === 'welcome'
      });
    }
  }, [chatConfig, messages, mounted]);

  // Define loading state
  const isLoading = status === 'streaming' || status === 'submitted';

  // Combined mount and state monitoring
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    } else if (messages) {
      console.log('Chat state:', {
        config: {
          hasConfig: !!chatConfig,
          welcome: chatConfig?.welcome,
          suggestions: chatConfig?.welcome?.suggestions?.length
        },
        messages: {
          count: messages.length,
          firstMessage: messages[0],
          isWelcomeMessage: messages[0]?.id === 'welcome'
        }
      });
    }
  }, [chatConfig, messages, mounted]);

  // Check if we need to show the scroll button
  const checkScrollPosition = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 100;
    setShowScrollButton(!atBottom);
  };

  // Monitor chat configuration and messages
  useEffect(() => {
    console.log('Chat configuration state:', {
      hasWelcomeMessage: !!welcomeMessage,
      suggestionsCount: chatConfig?.welcome?.suggestions?.length,
      messageCount: messages.length,
      firstMessage: messages[0]
    });
  }, [welcomeMessage, chatConfig?.welcome?.suggestions, messages]);

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
    // Use the new handler
    handleSubmitWithImage();
    // Always scroll to bottom when user sends a message
    // setTimeout(scrollToBottom, 100); // Handled within handleSubmitWithImage
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

  // Modified handleSubmit to include image data
  const handleSubmitWithImage = (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (input.trim() === "" && !attachedImageData) return; // Prevent empty submission

      // Store the image data being submitted before clearing state
      lastSubmittedImageRef.current = attachedImageData;

      // Log the image data being submitted
      console.log('Submitting image data:', attachedImageData);

      const messageContent: Array<any> = []; // Use array for content

      if (input.trim()) {
          messageContent.push({ type: 'text', text: input });
      }
      if (attachedImageData) {
          // Ensure the base64 string is correctly formatted if needed by the API
          // e.g., some APIs might expect just the data part without the `data:image/...;base64,` prefix
          // Standard format for OpenAI GPT-4o Vision API
          messageContent.push({ type: 'image_url', image_url: { url: attachedImageData } });
      }

      // Call original handleSubmit with the new message structure
      // The Vercel AI SDK's useChat hook expects the message content to be passed
      // via the last argument's `options.body.messages` or similar,
      // or it constructs the message based on the `input` state.
      // We need to append a message manually or modify how useChat sends data.
      // A common pattern is to let useChat handle text and manually append/modify for images.
      // Let's adjust to send a structured message directly if the API route handles it.
      
      // We will modify the messages array directly before sending if useChat doesn't support structured content input easily.
      // For now, let's assume the API route /api/chat will receive the standard messages array
      // and the *last* message will contain our structured content.
      // We'll override the content of the message being sent.
      
      // Call handleSubmit with only the event object
      handleSubmit(e);


      // Reset input and image *after* submit
      setInput('');
      setAttachedImageData(null);
      // Ensure ChatInput clears its preview - this needs coordination or passing a reset trigger down.
      // For now, assuming ChatInput handles its own preview reset on file input change/removal.

      setTimeout(scrollToBottom, 100); // Scroll after submission attempt
  };

  // Effect to associate the submitted image with the new user message
  useEffect(() => {
    // Check if an image was just submitted and if there are messages
    if (lastSubmittedImageRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Ensure the last message is a user message and doesn't already have an image associated
      // This assumes the hook adds the user message quickly after handleSubmit is called
      if (lastMessage.role === 'user' && !sentImages[lastMessage.id]) {
        console.log(`Associating image with new message ID: ${lastMessage.id}`);
        setSentImages(prev => ({
          ...prev,
          [lastMessage.id]: lastSubmittedImageRef.current! // Store the image data with the message ID
        }));
        lastSubmittedImageRef.current = null; // Clear the ref after association
      }
    }
    // Depend on messages array content (or length) to detect new messages
  }, [messages, sentImages]);

  // Render suggestions if available
  const renderSuggestions = () => {
    if (!chatConfig?.welcome?.suggestions || chatConfig.welcome.suggestions.length === 0) {
      return null;
    }
    
    return (
      <div className="grid grid-cols-2 gap-2">
        {chatConfig.welcome.suggestions.map((suggestion, index) => {
          const label = typeof suggestion === 'string' ? suggestion : suggestion.label;
          const prompt = typeof suggestion === 'string' ? suggestion : suggestion.prompt;
          
          // Quick Start gets special treatment - smaller size
          const isQuickStart = label.toLowerCase().includes('quick start') || 
                             label.toLowerCase().includes('get started');
          
          return (
            <button
              key={index}
              onClick={() => {
                setInput(prompt);
                setTimeout(() => handleSubmit(), 50);
              }}
              className={`${
                isQuickStart ? 'col-span-2 py-1.5' : 'col-span-1 py-1.5'
              } px-3 bg-[#2a2a2a] hover:bg-[#353535] rounded-lg transition-all duration-200 text-white hover:text-white/90 shadow-sm hover:shadow text-sm font-medium`}
            >
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
        style={{ paddingBottom: `${inputHeight + 16}px` }}
      >
        <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            const isWelcomeMessage = isAssistant && message.id === "welcome";

            // message.content from useChat hook is a string.
            const textContent = message.content;
            
            // Reset image rendering logic here, as message.content is string
            // Displaying images sent *by the AI* would require parsing textContent
            // for image URLs or using tool calls / structured responses.
            
            return (
               <div key={message.id}>
                   <ChatMessage
                      id={message.id}
                      variant="bubble"
                      type={isAssistant ? undefined : "outgoing"}
                      className={isAssistant ? "animate-fade-in" : "animate-slide-in"}
                   >
                       {/* Render Avatar */}
                       {isAssistant ? <ChatMessageAvatar icon={undefined /* Pass icon if available */} imageSrc={avatarUrl} /> : <ChatMessageAvatar />}

                       {/* Render Content - Only pass text content */}
                       <ChatMessageContent
                            content={isAssistant ? textContent : (editedMessages[message.id] || textContent)}
                            id={message.id}
                            className={cn(
                              isAssistant ? "prose prose-base dark:prose-invert max-w-none prose-a:text-blue-500" : "font-medium text-base",
                              isWelcomeMessage ? "[&_button]:hidden" : ""
                            )}
                            onContentChange={isAssistant ? undefined : handleMessageEdit}
                            onResubmit={isAssistant && !isWelcomeMessage ? handleResubmit : undefined}
                        >
                            {/* Image rendering logic removed from here - needs specific handling for AI responses */}
                       </ChatMessageContent>
                   </ChatMessage>

                {/* Show suggestions after welcome message */}
                {isWelcomeMessage && (
                  <div className="mt-4">
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

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 py-3 bg-background chat-input-container">
        <div className="px-4 w-full max-w-2xl mx-auto">
          {/* Pass the image handler to ChatInput */}
          <form onSubmit={handleSubmitWithImage}> {/* Use form to handle native submit */}
              <ChatInput
                  value={input}
                  onChange={handleInputChange}
                  onSubmit={handleSubmitWithImage} // Can still trigger via JS
                  loading={isLoading}
                  onStop={stop}
                  variant="unstyled"
                  className="transition-all duration-300 border-0 shadow-none bg-[#2a2a2a] p-3 rounded-lg" // Rounded-lg fits preview better
                  onImageChange={setAttachedImageData} // Handle image state change
              >
                  <ChatInputTextArea
                      placeholder="Type a message or attach an image..."
                      className="focus:ring-0 focus:outline-none focus:border-0 transition-all text-base border-0 text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <ChatInputSubmit
                      className="bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200"
                      aria-label="Send message"
                      type="submit" // Make it a submit button
                  />
              </ChatInput>
           </form>
        </div>
      </div>
    </div>
  );
}
