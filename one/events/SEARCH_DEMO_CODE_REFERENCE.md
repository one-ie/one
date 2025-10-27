# Search/Knowledge Demo - Code Reference

## Page Structure

### Main Page (`/demo/search`)

The page uses Astro for server-side rendering with the following structure:

```astro
Layout (meta, styling)
  ↓
DemoContainer (header, status, connection)
  ↓
  DemoHero (title, badges, description)
  ↓
  What is Knowledge? (info section)
  ↓
  DemoPlayground
    ├─ CreateKnowledgeForm (left form)
    └─ Knowledge items display (right data)
  ↓
  SearchDemo (interactive search interface)
  ↓
  SearchCodeExamples (6 code examples)
  ↓
  KnowledgeStats (5-card metrics)
  ↓
  Use Cases (info cards)
  ↓
  6-Dimension Circle (navigation)
  ↓
  Navigation Links (next steps)
```

## Component APIs

### CreateKnowledgeForm

**Props:**
```typescript
interface CreateKnowledgeFormProps {
  onSubmit?: (data: {
    content: string;
    labels: string[];
  }) => Promise<void>;
}
```

**Features:**
- Textarea for knowledge content
- Label management (add/remove)
- Form validation
- Loading state
- Error/success messaging

**Usage:**
```tsx
<CreateKnowledgeForm
  onSubmit={async (data) => {
    // Submit to backend
    await fetch('/api/knowledge', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }}
/>
```

### KnowledgeStats

**Props:**
```typescript
interface KnowledgeStatsProps {
  itemCount: number;
  backendConnected: boolean;
}
```

**Display:**
- Total items
- Average latency (42ms)
- Embedding dimensions (1.5K)
- Search accuracy (94%)
- Backend status

**Usage:**
```tsx
<KnowledgeStats
  itemCount={knowledgeItems.length}
  backendConnected={backendConnected}
/>
```

### SearchCodeExamples

**No Props** - Self-contained component

**Displays:**
- 6 code examples (TypeScript and Bash)
- Copy-to-clipboard for each example
- API endpoints reference
- Responsive grid layout

**Usage:**
```tsx
<SearchCodeExamples />
```

## Data Fetching

### Server-Side (Astro)

```astro
---
// Fetch real knowledge data in Astro frontmatter
const { DEMO_BACKEND_URL, DEMO_GROUP_ID } = await import('@/config/demo');

let knowledgeItems = [];
let backendConnected = false;

try {
  const response = await fetch(
    `${DEMO_BACKEND_URL}/http/knowledge?groupId=${DEMO_GROUP_ID}`
  );
  if (response.ok) {
    const data = await response.json();
    knowledgeItems = data.data || [];
    backendConnected = true;
  }
} catch (e) {
  // Standalone mode
}
---

<!-- Pass to components -->
<KnowledgeStats
  itemCount={knowledgeItems.length}
  backendConnected={backendConnected}
/>
```

### Client-Side (React)

```typescript
// Using React hooks in components
import { useState, useEffect } from 'react';

export function SearchDemo() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Debounced search on query change
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Search logic here
      const filtered = MOCK_KNOWLEDGE_BASE.filter(item =>
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      ).sort((a, b) => b.similarity - a.similarity);

      setResults(filtered);
    } finally {
      setIsLoading(false);
    }
  };
}
```

## Real Data Integration Example

### Fetching Knowledge Items

```typescript
// In your hook or API client
async function fetchKnowledge(groupId: string) {
  const response = await fetch(
    `${DEMO_BACKEND_URL}/http/knowledge?groupId=${groupId}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch knowledge');
  }

  const data = await response.json();
  return data.data; // Array of knowledge items
}

// Usage in component
const [items, setItems] = useState<Knowledge[]>([]);

useEffect(() => {
  fetchKnowledge(groupId).then(setItems);
}, [groupId]);
```

### Creating Knowledge Items

```typescript
async function createKnowledge(data: {
  text: string;
  labels: string[];
  groupId: string;
}) {
  const response = await fetch('/api/knowledge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create knowledge');
  }

  return response.json();
}

// Usage
const result = await createKnowledge({
  text: 'Machine learning is...',
  labels: ['ai', 'ml'],
  groupId: DEMO_GROUP_ID
});

console.log('Created:', result._id);
```

### Semantic Search

```typescript
async function searchKnowledge(query: string, options?: {
  limit?: number;
  minSimilarity?: number;
  labels?: string[];
}) {
  const response = await fetch('/api/knowledge/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      limit: options?.limit || 10,
      minSimilarity: options?.minSimilarity || 0.5,
      filters: {
        labels: options?.labels
      }
    })
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  const { data } = await response.json();
  return data; // Array of search results with similarity scores
}

// Usage
const results = await searchKnowledge('machine learning', {
  limit: 5,
  minSimilarity: 0.6,
  labels: ['tutorial']
});

results.forEach(result => {
  console.log(`${result.text.substring(0, 50)}... (${result.similarity}%)`);
});
```

## Type Definitions

### Knowledge Item

```typescript
interface Knowledge {
  _id: string;
  text: string;
  labels: string[];
  embedding: number[]; // 1,536 dimensions
  sourceEntity?: {
    _id: string;
    type: string;
    name: string;
  };
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}
```

### Search Result

```typescript
interface SearchResult extends Knowledge {
  similarity: number; // 0-1 (0-100%)
}
```

### Search Query

```typescript
interface SearchQuery {
  query: string;
  limit?: number;
  minSimilarity?: number;
  filters?: {
    labels?: string[];
    sourceType?: string;
    dateRange?: [number, number];
  };
  sortBy?: 'similarity' | 'recency';
}
```

### Create Knowledge Request

```typescript
interface CreateKnowledgeRequest {
  text: string;
  labels: string[];
  sourceEntityId?: string;
  metadata?: Record<string, any>;
}
```

## Key Patterns Used

### 1. Server-Side Data Fetching (Astro)

```astro
---
// Fetch at build time / request time
const data = await fetch(endpoint);
const items = await data.json();
---

