import { cn } from "@/lib/utils";
import { marked } from "marked";
import * as React from "react";
import { Suspense, isValidElement, memo, useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const DEFAULT_PRE_BLOCK_CLASS =
	"my-4 overflow-x-auto w-fit rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-900 border border-border p-4 relative text-base";

const extractTextContent = (node: React.ReactNode): string => {
  type ReactElementWithChildren = React.ReactElement & {
    props: { children?: React.ReactNode }
  };
	if (typeof node === "string") {
		return node;
	}
	if (Array.isArray(node)) {
		return node.map(extractTextContent).join("");
	}
	if (isValidElement(node)) {
	  const element = node as ReactElementWithChildren;
	  return extractTextContent(element.props.children || '');
	}
	return "";
};

interface HighlightedPreProps extends React.HTMLAttributes<HTMLPreElement> {
	language: string;
}

// Convert AsyncHighlightedPre to a regular component that uses useEffect
const AsyncHighlightedPre = ({ children, className, language, ...props }: HighlightedPreProps) => {
  const [content, setContent] = React.useState<JSX.Element>(
    <pre {...props} className={cn(DEFAULT_PRE_BLOCK_CLASS, className)}>
      <code className="whitespace-pre-wrap text-base">{children}</code>
      <CopyButton code={extractTextContent(children)} />
    </pre>
  );

  React.useEffect(() => {
    const renderHighlightedCode = async () => {
      const { codeToTokens, bundledLanguages } = await import("shiki");
      const code = extractTextContent(children);

      if (!(language in bundledLanguages)) {
        return;
      }

      const { tokens } = await codeToTokens(code, {
        lang: language as keyof typeof bundledLanguages,
        themes: {
          light: "github-dark",
          dark: "github-dark",
        },
      });

      setContent(
        <pre {...props} className={cn(DEFAULT_PRE_BLOCK_CLASS, className)}>
          <code className="whitespace-pre-wrap text-base">
            {tokens.map((line, lineIndex) => (
              <span key={`line-${lineIndex}`}>
                {line.map((token, tokenIndex) => {
                  const style = typeof token.htmlStyle === "string" ? undefined : token.htmlStyle;
                  return (
                    <span key={`token-${tokenIndex}`} style={style}>
                      {token.content}
                    </span>
                  );
                })}
                {lineIndex !== tokens.length - 1 && "\n"}
              </span>
            ))}
          </code>
          <CopyButton code={code} />
        </pre>
      );
    };

    renderHighlightedCode();
  }, [children, className, language, props]);

  return content;
};

// Copy button component for code blocks
const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors flex items-center justify-center"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
            Copied!
          </span>
        </>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
};

// Update HighlightedPre to use the new component
const HighlightedPre = memo(({ children, className, language, ...props }: HighlightedPreProps) => {
  return (
    <Suspense
      fallback={
        <pre {...props} className={cn(DEFAULT_PRE_BLOCK_CLASS, className)}>
          <code className="whitespace-pre-wrap text-base">{children}</code>
          <CopyButton code={extractTextContent(children)} />
        </pre>
      }
    >
      <AsyncHighlightedPre language={language} className={className} {...props}>
        {children}
      </AsyncHighlightedPre>
    </Suspense>
  );
});

HighlightedPre.displayName = "HighlightedPre";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
	language: string;
}

const CodeBlock = ({
	children,
	language,
	className,
	...props
}: CodeBlockProps) => {
	return (
		<Suspense
			fallback={
				<pre {...props} className={cn(DEFAULT_PRE_BLOCK_CLASS, className)}>
					<code className="whitespace-pre-wrap text-base">{children}</code>
          <CopyButton code={extractTextContent(children)} />
				</pre>
			}
		>
			<HighlightedPre language={language} {...props}>
				{children}
			</HighlightedPre>
		</Suspense>
	);
};

CodeBlock.displayName = "CodeBlock";

