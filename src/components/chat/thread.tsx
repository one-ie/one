import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useThreadRuntime,
} from "@assistant-ui/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FC } from "react";
import { useCallback, useEffect, useRef } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowDownIcon,
  AudioLinesIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
  StopCircleIcon,
} from "lucide-react";
import { MarkdownText } from "./markdown-text";
import { TooltipIconButton } from "./tooltip-icon-button";
import { cn } from "@/lib/utils";

export interface WelcomeConfig {
  message: string;
  avatar: string;
  suggestions: Array<{
    label: string;
    prompt: string;
  }>;
}

interface MyThreadProps {
  welcome?: WelcomeConfig;
  onSuggestionClick?: (prompt: string) => void;
}

export const MyThread: FC<MyThreadProps> = ({ welcome, onSuggestionClick }) => {
  const runtime = useThreadRuntime();
  const viewportRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);

  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
      const viewport = viewportRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  // Handle scroll events to detect if we're at the bottom
  useEffect(() => {
    const viewport = viewportRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    const checkIsAtBottom = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      // Show scroll button as soon as any content is not visible
      isAtBottom.current = (scrollHeight - clientHeight - scrollTop) <= 1;
    };

    const handleScroll = () => {
      checkIsAtBottom();
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll on mount and when runtime updates
  useEffect(() => {
    if (isAtBottom.current) {
      // Small delay to ensure content is rendered
      setTimeout(scrollToBottom, 100);
    }
  }, [runtime, scrollToBottom]);

  return (
    <ThreadPrimitive.Root className="flex flex-col h-full w-full">
      <ScrollArea ref={viewportRef} className="flex-1 w-full relative">
        <div className="absolute bottom-24 right-6 z-10">
          <TooltipIconButton
            tooltip="Scroll to bottom"
            variant="outline"
            onClick={scrollToBottom}
            className="rounded-full bg-background shadow-lg hover:bg-background/90 transition-all duration-200 scale-90 hover:scale-100"
            style={{
              opacity: isAtBottom.current ? 0 : 0.9,
              transform: `scale(${isAtBottom.current ? 0.9 : 1})`,
              pointerEvents: isAtBottom.current ? 'none' : 'auto'
            }}
          >
            <ArrowDownIcon className="h-5 w-5" />
          </TooltipIconButton>
        </div>
        <ThreadPrimitive.Viewport className="min-h-full w-full">
          <div className="pb-36">
            {/* Always show welcome section */}
            <div className="flex flex-grow flex-col items-center justify-center px-6 py-4">
              <Avatar>
                <AvatarFallback>
                  {welcome?.avatar ? (
                    <img src={welcome.avatar} alt="Assistant Avatar" className="w-full h-full object-cover" />
                  ) : (
                    'A'
                  )}
                </AvatarFallback>
              </Avatar>
              <p className="mt-4 font-medium">{welcome?.message || "How can I help you today?"}</p>
              {welcome?.suggestions && welcome.suggestions.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {welcome.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => onSuggestionClick?.(suggestion.prompt)}
                      className="bg-muted hover:bg-blue-600/90 hover:text-white transition-colors"
                      aria-label={`Use suggestion: ${suggestion.label}`}
                    >
                      {suggestion.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <ThreadPrimitive.Messages
              components={{
                UserMessage: MyUserMessage,
                EditComposer: MyEditComposer,
                AssistantMessage: MyAssistantMessage,
              }}
            />
          </div>
        </ThreadPrimitive.Viewport>
      </ScrollArea>

      <div>
        <div className="px-6 pt-6 pb-4">
          <MyComposer />
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
};

const MyComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="flex items-end rounded-[24px] border bg-muted shadow-lg transition-colors ease-in focus-within:border-ring/30 focus-within:shadow-md mx-auto max-w-[800px] w-full">
      <ComposerPrimitive.Input
        autoFocus
        placeholder="Write a message..."
        rows={1}
        className="placeholder:text-muted-foreground max-h-40 min-h-[64px] w-full resize-none rounded-[24px] border-none bg-transparent px-6 py-5 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
      />
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send"
            variant="default"
            className="my-3 mr-3 size-9 p-2 transition-opacity ease-in bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            <SendHorizontalIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Cancel"
            variant="default"
            className="my-3 mr-3 size-9 p-2 transition-opacity ease-in bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </ComposerPrimitive.Root>
  );
};

const MyUserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="group w-full py-6">
      <div className="px-6">
        <div className="flex justify-end items-start gap-6">
          <MyUserActionBar />
          <div className="bg-muted text-foreground min-w-0 max-w-[75%] rounded-2xl px-6 py-3.5">
            <MessagePrimitive.Content />
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MyBranchPicker />
          </div>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const MyUserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const MyEditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="bg-muted my-4 container mx-auto flex flex-col gap-2 rounded-xl">
      <ComposerPrimitive.Input className="text-foreground flex h-8 w-full resize-none border-none bg-transparent p-4 pb-0 outline-none focus:ring-0" />

      <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost">Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const MyAssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="group w-full py-6">
      <div className="px-6">
        <div className="flex gap-6">
          <Avatar className="flex-shrink-0 mt-1">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-foreground leading-7">
              <MessagePrimitive.Content components={{ Text: MarkdownText }} />
            </div>
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MyBranchPicker />
              <MyAssistantActionBar />
            </div>
          </div>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const MyAssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground flex gap-1.5 data-[floating]:bg-background data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
    >
      <MessagePrimitive.If speaking={false}>
        <ActionBarPrimitive.Speak asChild>
          <TooltipIconButton tooltip="Read aloud">
            <AudioLinesIcon />
          </TooltipIconButton>
        </ActionBarPrimitive.Speak>
      </MessagePrimitive.If>
      <MessagePrimitive.If speaking>
        <ActionBarPrimitive.StopSpeaking asChild>
          <TooltipIconButton tooltip="Stop">
            <StopCircleIcon />
          </TooltipIconButton>
        </ActionBarPrimitive.StopSpeaking>
      </MessagePrimitive.If>
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const MyBranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "text-muted-foreground inline-flex items-center text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const CircleStopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    width="16"
    height="16"
  >
    <rect width="10" height="10" x="3" y="3" rx="2" />
  </svg>
);
