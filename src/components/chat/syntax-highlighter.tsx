import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useState } from "react";

interface CodeProps {
  language: string;
  children: string;
}

// Copy button component for code blocks
export interface CopyButtonProps {
  code: string;
}

export const CopyButton = ({ code }: CopyButtonProps) => {
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
      className="absolute top-0 right-0 w-8 h-8 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-zinc-100 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
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

// Custom syntax highlighting theme to match the screenshot exactly
const customSyntaxTheme = {
  'comment': { color: '#6A9955' },                  // Green for comments
  'prolog': { color: '#d4d4d4' },
  'doctype': { color: '#d4d4d4' },
  'cdata': { color: '#d4d4d4' },
  'punctuation': { color: '#d4d4d4' },              // Light gray for punctuation
  'namespace': { opacity: 0.7 },
  'property': { color: '#9cdcfe' },                 // Light blue for properties
  'tag': { color: '#569cd6' },                      // Blue for tags
  'boolean': { color: '#569cd6' },                  // Blue for booleans
  'number': { color: '#b5cea8' },                   // Light green for numbers
  'constant': { color: '#9cdcfe' },                 // Light blue for constants
  'symbol': { color: '#b5cea8' },
  'selector': { color: '#d7ba7d' },
  'attr-name': { color: '#9cdcfe' },                // Light blue for attribute names
  'string': { color: '#ce9178' },                   // Orange-red for strings
  'char': { color: '#ce9178' },
  'builtin': { color: '#4ec9b0' },                  // Teal for built-ins
  'inserted': { color: '#ce9178' },
  'operator': { color: '#d4d4d4' },                 // Light gray for operators
  'entity': { color: '#4ec9b0', cursor: 'help' },
  'url': { color: '#ce9178' },
  'atrule': { color: '#c586c0' },                   // Purple for at-rules
  'attr-value': { color: '#ce9178' },               // Orange-red for attribute values
  'keyword': { color: '#569cd6' },                  // Blue for keywords like import
  'function': { color: '#dcdcaa' },                 // Yellow for function names
  'regex': { color: '#d16969' },
  'important': { color: '#569cd6', fontWeight: 'bold' },
  'variable': { color: '#9cdcfe' },                 // Light blue for variables
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' },
  'deleted': { color: '#ce9178' },
  'class-name': { color: '#4ec9b0' },               // Teal for class names
  'maybe-class-name': { color: '#4ec9b0' },         // Teal for possible class names
  'parameter': { color: '#9cdcfe' },                // Light blue for parameters
  'imports': { color: '#569cd6' },                  // Blue for import keyword
  'exports': { color: '#569cd6' },                  // Blue for export keyword
  'jsx-tag': { color: '#569cd6' },                  // Blue for JSX tags
  'jsx-expression': { color: '#d4d4d4' },           // Light gray for JSX expressions
  'jsx-attr-name': { color: '#9cdcfe' },            // Light blue for JSX attribute names
  'jsx-attr-value': { color: '#ce9178' },           // Orange-red for JSX attribute values
  // Bash specific colors
  'bash': { color: '#d4d4d4' },
  'bash-keyword': { color: '#569cd6' },
  'bash-command': { color: '#9b37ff' },             // Purple for npm command
};

export const CodeHighlighter = ({ language, children }: CodeProps) => {
  const customStyles = {
    margin: 0,
    width: "100%",
    background: "#1e1e1e",                          // VS Code dark theme background
    padding: "1rem",                                // Reduced padding to match image
    fontSize: "14px",                               // VS Code default font size
    lineHeight: "1.5",                              // Proper line height
    borderRadius: "0",                              // No border radius for code area
    fontFamily: "'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", // VS Code-like font
    overflow: "visible",                            // Ensure content is visible
  };

  // Special handling for npm commands to make them purple
  let processedCode = children;
  if (language === 'bash' && children.includes('npm')) {
    processedCode = children.replace(/npm/, '<span style="color: #9b37ff;">npm</span>');
  }

  return (
    <div className="relative group overflow-hidden bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between h-8 bg-[#252526] border-b border-[#1e1e1e]">
        <span className="px-4 text-sm text-[#cccccc] font-mono lowercase">{language}</span>
        <CopyButton code={children} />
      </div>
      
      {/* Code content */}
      <div className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-auto">
        {language === 'bash' && children.includes('npm') ? (
          <div 
            style={{
              ...customStyles,
              padding: "1rem",
              fontFamily: "'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
              fontSize: "14px",
            }}
            dangerouslySetInnerHTML={{ __html: processedCode }}
          />
        ) : (
          <SyntaxHighlighter
            language={language}
            style={customSyntaxTheme}
            customStyle={customStyles}
            PreTag="div"
            codeTagProps={{
              style: {
                fontFamily: "'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
                fontSize: "14px",
              }
            }}
          >
            {children}
          </SyntaxHighlighter>
        )}
      </div>
      <CopyButton code={children} />
    </div>
  );
};
