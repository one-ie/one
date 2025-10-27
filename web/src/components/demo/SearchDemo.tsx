import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';

interface SearchResult {
  _id: string;
  content: string;
  similarity: number;
  thingName: string;
  thingType: string;
  source?: string;
}

// Mock search results for demo
const MOCK_KNOWLEDGE_BASE: SearchResult[] = [
  {
    _id: 'k_1',
    content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
    similarity: 0.95,
    thingName: 'Machine Learning Fundamentals',
    thingType: 'course',
    source: 'ML 101 Course',
  },
  {
    _id: 'k_2',
    content: 'Neural networks are computing systems inspired by biological neural networks that constitute animal brains. They are the foundation of deep learning.',
    similarity: 0.87,
    thingName: 'Deep Learning Guide',
    thingType: 'blog_post',
    source: 'AI Learning Path',
  },
  {
    _id: 'k_3',
    content: 'Python is a high-level, interpreted programming language known for its simplicity and readability. It is widely used in machine learning and data science.',
    similarity: 0.76,
    thingName: 'Python for ML',
    thingType: 'course',
    source: 'Tech Academy',
  },
  {
    _id: 'k_4',
    content: 'Vector embeddings convert text into high-dimensional numerical representations that capture semantic meaning. They are essential for semantic search.',
    similarity: 0.82,
    thingName: 'Embeddings & Vectors',
    thingType: 'article',
    source: 'Knowledge Base',
  },
  {
    _id: 'k_5',
    content: 'Natural language processing (NLP) is a branch of artificial intelligence that helps computers understand, interpret, and generate human language.',
    similarity: 0.78,
    thingName: 'NLP Essentials',
    thingType: 'blog_post',
    source: 'AI Series',
  },
  {
    _id: 'k_6',
    content: 'Clustering algorithms group similar data points together without labeled data. K-means and hierarchical clustering are popular unsupervised learning methods.',
    similarity: 0.65,
    thingName: 'Unsupervised Learning',
    thingType: 'course',
    source: 'Data Science 101',
  },
  {
    _id: 'k_7',
    content: 'Data preprocessing involves cleaning, transforming, and organizing raw data before feeding it into machine learning models for training.',
    similarity: 0.72,
    thingName: 'Data Preparation',
    thingType: 'guide',
    source: 'ML Handbook',
  },
  {
    _id: 'k_8',
    content: 'Semantic search uses embeddings to find content based on meaning rather than exact keywords, enabling more intelligent and context-aware search results.',
    similarity: 0.91,
    thingName: 'Semantic Search Guide',
    thingType: 'article',
    source: 'Knowledge Base',
  },
];

// Query suggestions for autocomplete
const QUERY_SUGGESTIONS = [
  'machine learning',
  'artificial intelligence',
  'neural networks',
  'data science',
  'embeddings',
  'semantic search',
  'python programming',
  'natural language processing',
];

export function SearchDemo() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Simulate semantic search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setSuggestions([]);
    setShowSuggestions(false);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Simple mock semantic matching
    const queryLower = searchQuery.toLowerCase();
    const filtered = MOCK_KNOWLEDGE_BASE.filter(item => {
      const content = item.content.toLowerCase();
      const name = item.thingName.toLowerCase();
      return content.includes(queryLower) || name.includes(queryLower);
    })
      // Sort by similarity (simulated)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    // Add some randomness to similarity for demo
    const withVariance = filtered.map(item => ({
      ...item,
      similarity: Math.max(0.5, item.similarity + (Math.random() - 0.5) * 0.1),
    }));

    setResults(withVariance);
    setIsLoading(false);
  };

  // Handle input change for autocomplete
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (value.trim().length > 0) {
      const filtered = QUERY_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && showSuggestions) {
        selectSuggestion(suggestions[selectedIndex]);
      } else {
        performSearch(query);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Auto-search when query changes (simulate real-time)
  useEffect(() => {
    if (query.trim()) {
      const timer = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [query]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Try: 'machine learning', 'embeddings', 'neural networks'..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white text-slate-900"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-3 h-5 w-5 text-indigo-600 animate-spin" />
          )}
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => selectSuggestion(suggestion)}
                className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition ${
                  index === selectedIndex ? 'bg-indigo-100' : ''
                } ${index === 0 ? 'rounded-t-lg' : ''} ${
                  index === suggestions.length - 1 ? 'rounded-b-lg' : ''
                }`}
              >
                <Search className="inline-block h-4 w-4 mr-2 text-slate-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {results.length === 0 && !isLoading && query.trim() && (
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No results found for "{query}"</p>
          <p className="text-sm text-slate-500 mt-2">Try different keywords or phrases</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={result._id}
            className="bg-slate-50 rounded-lg p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition group cursor-pointer"
          >
            {/* Result Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                  {result.thingName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    {result.thingType}
                  </span>
                  {result.source && (
                    <span className="text-xs text-slate-500">
                      From: {result.source}
                    </span>
                  )}
                </div>
              </div>

              {/* Similarity Score */}
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                      style={{ width: `${result.similarity * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-12 text-right">
                    {(result.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Result Content */}
            <p className="text-sm text-slate-600 line-clamp-2 group-hover:text-slate-700">
              {result.content}
            </p>

            {/* Result Footer */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Result #{index + 1}
              </span>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium group-hover:opacity-100 opacity-0 transition">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Search Stats */}
      {results.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-4 text-sm text-slate-600">
          <p>
            Found <span className="font-semibold text-indigo-600">{results.length}</span> relevant results
            for "<span className="font-semibold">{query}</span>"
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Results ranked by semantic similarity. Higher percentages = better matches.
          </p>
        </div>
      )}

      {/* Example Queries */}
      {results.length === 0 && !isLoading && !query.trim() && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6">
          <p className="text-sm font-semibold text-slate-900 mb-3">Try these example searches:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['machine learning', 'embeddings', 'neural networks', 'data science'].map(
              example => (
                <button
                  key={example}
                  onClick={() => {
                    setQuery(example);
                    handleInputChange(example);
                  }}
                  className="text-left text-sm px-3 py-2 bg-white rounded border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition"
                >
                  <Search className="inline-block h-3 w-3 mr-2" />
                  {example}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-slate-50 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-slate-900 text-sm mb-2">How Semantic Search Works</h4>
        <ol className="text-xs text-slate-600 space-y-1">
          <li>1. Your query is converted to a vector (1,536 dimensions)</li>
          <li>2. System searches knowledge base for similar vectors</li>
          <li>3. Results ranked by cosine similarity (0-100%)</li>
          <li>4. Most relevant results appear first</li>
        </ol>
      </div>
    </div>
  );
}
