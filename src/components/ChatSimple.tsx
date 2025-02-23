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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "ai/react";
import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatSimple({ className, ...props }: ComponentPropsWithoutRef<"div">) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    
    const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
        useChat({
            api: "/api/chatsimple",
            body: {
                config: {
                    provider: "mistral",
                    model: "mistral-large-latest",
                }
            },
            initialMessages: [
                {
                    id: "initial-assistant",
                    content:
                        "Hi! I need help organizing my project management workflow. Can you guide me through some best practices?",
                    role: "assistant",
                },
                {
                    id: "initial-user",
                    content:
                        "Hi! I need help organizing my project management workflow. Can you guide me through some best practices?",
                    role: "user",
                },
            ],
        });

    const handleSubmitMessage = () => {
        if (isLoading) {
            return;
        }
        handleSubmit();
    };

    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                // Only use smooth scrolling for non-initial renders
                const behavior = messages.length <= 2 ? "instant" : "smooth";
                messagesEndRef.current.scrollIntoView({ behavior });
            }
        };
        
        // Only scroll if we have more than initial messages or if loading/focused
        if (messages.length > 2 || isLoading || isFocused) {
            scrollToBottom();
            const timeoutId = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [messages, isLoading, isFocused]);

    return (
        <div className={cn("flex flex-col h-[90%] relative max-w-[900px] mx-auto w-full", className)} {...props}>
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-medium">Chat</h2>
                    </div>
                </div>
            </div>
            <ScrollArea className="flex-1 relative">
                <div className="flex flex-col space-y-4 p-4 pb-6">
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
                    
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground animate-in fade-in duration-200">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs">AI is typing...</span>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} className="h-px" />
                </div>
            </ScrollArea>

            <div className="flex-none border-t bg-background">
                <div className="p-2">
                    <ChatInput
                        value={input}
                        onChange={handleInputChange}
                        onSubmit={handleSubmitMessage}
                        loading={isLoading}
                        onStop={stop}
                        className="bg-background"
                    >
                        <ChatInputTextArea 
                            placeholder="Type a message..." 
                            className="min-h-[42px] max-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg resize-none"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        <ChatInputSubmit 
                            className={cn(
                                "mb-1 mr-1 transition-all duration-200",
                                "hover:scale-105 active:scale-95",
                                "disabled:opacity-50 disabled:hover:scale-100",
                                isLoading && "opacity-70"
                            )}
                        />
                    </ChatInput>
                </div>
            </div>
        </div>
    );
}
