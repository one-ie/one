"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTextareaResize } from "@/hooks/use-textarea-resize";
import { ArrowUpIcon } from "lucide-react";
import type React from "react";
import { createContext, useContext } from "react";

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

function ChatInput({
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
			<div className={cn("absolute bottom-0 left-0 right-0 w-full p-4", className)}>
			  <div className={cn(
			    "w-full bg-muted/50 backdrop-blur rounded-2xl px-4 py-3",
			    variant === "default" && "flex flex-col items-end gap-2",
			    variant === "unstyled" && "flex items-start gap-2 bg-transparent"
			  )}>
			    {children}
			  </div>
			</div>
			</ChatInputContext.Provider>
	);
}

ChatInput.displayName = "ChatInput";

interface ChatInputTextAreaProps extends React.ComponentProps<typeof Textarea> {
	value?: string;
	onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
	onSubmit?: () => void;
	variant?: "default" | "unstyled";
}

function ChatInputTextArea({
	onSubmit: onSubmitProp,
	value: valueProp,
	onChange: onChangeProp,
	className,
	variant: variantProp,
	...props
}: ChatInputTextAreaProps) {
	const context = useContext(ChatInputContext);
	const value = valueProp ?? context.value ?? "";
	const onChange = onChangeProp ?? context.onChange;
	const onSubmit = onSubmitProp ?? context.onSubmit;
	const rows = context.rows ?? 1;

	// Convert parent variant to textarea variant unless explicitly overridden
	const variant =
		variantProp ?? (context.variant === "default" ? "unstyled" : "default");

	const textareaRef = useTextareaResize(value, rows);
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (!onSubmit) {
			return;
		}
		if (e.key === "Enter" && !e.shiftKey) {
			if (typeof value !== "string" || value.trim().length === 0) {
				return;
			}
			e.preventDefault();
			onSubmit();
		}
	};

	return (
		<Textarea
			ref={textareaRef}
			{...props}
			value={value}
			onChange={onChange}
			onKeyDown={handleKeyDown}
			className={cn(
				"min-h-[44px] max-h-[200px] resize-none overflow-x-hidden",
				"bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0",
				variant === "unstyled" && "shadow-none",
				className,
			)}
			rows={rows}
		/>
	);
}

ChatInputTextArea.displayName = "ChatInputTextArea";

interface ChatInputSubmitProps extends React.ComponentProps<typeof Button> {
	onSubmit?: () => void;
	loading?: boolean;
	onStop?: () => void;
}

function ChatInputSubmit({
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
					"shrink-0 rounded-full p-2 h-fit bg-primary hover:bg-primary/90 text-primary-foreground border-none",
					className,
				)}
				aria-label="Stop Generation"
				{...props}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="currentColor"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-label="Stop"
				>
					<title>Stop</title>
					<rect x="6" y="6" width="12" height="12" />
				</svg>
			</Button>
		);
	}

	const isDisabled =
		typeof context.value !== "string" || context.value.trim().length === 0;

	return (
		<Button
			className={cn(
				"shrink-0 rounded-full p-2 h-fit bg-primary hover:bg-primary/90 text-primary-foreground border-none",
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
			<ArrowUpIcon />
		</Button>
	);
}

ChatInputSubmit.displayName = "ChatInputSubmit";

export { ChatInput, ChatInputTextArea, ChatInputSubmit };
