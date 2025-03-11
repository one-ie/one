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
      className="absolute top-3 right-3 w-8 h-8 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-zinc-100 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
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

// Custom syntax highlighting theme to match the image
const customSyntaxTheme = {
  ...coldarkDark,
  'keyword': { color: '#569CD6' },       // Blue for keywords like import, const, return
  'function': { color: '#DCDCAA' },      // Yellow for function names
  'string': { color: '#CE9178' },        // Orange-red for strings
  'comment': { color: '#6A9955' },       // Green for comments
  'punctuation': { color: '#D4D4D4' },   // Light gray for punctuation
  'operator': { color: '#D4D4D4' },      // Light gray for operators
  'variable': { color: '#9CDCFE' },      // Light blue for variables
  'class-name': { color: '#4EC9B0' },    // Teal for class names
  'parameter': { color: '#9CDCFE' },     // Light blue for parameters
  'property': { color: '#9CDCFE' },      // Light blue for properties
  'builtin': { color: '#569CD6' },       // Blue for built-in functions
};

export const CodeHighlighter = ({ language, children }: CodeProps) => {
  const customStyles = {
    margin: 0,
    width: "100%",
    background: "#1e1e1e", // Darker background like in the image
    padding: "1rem",
    fontSize: "0.9rem",
    lineHeight: "1.5",
    borderRadius: "0.5rem",
    fontFamily: "'JetBrains Mono', monospace",
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-[#1e1e1e] border border-zinc-800">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-zinc-800">
        <span className="text-sm text-zinc-400 font-mono lowercase">{language}</span>
      </div>
      
      {/* Code content */}
      <div className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SyntaxHighlighter
          language={language}
          style={customSyntaxTheme}
          customStyle={customStyles}
          PreTag="div"
        >
          {children}
        </SyntaxHighlighter>
      </div>
      <CopyButton code={children} />
    </div>
  );
};
