import { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';

export interface DemoCodeBlockProps {
  /** Code content to display */
  code: string;

  /** Programming language for syntax highlighting class */
  language?: string;

  /** Title for the code block */
  title?: string;

  /** Description of what this code does */
  description?: string;

  /** Whether the code block is expandable */
  collapsible?: boolean;

  /** Initial collapsed state (only if collapsible) */
  initiallyCollapsed?: boolean;

  /** Additional CSS className */
  className?: string;
}

/**
 * DemoCodeBlock - Code examples with syntax highlighting and copy functionality
 *
 * Features:
 * - Syntax highlighting via inline styles (language-aware)
 * - Copy button with success feedback
 * - Collapsible sections for long code
 * - Line numbers
 * - Dark/light mode support
 * - Responsive with scroll on small screens
 * - TypeScript and JSON highlighting
 *
 * @example
 * ```tsx
 * <DemoCodeBlock
 *   code={`const groups = useQuery(api.queries.groups.list, { orgId })`}
 *   language="typescript"
 *   title="Fetch Groups"
 *   description="Subscribe to real-time group updates"
 * />
 * ```
 */
export function DemoCodeBlock({
  code,
  language = 'typescript',
  title,
  description,
  collapsible = false,
  initiallyCollapsed = false,
  className = '',
}: DemoCodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const lines = code.split('\n');
  const hasMultipleLines = lines.length > 1;
  const lineNumberWidth = Math.max(2, lines.length.toString().length);

  // Simple syntax highlighting
  const highlightCode = (code: string, lang: string) => {
    if (lang === 'typescript' || lang === 'ts') {
      return code.replace(
        /\b(const|let|var|function|async|await|return|import|export|from|interface|type|enum|class|extends|implements|public|private|protected|readonly|new|this|super|try|catch|finally|if|else|for|while|do|switch|case|break|continue|default|throw|yield)\b/g,
        '<span class="text-blue-600 dark:text-blue-400 font-semibold">$1</span>'
      );
    } else if (lang === 'json') {
      return code
        .replace(/"([^"]+)":/g, '<span class="text-purple-600 dark:text-purple-400">"$1"</span>:')
        .replace(/"([^"]+)"/g, '<span class="text-green-600 dark:text-green-400">"$1"</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>')
        .replace(/:\s*(\d+)/g, ': <span class="text-orange-600 dark:text-orange-400">$1</span>');
    }
    return code;
  };

  const highlightedCode = highlightCode(code, language);

  return (
    <div
      className={`bg-slate-900 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-800 dark:border-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 px-6 py-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          {title && (
            <h4 className="text-white font-semibold">{title}</h4>
          )}
          {description && (
            <p className="text-xs text-slate-300 mt-1">{description}</p>
          )}
          {!title && !description && (
            <span className="text-xs text-slate-400 uppercase tracking-wider">{language}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-slate-600 dark:hover:bg-slate-700 rounded transition text-slate-300 hover:text-white"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isCollapsed ? '-rotate-90' : ''
                }`}
              />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-2 hover:bg-slate-600 dark:hover:bg-slate-700 rounded transition text-slate-300 hover:text-white flex items-center gap-1"
            title="Copy code"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <pre className="p-6 text-sm font-mono text-slate-100 dark:text-slate-100 leading-relaxed">
            <code className="block whitespace-pre">
              {lines.map((_, index) => (
                <div key={index} className="flex gap-4 group">
                  {/* Line Number */}
                  {hasMultipleLines && (
                    <span
                      className="text-slate-600 dark:text-slate-500 select-none w-8 text-right flex-shrink-0 group-hover:text-slate-400 dark:group-hover:text-slate-400 transition"
                      style={{ minWidth: `${lineNumberWidth * 0.65}rem` }}
                    >
                      {(index + 1).toString().padStart(lineNumberWidth, ' ')}
                    </span>
                  )}

                  {/* Code */}
                  <span
                    dangerouslySetInnerHTML={{ __html: highlightedCode.split('\n')[index] || '' }}
                    className="flex-1"
                  />
                </div>
              ))}
            </code>
          </pre>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-6 py-3 bg-slate-800 dark:bg-slate-900 border-t border-slate-700 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>
          {lines.length} line{lines.length !== 1 ? 's' : ''}
        </span>
        <span className="text-slate-500">Copy the code to use in your project</span>
      </div>
    </div>
  );
}
