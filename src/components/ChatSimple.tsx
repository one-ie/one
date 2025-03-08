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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatConfig } from "@/schema/chat";

interface ChatSimpleProps extends ComponentPropsWithoutRef<"div"> {
    config?: ChatConfig;
    content?: string;
}

export function ChatSimple({ className, config, content, ...props }: ChatSimpleProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
        useChat({
            api: "/api/chatsimple",
            body: {
                config: config || {
                    provider: "mistral",
                    model: "mistral-large-latest",
                }
            },
            initialMessages: [
                {
                    id: "system",
                    content: `${config?.systemPrompt?.[0]?.text || "I am an AI assistant. How can I help you?"}\n\n${content ? `Context:\n${content}` : ''}`,
                    role: "system"
                }
            ],
        });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (!mounted) {
        return null;
    }

    const handleSuggestionClick = (prompt: string) => {
        handleInputChange({ target: { value: prompt } } as any);
        handleSubmit({ preventDefault: () => {} } as any);
    };

    return (
        <div className={cn("flex h-full flex-col", className)} {...props}>
            <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                    {messages.length === 1 && config?.welcome && (
                        <div className="flex flex-col items-center justify-center px-6 py-4">
                            <Avatar>
                                <AvatarFallback>
                                    {config.welcome.avatar ? (
                                        <img src={config.welcome.avatar} alt="Assistant Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        'A'
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <p className="mt-4 font-medium">{config.welcome.message}</p>
                            {config.welcome.suggestions && config.welcome.suggestions.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                    {config.welcome.suggestions.map((suggestion, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            onClick={() => handleSuggestionClick(suggestion.prompt)}
                                            className="bg-muted hover:bg-blue-600/90 hover:text-white transition-colors"
                                            aria-label={`Use suggestion: ${suggestion.label}`}
                                        >
                                            {suggestion.label}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {messages.slice(1).map((message) => (
                        <ChatMessage
                            key={message.id}
                            className={cn(
                                message.role === "user" && "justify-end"
                            )}
                        >
                            <ChatMessageAvatar
                                className={cn(
                                    message.role === "user" && "order-2"
                                )}
                            >
                                {message.role === "user" ? "U" : "A"}
                            </ChatMessageAvatar>
                            <ChatMessageContent
                                className={cn(
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                {message.content}
                            </ChatMessageContent>
                        </ChatMessage>
                    ))}
                    {isLoading && (
                        <ChatMessage>
                            <ChatMessageAvatar>A</ChatMessageAvatar>
                            <ChatMessageContent className="bg-muted">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </ChatMessageContent>
                        </ChatMessage>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
            <form
                onSubmit={handleSubmit}
                className="mx-4 flex flex-col gap-3 pb-4"
            >
                <ChatInput>
                    <ChatInputTextArea
                        placeholder="Send a message..."
                        value={input}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    <ChatInputSubmit>Send</ChatInputSubmit>
                </ChatInput>
            </form>
        </div>
    );
}
