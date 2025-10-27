import { Code2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeExample {
  title: string;
  language: string;
  code: string;
}

const examples: CodeExample[] = [
  {
    title: 'Semantic Search Query',
    language: 'typescript',
    code: `// Search knowledge with semantic matching
import { useKnowledgeSearch } from '@/hooks/useKnowledgeSearch';

export function SearchKnowledge() {
  const [query, setQuery] = useState('machine learning');
  const { results, isLoading } = useKnowledgeSearch(query);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search knowledge..."
      />
      {results?.map(result => (
        <div key={result._id}>
          <h3>{result.title}</h3>
          <p>{result.text}</p>
          <span className="text-sm">
            Match: {(result.similarity * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}`
  },
  {
    title: 'Create Knowledge Item',
    language: 'typescript',
    code: `// Create and index new knowledge
import { useCreateKnowledge } from '@/hooks/useCreateKnowledge';

export function CreateKnowledge() {
  const createKnowledge = useCreateKnowledge();

  const handleCreate = async (data) => {
    try {
      const result = await createKnowledge({
        text: 'Machine learning is a subset of AI...',
        labels: ['ai', 'ml', 'tutorial'],
        sourceEntityId: courseId,
        metadata: {
          category: 'technical',
          difficulty: 'intermediate'
        }
      });
      console.log('Created:', result._id);
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={handleCreate}>Create</button>;
}`
  },
  {
    title: 'Retrieve for RAG',
    language: 'typescript',
    code: `// Retrieve knowledge for RAG pipeline
import { useKnowledgeRetrieve } from '@/hooks/useKnowledgeRetrieve';

export function RagContext() {
  const { retrieve } = useKnowledgeRetrieve();

  const generateResponse = async (userQuery) => {
    // Get top 5 relevant knowledge items
    const context = await retrieve(userQuery, { limit: 5 });

    // Inject into LLM prompt
    const prompt = \`
Context:
\${context.map(k => k.text).join('\\n')}

Question: \${userQuery}
\`;

    // Send to LLM
    const response = await llm.generate(prompt);

    // Return with citations
    return {
      answer: response,
      sources: context.map(k => k.sourceEntity)
    };
  };

  return <div>RAG Response Generator</div>;
}`
  },
  {
    title: 'Filter with Labels',
    language: 'typescript',
    code: `// Search with label filtering
import { useKnowledgeSearch } from '@/hooks/useKnowledgeSearch';

export function FilteredSearch() {
  const [query, setQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const { results } = useKnowledgeSearch(query, {
    filters: {
      labels: selectedLabels,
      minSimilarity: 0.6  // Only 60%+ matches
    },
    sortBy: 'similarity'
  });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="filters">
        {['ai', 'ml', 'tutorial'].map(label => (
          <label key={label}>
            <input
              type="checkbox"
              checked={selectedLabels.includes(label)}
              onChange={(e) => {
                setSelectedLabels(e.target.checked
                  ? [...selectedLabels, label]
                  : selectedLabels.filter(l => l !== label)
                );
              }}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="results">
        {results?.map(r => <div key={r._id}>{r.text}</div>)}
      </div>
    </div>
  );
}`
  },
  {
    title: 'REST API: Search',
    language: 'bash',
    code: `# Search knowledge with REST API
curl -X POST "https://api.one.ie/api/knowledge/search" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "machine learning basics",
    "limit": 10,
    "minSimilarity": 0.5,
    "filters": {
      "labels": ["tutorial", "beginner"],
      "sourceType": "course"
    }
  }'

# Response:
{
  "data": [
    {
      "_id": "k_1",
      "text": "Machine learning is a subset of...",
      "similarity": 0.95,
      "labels": ["ai", "ml", "tutorial"],
      "sourceEntity": { ... },
      "createdAt": 1698765432000
    }
  ],
  "total": 42,
  "executionTime": "42ms"
}`
  },
  {
    title: 'REST API: Create',
    language: 'bash',
    code: `# Create knowledge item via REST API
curl -X POST "https://api.one.ie/api/knowledge" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Vector embeddings convert text into numbers...",
    "labels": ["embeddings", "ml", "vectors"],
    "sourceEntityId": "course_123",
    "metadata": {
      "category": "technical",
      "difficulty": "advanced",
      "author": "data_scientist"
    }
  }'

# Response:
{
  "data": {
    "_id": "k_new_1",
    "text": "Vector embeddings convert text into numbers...",
    "labels": ["embeddings", "ml", "vectors"],
    "similarity": null,
    "embedding": [0.123, 0.456, ..., 0.789],
    "createdAt": 1698765432000
  }
}`
  }
];

export default function SearchCodeExamples() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Code2 size={24} />
          Code Examples & API
        </h2>
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
        {examples.map((example, index) => (
          <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden flex flex-col">
            {/* Example Header */}
            <div className="bg-slate-50 dark:bg-slate-700 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {example.title}
                </h3>
                <button
                  onClick={() => handleCopy(example.code, index)}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition text-slate-600 dark:text-slate-400"
                  title="Copy code"
                >
                  {copiedIndex === index ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{example.language}</p>
            </div>

            {/* Code Block */}
            <pre className="flex-1 p-4 overflow-x-auto bg-slate-900 text-slate-100 text-xs font-mono">
              <code>{example.code}</code>
            </pre>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Key API Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-mono text-green-600 dark:text-green-400 font-semibold">POST /api/knowledge</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">Create knowledge item</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">POST /api/knowledge/search</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">Semantic search</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold">GET /api/knowledge/:id</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">Get specific item</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-mono text-orange-600 dark:text-orange-400 font-semibold">POST /api/knowledge/retrieve</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">RAG retrieval</p>
          </div>
        </div>
      </div>
    </div>
  );
}
