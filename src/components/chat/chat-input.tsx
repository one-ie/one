// Add 'use client' directive for React Server Components
"use client";  

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTextareaResize } from "@/hooks/use-textarea-resize";
import { SendIcon, StopCircleIcon, Paperclip, XIcon } from "lucide-react"; // Added Paperclip, XIcon
import type React from "react";
import { createContext, useContext, forwardRef, useEffect, useState, useRef, ChangeEvent } from "react"; // Added useState, useRef, ChangeEvent

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
  // Add a prop to pass the image data up
  onImageChange?: (fileData: string | null) => void;
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
  onImageChange // Destructure the new prop
}: ChatInputProps) {
    // State for image preview and data
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageData, setImageData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setImageData(base64String);
                onImageChange?.(base64String); // Pass Base64 data up
            };
            reader.readAsDataURL(file); // Reads as Base64 data URL
        }
        // Reset the input value so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageData(null);
        onImageChange?.(null); // Signal image removal
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

  const contextValue: ChatInputContextValue = {
    value,
    onChange,
    onSubmit,
    loading,
    onStop,
    variant,
    rows,
    // You might add imageData/setImageData to context if sub-components need it
  };

  return (
    <ChatInputContext.Provider value={contextValue}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div
        className={cn(
          variant === "default" &&
            "flex items-end gap-2 w-full p-3 rounded-lg bg-[#2a2a2a] focus-within:ring-1 focus-within:ring-blue-600/30 focus-within:outline-none transition-all duration-200 shadow-md hover:shadow-lg",
          variant === "unstyled" && "flex items-end gap-2 w-full", // Changed items-start to items-end
          className,
        )}
      >
        {/* Image Preview Area */}
        {imagePreview && (
          <div className="relative mb-1 shrink-0">
            <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
              onClick={removeImage}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Attach Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={triggerFileInput}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* The rest of the children (TextArea and Submit button) */}
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
          "flex-1 max-h-[80px] min-h-0 resize-none overflow-x-hidden text-base transition-all duration-200 text-white placeholder:text-gray-400 bg-transparent",
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
          "shrink-0 rounded-full w-10 h-10 flex items-center justify-center bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200 shadow-sm hover:shadow-md",
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
        "shrink-0 rounded-full w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md",
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
