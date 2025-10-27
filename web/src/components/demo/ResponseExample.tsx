import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ResponseExampleProps {
  title: string;
  example: any;
}

export default function ResponseExample({ title, example }: ResponseExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(example, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition"
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono text-slate-700 overflow-x-auto">
        <code>{JSON.stringify(example, null, 2)}</code>
      </pre>
    </div>
  );
}
