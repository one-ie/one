import React, { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  replyToMention: string | null;
  setReplyToMention: (mention: string | null) => void;
  shouldFocusInput: boolean;
  setShouldFocusInput: (focus: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [replyToMention, setReplyToMention] = useState<string | null>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        replyToMention,
        setReplyToMention,
        shouldFocusInput,
        setShouldFocusInput,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