const components: Partial<Components> = {
	h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h1 className="mt-2 scroll-m-20 text-4xl font-bold" {...props}>
			{children}
		</h1>
	),
	h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h2
			className="mt-8 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0"
			{...props}
		>
			{children}
		</h2>
	),
	h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h3
			className="mt-4 scroll-m-20 text-xl font-semibold tracking-tight"
			{...props}
		>
			{children}
		</h3>
	),
	h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h4
			className="mt-4 scroll-m-20 text-lg font-semibold tracking-tight"
			{...props}
		>
			{children}
		</h4>
	),
	h5: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h5
			className="mt-4 scroll-m-20 text-lg font-semibold tracking-tight"
			{...props}
		>
			{children}
		</h5>
	),
	h6: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h6
			className="mt-4 scroll-m-20 text-base font-semibold tracking-tight"
			{...props}
		>
			{children}
		</h6>
	),
	p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
		<p className="leading-7 text-base [&:not(:first-child)]:mt-4" {...props}>
			{children}
		</p>
	),
	strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
		<span className="font-semibold" {...props}>
			{children}
		</span>
	),
	a: ({
		children,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
		<a
			className="font-medium underline underline-offset-4 text-base"
			target="_blank"
			rel="noreferrer"
			{...props}
		>
			{children}
		</a>
	),
	ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
		<ol className="my-4 ml-6 list-decimal text-base" {...props}>
			{children}
		</ol>
	),
	ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
		<ul className="my-4 ml-6 list-disc text-base" {...props}>
			{children}
		</ul>
	),
	li: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
		<li className="mt-2 text-base" {...props}>
			{children}
		</li>
	),
	blockquote: ({
		children,
		...props
	}: React.HTMLAttributes<HTMLQuoteElement>) => (
		<blockquote className="mt-4 border-l-2 pl-6 italic text-base" {...props}>
			{children}
		</blockquote>
	),
	hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
		<hr className="my-4 md:my-8" {...props} />
	),
	table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
		<div className="my-6 w-full overflow-y-auto">
			<table
				className="relative w-full overflow-hidden border-none text-base"
				{...props}
			>
				{children}
			</table>
		</div>
	),
	tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
		<tr className="last:border-b-none m-0 border-b" {...props}>
			{children}
		</tr>
	),
	th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
		<th
			className="px-4 py-2 text-left font-bold text-base [&[align=center]]:text-center [&[align=right]]:text-right"
			{...props}
		>
			{children}
		</th>
	),
	td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
		<td
			className="px-4 py-2 text-left text-base [&[align=center]]:text-center [&[align=right]]:text-right"
			{...props}
		>
			{children}
		</td>
	),
	img: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
		// biome-ignore lint/a11y/useAltText: alt is not required
		<img className="rounded-md" alt={alt} {...props} />
	),
	code: ({ node, inline, className, children, ...props }: any) => {
		const match = /language-(\w+)/.exec(className || "");
		if (inline) {
			return (
				<code
					className={cn("rounded px-1 py-0.5 bg-muted/50 text-base", className)}
					{...props}
				>
					{children}
				</code>
			);
		}

		return (
			<CodeBlock
				language={(match && match[1]) || ""}
				className={className}
				{...props}
			>
				{String(children).replace(/\n$/, "")}
			</CodeBlock>
		);
	},
	pre: ({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
		return (
			<pre className={cn(DEFAULT_PRE_BLOCK_CLASS, className)} {...props}>
				{children}
			</pre>
		);
	},
};

function parseMarkdownIntoBlocks(markdown: string): string[] {
	if (!markdown) {
		return [];
	}
	const tokens = marked.lexer(markdown);
	return tokens.map((token) => token.raw);
}

interface MarkdownBlockProps {
	content: string;
	className?: string;
}

const MemoizedMarkdownBlock = memo(
	({ content, className }: MarkdownBlockProps) => {
		return (
		  <div className={className}>
		    <ReactMarkdown
		      remarkPlugins={[remarkGfm]}
		      components={components}
		    >
		      {content}
		    </ReactMarkdown>
		  </div>
		);
	},
	(prevProps, nextProps) => {
		if (prevProps.content !== nextProps.content) {
			return false;
		}
		return true;
	},
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

interface MarkdownContentProps {
	content: string;
	id: string;
	className?: string;
}

export const MarkdownContent = memo(
	({ content, id, className }: MarkdownContentProps) => {
		const blocks = useMemo(
			() => parseMarkdownIntoBlocks(content || ""),
			[content],
		);

		return blocks.map((block, index) => (
			<MemoizedMarkdownBlock
				content={block}
				className={className}
				key={`${id}-block_${
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					index
				}`}
			/>
		));
	},
);

MarkdownContent.displayName = "MarkdownContent";