<!-- Pass as props to React components -->
<Component items={items} />
```

**Benefits:**
- No client waterfall
- Real data available immediately
- SEO friendly
- Faster initial render

### 2. Component Composition

```tsx
// Parent component orchestrates children
<DemoPlayground
  title="Interactive Knowledge Playground"
  formSection={<CreateKnowledgeForm />}
  dataSection={<KnowledgeItemsList items={items} />}
  isLoading={loading}
/>
```

**Benefits:**
- Clear separation of concerns
- Reusable components
- Easy to test
- Flexible layouts

### 3. Graceful Degradation

```typescript
let backendConnected = false;

try {
  // Try to fetch real data
  const response = await fetch(endpoint);
  backendConnected = response.ok;
} catch (e) {
  // Fall back to mock/demo data
  backendConnected = false;
}
```

**Benefits:**
- Works in offline/standalone mode
- Demo data always available
- No broken UI
- Clear status to user

### 4. Controlled Form State

```typescript
const [content, setContent] = useState('');
const [labels, setLabels] = useState<string[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate
  if (!content.trim()) {
    setError('Required');
    return;
  }

  // Submit
  setIsLoading(true);
  try {
    await onSubmit({ content, labels });
    setContent('');
    setLabels([]);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

**Benefits:**
- Full control over state
- Easy validation
- Loading/error handling
- Accessible form

### 5. Real-Time Search with Debounce

```typescript
useEffect(() => {
  // Debounce search requests
  const timer = setTimeout(() => {
    performSearch(query);
  }, 300);

  return () => clearTimeout(timer);
}, [query]);
```

**Benefits:**
- Reduced API calls
- Better performance
- Smoother UX
- Less server load

## Styling Patterns

### Dark Mode

```tsx
<div className="bg-white dark:bg-slate-800">
  <h1 className="text-slate-900 dark:text-white">
    Title
  </h1>
  <p className="text-slate-600 dark:text-slate-300">
    Content
  </p>
</div>
```

### Status Colors

```tsx
<div className={`
  ${status === 'success'
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }
`}>
  {status}
</div>
```

### Responsive Grid

```tsx
<div className="
  grid
  grid-cols-1         /* Mobile: 1 column */
  md:grid-cols-2      /* Tablet: 2 columns */
  lg:grid-cols-5      /* Desktop: 5 columns */
  gap-4
">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

## Testing Checklist

- [ ] Page loads without errors
- [ ] Backend connection detected when available
- [ ] Fallback to demo mode when offline
- [ ] Create form validates input
- [ ] Search returns results with similarity scores
- [ ] Labels add/remove correctly
- [ ] Code examples copy to clipboard
- [ ] Statistics display correctly
- [ ] Dark mode toggles work
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation works
- [ ] Error messages display clearly
- [ ] Loading states animate
- [ ] Success messages appear/disappear

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+

## Browser Testing

- Chrome 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

## Deployment Checklist

- [ ] No console errors
- [ ] TypeScript compilation passes
- [ ] Build completes without warnings
- [ ] All imports resolve correctly
- [ ] Environment variables set
- [ ] Backend endpoints accessible
- [ ] Images optimized
- [ ] CSS minified
- [ ] JavaScript bundled
- [ ] Dark mode styles applied
- [ ] Mobile layout tested
- [ ] Performance metrics met

## Troubleshooting

### Knowledge items not displaying

**Check:**
1. Backend URL configured correctly
2. Group ID matches backend data
3. Network request successful (check DevTools)
4. Response data format matches expected

**Solution:**
```typescript
// Debug: Check what's returned
const response = await fetch(url);
console.log('Status:', response.status);
const data = await response.json();
console.log('Data:', data);
```

### Search not returning results

**Check:**
1. Search query matches content
2. Similarity threshold not too high
3. Labels filter not excluding all items
4. Mock data populated

**Solution:**
```typescript
// Lower similarity threshold
const results = await search(query, {
  minSimilarity: 0.3  // Lower than default
});

// Check mock data
console.log('Mock items:', MOCK_KNOWLEDGE_BASE.length);
```

### Form submission failing

**Check:**
1. Network request returning error
2. Backend endpoint available
3. CORS configured
4. Request payload valid

**Solution:**
```typescript
// Add error logging
try {
  const result = await fetch('/api/knowledge', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const response = await result.json();
  console.log('Response:', response);
} catch (error) {
  console.error('Error:', error);
}
```

## Next Steps

1. **Enhance Search**
   - Add advanced filters
   - Implement faceted search
   - Add search suggestions

2. **Add RAG Integration**
   - Show LLM responses
   - Display citations
   - Track answer quality

3. **Improve Analytics**
   - Track search queries
   - Monitor performance
   - Show trending topics

4. **Scale Features**
   - Batch import
   - Knowledge organization
   - Collaboration features

5. **Optimize Performance**
   - Cache results
   - Pagination
   - Infinite scroll

---

## Questions?

Refer to:
- `/one/knowledge/ontology.md` - Data model
- `/one/things/frontend.md` - Frontend architecture
- `/demo/api` - Full API reference
