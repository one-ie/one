import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import type { CollectionEntry } from 'astro:content';

export type StreamPost = CollectionEntry<'stream'>;

interface StreamSearchProps {
  posts: StreamPost[];
  viewMode?: 'list' | 'grid';
  gridColumns?: '2' | '3' | '4';
  placeholder?: string;
  className?: string;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function StreamSearch({
  posts,
  viewMode = 'list',
  gridColumns = '2',
  placeholder = 'Search stream updates by title or description...',
  className,
}: StreamSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [brokenImages, setBrokenImages] = React.useState<Set<string>>(new Set());

  const filteredPosts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }

    const query = searchQuery.toLowerCase();

    return posts.filter((post) => {
      const title = post.data.title.toLowerCase();
      const description = post.data.description?.toLowerCase() || '';

      return title.includes(query) || description.includes(query);
    });
  }, [posts, searchQuery]);

  const handleImageError = React.useCallback((slug: string) => {
    setBrokenImages(prev => new Set(prev).add(slug));
  }, []);

  return (
    <div className={className}>
      <div className="mb-6">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        {searchQuery && (
          <p className="mt-2 text-sm text-muted-foreground">
            Found {filteredPosts.length}{' '}
            {filteredPosts.length === 1 ? 'update' : 'updates'}
          </p>
        )}
      </div>

      {filteredPosts.length === 0 && searchQuery ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No updates found matching "{searchQuery}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try a different search term
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? `grid gap-4 sm:gap-6 grid-cols-1 ${
                  gridColumns === '2'
                    ? 'sm:grid-cols-2'
                    : gridColumns === '3'
                      ? 'sm:grid-cols-3'
                      : 'sm:grid-cols-4'
                }`
              : 'space-y-4 sm:space-y-6'
          }
        >
          {filteredPosts.map((entry) => (
            <Card
              key={entry.slug}
              className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
                viewMode === 'list' ? 'flex' : 'hover:-translate-y-1'
              }`}
            >
              <a
                href={`/stream/${entry.slug}`}
                className={`block hover:opacity-80 transition-opacity ${
                  viewMode === 'list' ? 'flex flex-1' : ''
                }`}
              >
                {entry.data.image && viewMode === 'list' && !brokenImages.has(entry.slug) && (
                  <div className="w-48 shrink-0">
                    <img
                      src={entry.data.image}
                      alt={entry.data.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(entry.slug)}
                    />
                  </div>
                )}
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">{entry.data.category}</Badge>
                    {entry.data.tags && entry.data.tags.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {entry.data.tags.slice(0, 2).join(', ')}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground flex items-center ml-auto">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(new Date(entry.data.date))}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {entry.data.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {entry.data.description}
                  </p>
                </div>
                {entry.data.image && viewMode === 'grid' && !brokenImages.has(entry.slug) && (
                  <div className="aspect-video w-full">
                    <img
                      src={entry.data.image}
                      alt={entry.data.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(entry.slug)}
                    />
                  </div>
                )}
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
