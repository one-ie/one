import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/chat/markdown-content";
import { type VariantProps, cva } from "class-variance-authority";
import { UserIcon } from "lucide-react";
import React, { type ReactNode } from "react";

const chatMessageVariants = cva("flex gap-4 w-full group transition-all duration-200", {
	variants: {
		variant: {
			default: "",
			bubble: "",
			full: "p-5",
		},
		type: {
			incoming: "justify-start mr-auto",
			outgoing: "justify-end ml-auto",
		},
	},
	compoundVariants: [
		{
			variant: "full",
			type: "outgoing",
			className: "bg-muted",
		},
		{
			variant: "full",
			type: "incoming",
			className: "bg-background",
		},
	],
	defaultVariants: {
		variant: "default",
		type: "incoming",
	},
});

interface MessageContextValue extends VariantProps<typeof chatMessageVariants> {
	id: string;
}

const ChatMessageContext = React.createContext<MessageContextValue | null>(
	null,
);

const useChatMessage = () => {
	const context = React.useContext(ChatMessageContext);
	return context;
};

// Root component
interface ChatMessageProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof chatMessageVariants> {
	children?: React.ReactNode;
	id: string;
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
	(
		{
			className,
			variant = "default",
			type = "incoming",
			id,
			children,
			...props
		},
		ref,
	) => {
		return (
			<ChatMessageContext.Provider value={{ variant, type, id }}>
				<div
					ref={ref}
					className={cn(chatMessageVariants({ variant, type, className }))}
					{...props}
				>
					{children}
				</div>
			</ChatMessageContext.Provider>
		);
	},
);
ChatMessage.displayName = "ChatMessage";

// Avatar component

const chatMessageAvatarVariants = cva(
	"w-10 h-10 flex items-center rounded-full justify-center ring-2 shrink-0 bg-transparent overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md",
	{
		variants: {
			type: {
				incoming: "ring-primary/20 group-hover:ring-primary/30",
				outgoing: "ring-muted-foreground/30 group-hover:ring-muted-foreground/40",
			},
		},
		defaultVariants: {
			type: "incoming",
		},
	},
);

interface ChatMessageAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
	imageSrc?: string;
	icon?: ReactNode;
}

const ChatMessageAvatar = React.forwardRef<
	HTMLDivElement,
	ChatMessageAvatarProps
>(({ className, icon: iconProps, imageSrc, ...props }, ref) => {
	const context = useChatMessage();
	const type = context?.type ?? "incoming";
	const icon = iconProps ?? <UserIcon className="text-muted-foreground" />;
	
	return (
		<div
			ref={ref}
			className={cn(chatMessageAvatarVariants({ type, className }))}
			{...props}
		>
			{imageSrc ? (
				<img
					src={imageSrc}
					alt="Avatar"
					className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			) : (
				<div className="translate-y-px [&_svg]:size-5 [&_svg]:shrink-0 transition-all duration-300 group-hover:scale-110">
					{icon}
				</div>
			)}
		</div>
	);
});
ChatMessageAvatar.displayName = "ChatMessageAvatar";

// Content component

const chatMessageContentVariants = cva("flex flex-col gap-2 transition-all duration-200", {
	variants: {
		variant: {
			default: "",
			bubble: "px-4 py-3",
			full: "",
		},
		type: {
			incoming: "",
			outgoing: "",
		},
	},
	compoundVariants: [
		{
			variant: "bubble",
			type: "incoming",
			className: "text-foreground",
		},
		{
			variant: "bubble",
			type: "outgoing",
			className: "bg-primary text-primary-foreground rounded-xl rounded-br-none shadow-sm group-hover:shadow-md",
		},
	],
	defaultVariants: {
		variant: "default",
		type: "incoming",
	},
});

interface ChatMessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
	id?: string;
	content: string;
}

const ChatMessageContent = React.forwardRef<
	HTMLDivElement,
	ChatMessageContentProps
>(({ className, content, id: idProp, children, ...props }, ref) => {
	const context = useChatMessage();

	const variant = context?.variant ?? "default";
	const type = context?.type ?? "incoming";
	const id = idProp ?? context?.id ?? "";

	return (
		<div
			ref={ref}
			className={cn(
				chatMessageContentVariants({ variant, type, className }),
				type === "incoming" ? "" : "group-hover:translate-x-[-0.125rem]",
				"transition-transform duration-300"
			)}
			{...props}
		>
			{content.length > 0 && (
				<MarkdownContent 
					id={id} 
					content={content} 
					className={cn(
						"prose-headings:font-semibold prose-p:leading-relaxed",
						type === "incoming" ? "prose-a:text-primary" : "prose-a:text-primary-foreground/90",
						"prose-code:bg-muted/50 prose-code:p-0.5 prose-code:rounded"
					)}
				/>
			)}
			{children}
		</div>
	);
});
ChatMessageContent.displayName = "ChatMessageContent";

// Typing indicator component
interface ChatMessageTypingProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatMessageTyping = React.forwardRef<HTMLDivElement, ChatMessageTypingProps>(
	({ className, ...props }, ref) => {
		return (
			<ChatMessage id="typing-indicator">
				<div 
					ref={ref}
					className={cn(
						"flex items-center gap-1.5 px-4 py-3 ml-4",
						className
					)}
					{...props}
				>
					<div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></div>
					<div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></div>
					<div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></div>
				</div>
			</ChatMessage>
		);
	}
);
ChatMessageTyping.displayName = "ChatMessageTyping";

export { ChatMessage, ChatMessageAvatar, ChatMessageContent, ChatMessageTyping };
