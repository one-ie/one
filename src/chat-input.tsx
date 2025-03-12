"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTextareaResize } from "@/hooks/use-textarea-resize";
import { SendIcon, StopCircleIcon } from "lucide-react";
import type React from "react";
import { createContext, useContext, forwardRef, useEffect } from "react";

interface ChatInputContextValue {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onSubmit?: () => void;
  loading?: boolean;
  onStop?: () => void;
  variant?: "default" | "unstyled";
  rows?: number;
}

const ChatInputContext = createContext<ChatInputContextValue>({});

interface ChatInputProps extends Omit<ChatInputContextValue, "variant"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "unstyled";
  rows?: number;
}

const ChatInput = function ChatInput({
  children,
  className,
  variant = "default",
  value,
  onChange,
  onSubmit,
  loading,
  onStop,
  rows = 1,
}: ChatInputProps) {
  const contextValue: ChatInputContextValue = {
    value,
    onChange,
    onSubmit,
    loading,
    onStop,
    variant,
    rows,
  };

  return (
    <ChatInputContext.Provider value={contextValue}>
      <div
        className={cn(
          variant === "default" &&
            "flex flex-col items-end w-full p-3 rounded-2xl border border-input bg-background/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:outline-none transition-all duration-200 shadow-sm hover:shadow-md",
          variant === "unstyled" && "flex items-start gap-2 w-full",
          className,
        )}
      >
        {children}
      </div>
    </ChatInputContext.Provider>
  );
};

ChatInput.displayName = "ChatInput";

interface ChatInputTextAreaProps extends React.ComponentPropsWithoutRef<typeof Textarea> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onSubmit?: () => void;
  variant?: "default" | "unstyled";
}

const ChatInputTextArea = forwardRef<HTMLTextAreaElement, ChatInputTextAreaProps>(
  ({
    onSubmit: onSubmitProp,
    value: valueProp,
    onChange: onChangeProp,
    className,
    variant: variantProp,
    ...props
  }, forwardedRef) => {
    const context = useContext(ChatInputContext);
    const value = valueProp ?? context.value ?? "";
    const onChange = onChangeProp ?? context.onChange;
    const onSubmit = onSubmitProp ?? context.onSubmit;
    const rows = context.rows ?? 1;

    // Convert parent variant to textarea variant unless explicitly overridden
    const variant =
      variantProp ?? (context.variant === "default" ? "unstyled" : "default");

    // Get the resize ref
    const resizeRef = useTextareaResize(value, rows);

    // Update forwarded ref when resize ref changes
    useEffect(() => {
      if (!forwardedRef || !resizeRef.current) return;
      
      if (typeof forwardedRef === 'function') {
        forwardedRef(resizeRef.current);
      } else {
        forwardedRef.current = resizeRef.current;
      }
    }, [forwardedRef]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!onSubmit) return;
      if (e.key === "Enter" && !e.shiftKey) {
        if (typeof value !== "string" || value.trim().length === 0) return;
        e.preventDefault();
        onSubmit();
      }
    };

    return (
      <Textarea
        ref={resizeRef}
        {...props}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "max-h-[400px] min-h-0 resize-none overflow-x-hidden text-base transition-all duration-200",
          variant === "unstyled" &&
            "border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
          className,
        )}
        rows={rows}
      />
    );
  }
);

ChatInputTextArea.displayName = "ChatInputTextArea";

interface ChatInputSubmitProps extends React.ComponentProps<typeof Button> {
  onSubmit?: () => void;
  loading?: boolean;
  onStop?: () => void;
}

const ChatInputSubmit = function ChatInputSubmit({
  onSubmit: onSubmitProp,
  loading: loadingProp,
  onStop: onStopProp,
  className,
  ...props
}: ChatInputSubmitProps) {
  const context = useContext(ChatInputContext);
  const loading = loadingProp ?? context.loading;
  const onStop = onStopProp ?? context.onStop;
  const onSubmit = onSubmitProp ?? context.onSubmit;

  if (loading && onStop) {
    return (
      <Button
        onClick={onStop}
        className={cn(
          "shrink-0 rounded-full p-2 h-fit border dark:border-zinc-600 bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-all duration-200 shadow-sm hover:shadow-md",
          className,
        )}
        {...props}
      >
        <StopCircleIcon className="h-5 w-5" />
      </Button>
    );
  }

  const isDisabled =
    typeof context.value !== "string" || context.value.trim().length === 0;

  return (
    <Button
      className={cn(
        "shrink-0 rounded-full p-2 h-fit border dark:border-zinc-600 transition-all duration-200 shadow-sm hover:shadow-md",
        isDisabled ? "opacity-50" : "animate-subtle-bounce",
        className,
      )}
      disabled={isDisabled}
      onClick={(event) => {
        event.preventDefault();
        if (!isDisabled) {
          onSubmit?.();
        }
      }}
      {...props}
    >
      <SendIcon className="h-5 w-5" />
    </Button>
  );
};

ChatInputSubmit.displayName = "ChatInputSubmit";

export {
  ChatInput,
  ChatInputTextArea,
  ChatInputSubmit,
  type ChatInputProps,
  type ChatInputTextAreaProps,
  type ChatInputSubmitProps,
}; 