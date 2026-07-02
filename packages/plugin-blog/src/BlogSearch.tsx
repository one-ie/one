'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { PostCard } from './PostCard'

export interface BlogPost {
  title: string
  description: string
  slug: string
  date: Date
  category?: string
  image?: string
  tags?: string[]
}

export interface BlogSearchProps {
  posts: BlogPost[]
  placeholder?: string
  gridColumns?: '2' | '3'
}

export function BlogSearch({
  posts,
  placeholder = 'Search posts…',
  gridColumns = '3',
}: BlogSearchProps) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? posts.filter((post) => {
        const q = query.toLowerCase()
        return (
          post.title.toLowerCase().includes(q) ||
          post.description.toLowerCase().includes(q)
        )
      })
    : posts

  const gridClass =
    gridColumns === '2'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">No posts found for &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <div className={gridClass}>
          {filtered.map((post) => (
            <PostCard key={post.slug} {...post} />
          ))}
        </div>
      )}
    </div>
  )
}
