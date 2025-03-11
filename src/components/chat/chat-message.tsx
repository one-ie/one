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
			outgoing: "justify-end ml-auto relative",
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
	"w-8 h-8 flex items-center rounded-full justify-center ring-1 shrink-0 bg-transparent overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md",
	{
		variants: {
			type: {
				incoming: "ring-primary/10 group-hover:ring-primary/20",
				outgoing: "ring-muted-foreground/10 group-hover:ring-muted-foreground/20 self-start",
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
	const icon = iconProps ?? <UserIcon className="text-muted-foreground/70" />;
	
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
				<div className="translate-y-px [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 group-hover:scale-110">
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
			outgoing: "relative",
		},
	},
	compoundVariants: [
		{
			variant: "bubble",
			type: "incoming",
			className: "text-foreground group relative",
		},
		{
			variant: "bubble",
			type: "outgoing",
			className: "bg-[#2a2a2a] text-white rounded-xl rounded-br-none shadow-sm group-hover:shadow-md relative",
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
	onContentChange?: (id: string, newContent: string) => void;
	onResubmit?: (content: string) => void;
}

const ChatMessageContent = React.forwardRef<
	HTMLDivElement,
	ChatMessageContentProps
>(({ className, content, id: idProp, children, onContentChange, onResubmit, ...props }, ref) => {
	const context = useChatMessage();
	const [isEditing, setIsEditing] = React.useState(false);
	const [editedContent, setEditedContent] = React.useState(content);
	const [copyNotification, setCopyNotification] = React.useState(false);
	const editableRef = React.useRef<HTMLDivElement>(null);

	const variant = context?.variant ?? "default";
	const type = context?.type ?? "incoming";
	const id = idProp ?? context?.id ?? "";
	
	const handleEditStart = () => {
		setIsEditing(true);
		setEditedContent(content);
		// Focus the editable div after a short delay to ensure it's rendered
		setTimeout(() => {
			if (editableRef.current) {
				editableRef.current.focus();
				// Place cursor at the end
				const range = document.createRange();
				const sel = window.getSelection();
				range.selectNodeContents(editableRef.current);
				range.collapse(false);
				sel?.removeAllRanges();
				sel?.addRange(range);
			}
		}, 10);
	};

	const handleEditCancel = () => {
		setIsEditing(false);
	};

	const handleEditSave = () => {
		if (onContentChange && id) {
			onContentChange(id, editedContent);
		}
		setIsEditing(false);
	};

	const handleContentEdit = (e: React.FormEvent<HTMLDivElement>) => {
		setEditedContent(e.currentTarget.textContent || "");
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(content)
			.then(() => {
				setCopyNotification(true);
				setTimeout(() => setCopyNotification(false), 2000);
			})
			.catch(err => {
				console.error('Failed to copy: ', err);
			});
	};

	const handleResubmit = () => {
		if (onResubmit) {
			onResubmit(content);
		}
	};

	return (
		<div
			ref={ref}
			className={cn(
				chatMessageContentVariants({ variant, type, className }),
				type === "outgoing" ? "group-hover:translate-x-[-0.125rem]" : "",
				"transition-transform duration-300"
			)}
			{...props}
		>
			{content.length > 0 && (
				<>
					{type === "outgoing" && (
						<>
							{isEditing ? (
								<div className="relative">
									<div 
										ref={editableRef}
										className="outline-none border border-blue-600/30 rounded-lg p-2 focus:ring-1 focus:ring-blue-600/50 text-base"
										contentEditable={true}
										suppressContentEditableWarning={true}
										onInput={handleContentEdit}
										dangerouslySetInnerHTML={{ __html: content }}
									/>
									<div className="flex gap-2 mt-2 justify-end">
										<button 
											onClick={handleEditCancel}
											className="w-9 h-9 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all duration-200 flex items-center justify-center"
											aria-label="Cancel edit"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<line x1="18" y1="6" x2="6" y2="18"></line>
												<line x1="6" y1="6" x2="18" y2="18"></line>
											</svg>
										</button>
										<button 
											onClick={handleEditSave}
											className="w-9 h-9 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all duration-200 flex items-center justify-center"
											aria-label="Save edit"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
												<polyline points="17 21 17 13 7 13 7 21"></polyline>
												<polyline points="7 3 7 8 15 8"></polyline>
											</svg>
										</button>
									</div>
								</div>
							) : (
								<div className="relative group/message">
									<button 
										onClick={handleEditStart}
										className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-[calc(100%+12px)] w-8 h-8 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all duration-200 flex items-center justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible z-10"
										aria-label="Edit message"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
										</svg>
									</button>
									<div className="text-base">{content}</div>
								</div>
							)}
						</>
					)}
					{type === "incoming" && (
						<div className="flex flex-col gap-3">
							<MarkdownContent 
								id={id} 
								content={content} 
								className={cn(
									"prose-headings:font-semibold prose-p:leading-relaxed text-base",
									"prose-a:text-blue-500",
									"prose-code:bg-muted/50 prose-code:p-0.5 prose-code:rounded"
								)}
							/>
							<div className="flex gap-2 mt-1 relative">
								<button 
									onClick={handleCopy}
									className="w-9 h-9 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all duration-200 flex items-center justify-center relative"
									aria-label="Copy message"
								>
									{copyNotification && (
										<span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 text-xs py-1 px-2 rounded whitespace-nowrap">
											Copied!
										</span>
									)}
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
										<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
									</svg>
								</button>
								<button 
									onClick={handleResubmit}
									className="w-9 h-9 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all duration-200 flex items-center justify-center"
									aria-label="Resubmit message"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
										<path d="M3 3v5h5"></path>
									</svg>
								</button>
							</div>
						</div>
					)}
				</>
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
