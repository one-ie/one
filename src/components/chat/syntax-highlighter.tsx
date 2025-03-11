import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useState } from "react";

interface CodeProps {
  language: string;
  children: string;
}

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
      className="absolute bottom-0 right-0 translate-y-full -translate-x-2 mt-1 w-8 h-8 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all duration-200 flex items-center justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible z-10"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-200 text-xs py-1 px-2 rounded whitespace-nowrap">
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

export const CodeHighlighter = ({ language, children }: CodeProps) => {
  return (
    <div className="relative group rounded-lg overflow-hidden mb-6">
      <div className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SyntaxHighlighter
          language={language}
          style={coldarkDark}
          customStyle={{
            margin: 0,
            width: "100%",
            background: "#18181b", // zinc-950
            padding: "0 1rem",
            fontSize: "0.875rem", // 14px
            lineHeight: "1.5", // For better readability
            borderRadius: "0.5rem",
          }}
          PreTag="div"
        >
          {children}
        </SyntaxHighlighter>
      </div>
      <CopyButton code={children} />
    </div>
  );
};
