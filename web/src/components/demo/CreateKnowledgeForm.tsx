import { useState } from 'react';
import { Loader2, Plus, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CreateKnowledgeFormProps {
  onSubmit?: (data: any) => Promise<void>;
}

export default function CreateKnowledgeForm({ onSubmit }: CreateKnowledgeFormProps) {
  const [content, setContent] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!content.trim()) {
      setError('Please enter knowledge content');
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit({ content, labels });
      } else {
        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setSuccess(true);
      setContent('');
      setLabels([]);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create knowledge');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300">
          Knowledge item created successfully!
        </div>
      )}

      {/* Content Input */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Knowledge Content
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter knowledge text or documentation..."
          className="min-h-24 resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {content.length} characters
        </p>
      </div>

      {/* Labels */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Labels (Categories)
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            type="text"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddLabel();
              }
            }}
            placeholder="Add label and press Enter..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={handleAddLabel}
            variant="outline"
            size="sm"
            disabled={isLoading || !labelInput.trim()}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Add
          </Button>
        </div>

        {/* Selected Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {labels.map((label) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
              >
                <Tag size={14} />
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  className="hover:opacity-70 transition"
                  disabled={isLoading}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {labels.length} label{labels.length !== 1 ? 's' : ''} added
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Creating...
          </>
        ) : (
          <>
            <Plus size={16} className="mr-2" />
            Create Knowledge Item
          </>
        )}
      </Button>

      {/* Info Box */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
        Knowledge items are indexed and searchable immediately. Labels help organize and categorize content for better discovery.
      </div>
    </form>
  );
}
