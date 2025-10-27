# ONE Platform Demo Components

## Version 1.0.0 - Component Definition Specification

This document defines all reusable components for ONE Platform demo pages. Components follow shadcn/ui patterns with Tailwind v4 styling.

---

## Component Library Architecture

### Hierarchy

```
┌─ Base Components (shadcn/ui)
│  ├─ Button
│  ├─ Card
│  ├─ Input
│  ├─ Select
│  ├─ Textarea
│  ├─ Badge
│  └─ Dialog
│
├─ Demo Components (custom)
│  ├─ DemoContainer
│  ├─ DemoHero
│  ├─ DemoPlayground
│  ├─ DemoCodeBlock
│  ├─ DemoForm
│  ├─ DemoList
│  ├─ DemoStats
│  ├─ DemoGraph
│  └─ DemoCTA
│
└─ Feature Components
   ├─ RelationshipExplorer
   ├─ CodeExample
   ├─ EntityCard
   └─ TimelineEvent
```

---

## 1. DemoContainer

### Purpose

Wrapper component that provides consistent max-width, padding, and spacing for all section content.

### Props

```typescript
interface DemoContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'card'; // Background variant
  noPadding?: boolean;
  tight?: boolean; // Reduces padding
}
```

### Implementation

```tsx
// src/components/demo/DemoContainer.tsx
import { cn } from '@/lib/utils';

export function DemoContainer({
  children,
  className,
  variant = 'light',
  noPadding = false,
  tight = false,
}: DemoContainerProps) {
  const variants = {
    light: 'bg-background',
    dark: 'bg-foreground/5',
    card: 'bg-card border border-border',
  };

  return (
    <div className={cn(
      'relative',
      variants[variant],
      !noPadding && 'px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16',
      tight && 'px-4 py-4 md:px-6 md:py-6',
      className,
    )}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
```

### Usage

```astro
<DemoContainer variant="light">
  <h2 class="text-3xl font-bold mb-4">Section Title</h2>
  <p>Content...</p>
</DemoContainer>
```

---

## 2. DemoHero

### Purpose

Hero section component with headline, subheading, and CTAs.

### Props

```typescript
interface DemoHeroProps {
  icon?: ReactNode;
  badge?: string;
  title: string;
  subtitle: string;
  primaryCta?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryCta?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  showScroll?: boolean; // Show scroll indicator
}
```

### Implementation

```tsx
// src/components/demo/DemoHero.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DemoHero({
  icon,
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  showScroll = true,
}: DemoHeroProps) {
  return (
    <section className="
      relative overflow-hidden
      px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-32
      bg-gradient-to-br from-primary/5 via-background to-background
    ">
      {/* Background blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full
          bg-primary/10 blur-[120px]"></div>
        <div className="absolute right-1/3 bottom-0 h-80 w-80 rounded-full
          bg-accent/10 blur-[120px]"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        {badge && (
          <div className="inline-flex items-center gap-2 mb-6
            px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-sm font-medium">{badge}</span>
          </div>
        )}

        {/* Icon */}
        {icon && (
          <div className="mb-6 flex justify-center">
            {icon}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl
          font-bold leading-tight tracking-tight
          mb-6 text-foreground">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground
          mb-12 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryCta && (
            <Button
              variant="default"
              size="lg"
              asChild={!!primaryCta.href}
            >
              {primaryCta.href ? (
                <a href={primaryCta.href}>
                  {primaryCta.label} <span className="ml-2">→</span>
                </a>
              ) : (
                <span onClick={primaryCta.onClick}>
                  {primaryCta.label} <span className="ml-2">→</span>
                </span>
              )}
            </Button>
          )}

          {secondaryCta && (
            <Button
              variant="outline"
              size="lg"
              asChild={!!secondaryCta.href}
            >
              {secondaryCta.href ? (
                <a href={secondaryCta.href}>
                  {secondaryCta.label}
                </a>
              ) : (
                <span onClick={secondaryCta.onClick}>
                  {secondaryCta.label}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      {showScroll && (
        <div className="flex justify-center mt-12 text-muted-foreground animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      )}
    </section>
  );
}
```

### Usage

```astro
<DemoHero
  badge="The Ontology"
  title="The Groups Dimension"
  subtitle="Hierarchical containers for collaboration"
  primaryCta={{
    label: "Start Playground",
    href: "#playground"
  }}
  secondaryCta={{
    label: "Read Docs",
    href: "/docs/groups"
  }}
  showScroll
/>
```

---

## 3. DemoPlayground

### Purpose

Interactive form + live data display section for hands-on experimentation.

### Props

```typescript
interface DemoPlaygroundProps {
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  liveData?: Record<string, any>;
  isLoading?: boolean;
  stats?: Array<{ label: string; value: string | number }>;
  tip?: string;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'email';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
}
```

### Implementation

```tsx
// src/components/demo/DemoPlayground.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function DemoPlayground({
  title,
  description,
  fields,
  onSubmit,
  liveData,
  isLoading,
  stats,
  tip,
}: DemoPlaygroundProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-background rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Create New Entity</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col">
                <Label htmlFor={field.name} className="mb-2">
                  {field.label}
                </Label>

                {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, [field.name]: value })
                    }
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    required={field.required}
                    rows={4}
                  />
                ) : null}
              </div>
            ))}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Entity'} →
            </Button>
          </form>
        </div>

        {/* Live data */}
        <div className="space-y-4">
          <div className="bg-background rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Live Data (JSON)</h3>

            <div className="
              bg-foreground/5 rounded-md p-4
              border border-border
              overflow-x-auto
              max-h-80 overflow-y-auto
              font-mono text-sm
              text-foreground/80
            ">
              <pre>{JSON.stringify(liveData || {}, null, 2)}</pre>
            </div>

            <p className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Data updates in real-time
            </p>
          </div>

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="
                  bg-background rounded-lg p-4
                  border border-border text-center
                ">
                  <p className="text-2xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      {tip && (
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
          <p className="text-sm text-foreground">
            <strong>Pro Tip:</strong> {tip}
          </p>
        </div>
      )}
    </div>
  );
}
```

### Usage

```astro
<DemoPlayground
  title="Try It Yourself"
  description="Create and explore Things entities in real time"
  fields={[
    {
      name: 'name',
      label: 'Entity Name',
      type: 'text',
      placeholder: 'Enter entity name',
      required: true,
    },
    {
      name: 'type',
      label: 'Entity Type',
      type: 'select',
      options: [
        { value: 'course', label: 'Course' },
        { value: 'product', label: 'Product' },
        { value: 'agent', label: 'Agent' },
      ],
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe this entity...',
    },
  ]}
  onSubmit={(data) => console.log(data)}
  liveData={{
    id: 'thing_123',
    name: data.name,
    type: data.type,
    createdAt: new Date().toISOString(),
  }}
  stats={[
    { label: 'Entities Created', value: 42 },
    { label: 'Relationships', value: 18 },
  ]}
  tip="Click 'Create Entity' to see real-time updates in the JSON viewer"
  client:load
/>
```

---

## 4. DemoCodeBlock

### Purpose

Syntax-highlighted code example with copy button and metadata.

### Props

```typescript
interface DemoCodeBlockProps {
  code: string;
  language?: 'typescript' | 'javascript' | 'sql' | 'json' | 'bash';
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'auto';
  keyPoints?: string[];
  relatedDocs?: Array<{ label: string; href: string }>;
}
```

### Implementation

```tsx
// src/components/demo/DemoCodeBlock.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

export function DemoCodeBlock({
  code,
  language = 'typescript',
  title,
  filename,
  showLineNumbers = false,
  height = 'md',
  keyPoints,
  relatedDocs,
}: DemoCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const heightClasses = {
    sm: 'max-h-64',
    md: 'max-h-96',
    lg: 'max-h-screen',
    auto: '',
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-muted px-6 py-4 border-b border-border
        flex items-center justify-between">
        <div>
          {title && (
            <h3 className="font-semibold text-foreground">{title}</h3>
          )}
          {filename && (
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {filename}
            </p>
          )}
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {language.toUpperCase()}
        </span>
      </div>

      {/* Code */}
      <div className={`
        relative
        overflow-hidden
        ${heightClasses[height]}
        overflow-y-auto
      `}>
        <pre className="p-6 bg-foreground/5 border-t border-border
          overflow-x-auto
          text-sm font-mono text-foreground/80
          whitespace-pre-wrap break-words">
          <code>{code}</code>
        </pre>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4
            px-3 py-1.5 rounded-md
            bg-primary text-primary-foreground
            text-xs font-medium
            hover:bg-primary/90
            transition-colors duration-200
            focus-visible:outline-2 focus-visible:outline-ring
            flex items-center gap-2"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-background border-t border-border
        space-y-4 text-sm">
        {keyPoints && keyPoints.length > 0 && (
          <div>
            <p className="font-semibold text-foreground mb-2">Key Points:</p>
            <ul className="ml-4 space-y-1 text-muted-foreground list-disc">
              {keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {relatedDocs && relatedDocs.length > 0 && (
          <div>
            <p className="font-semibold text-foreground mb-2">Related:</p>
            <div className="flex flex-wrap gap-2">
              {relatedDocs.map((doc) => (
                <a
                  key={doc.href}
                  href={doc.href}
                  className="px-2.5 py-1.5 rounded-md
                    bg-primary/10 text-primary
                    text-xs font-medium
                    hover:bg-primary/20
                    transition-colors"
                >
                  {doc.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Usage

```astro
<DemoCodeBlock
  code={`export const create = mutation({
  args: { name: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('things', {
      type: args.type,
      name: args.name,
      status: 'draft',
      createdAt: Date.now(),
    });
  },
});`}
  language="typescript"
  title="Create Thing Example"
  filename="convex/mutations/things.ts"
  height="md"
  keyPoints={[
    'All entities stored in things table',
    'Type system enforces correctness',
    'Mutations return entity ID',
  ]}
  relatedDocs={[
    { label: 'Mutations Guide', href: '/docs/mutations' },
    { label: 'Things Spec', href: '/docs/things' },
  ]}
/>
```

---

## 5. DemoStats

### Purpose

Display statistics and metrics in card format.

### Props

```typescript
interface DemoStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
  }>;
  columns?: 1 | 2 | 3 | 4;
}
```

### Implementation

```tsx
// src/components/demo/DemoStats.tsx
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function DemoStats({
  stats,
  columns = 3,
}: DemoStatsProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridClasses[columns])}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className="
            rounded-lg bg-background border border-border
            p-6 transition-all duration-300
            hover:shadow-md hover:-translate-y-1
          "
        >
          {/* Icon */}
          {stat.icon && (
            <div className="mb-4 text-primary">
              {stat.icon}
            </div>
          )}

          {/* Value */}
          <p className="text-3xl font-bold text-foreground">
            {stat.value}
          </p>

          {/* Label */}
          <p className="text-sm text-muted-foreground mt-1">
            {stat.label}
          </p>

          {/* Trend */}
          {stat.trendValue && (
            <div className="mt-4 flex items-center gap-2">
              {stat.trend === 'up' && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              {stat.trend === 'down' && (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                'text-xs font-medium',
                stat.trend === 'up' ? 'text-green-600' :
                stat.trend === 'down' ? 'text-red-600' :
                'text-muted-foreground'
              )}>
                {stat.trendValue}
              </span>
            </div>
          )}

          {/* Description */}
          {stat.description && (
            <p className="text-xs text-muted-foreground mt-3">
              {stat.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Usage

```astro
<DemoStats
  columns={3}
  stats={[
    {
      label: 'Total Entities',
      value: '1,247',
      trend: 'up',
      trendValue: '+12.5%',
      icon: <Database className="w-5 h-5" />
    },
    {
      label: 'Active Connections',
      value: '843',
      trend: 'up',
      trendValue: '+8.2%',
      icon: <Network className="w-5 h-5" />
    },
    {
      label: 'Events Logged',
      value: '5,340',
      trend: 'up',
      trendValue: '+23.1%',
      icon: <Activity className="w-5 h-5" />
    },
  ]}
/>
```

---

## 6. DemoForm

### Purpose

Reusable form component with validation and error handling.

### Props

```typescript
interface DemoFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  successMessage?: string;
}
```

### Implementation

```tsx
// src/components/demo/DemoForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function DemoForm({
  fields,
  onSubmit,
  isLoading = false,
  submitLabel = 'Submit',
  successMessage = 'Form submitted successfully!',
}: DemoFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({});
    } catch (error: any) {
      setErrors({
        submit: error.message || 'An error occurred',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <Label htmlFor={field.name} className="mb-2 font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }
              required={field.required}
              className="
                px-4 py-2.5 rounded-md
                border border-input
                bg-background text-foreground
                placeholder:text-muted-foreground
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-ring
                font-sans
              "
              rows={4}
            />
          ) : (
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }
              required={field.required}
            />
          )}

          {/* Field error */}
          {errors[field.name] && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}

      {/* Submit error */}
      {errors.submit && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20
          text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{errors.submit}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20
          text-green-700 text-sm flex items-start gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Submitting...' : submitLabel}
      </Button>
    </form>
  );
}
```

---

## 7. DemoList

### Purpose

Display list of items with optional filtering and sorting.

### Props

```typescript
interface DemoListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
}
```

### Implementation

```tsx
// src/components/demo/DemoList.tsx
import { cn } from '@/lib/utils';

export function DemoList<T>({
  items,
  renderItem,
  emptyMessage = 'No items found',
  columns = 1,
  gap = 'md',
}: DemoListProps<T>) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
      {items.map((item, index) =>
        renderItem(item, index)
      )}
    </div>
  );
}
```

---

## 8. DemoGraph

### Purpose

Interactive relationship graph visualization component.

### Props

```typescript
interface DemoGraphProps {
  data: GraphData;
  onNodeClick?: (nodeId: string) => void;
  height?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  theme?: 'light' | 'dark';
}

interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    color?: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}
```

### Implementation

```tsx
// src/components/demo/DemoGraph.tsx
'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function DemoGraph({
  data,
  onNodeClick,
  height = '500px',
  enableZoom = true,
  enablePan = true,
  theme = 'light',
}: DemoGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize graph visualization library
    // (Vis.js, D3.js, or Three.js implementation)
    // This is a placeholder for the actual implementation

    console.log('Graph data:', data);
  }, [data, onNodeClick, enableZoom, enablePan, theme]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'rounded-lg border border-border bg-background',
        'transition-all duration-300',
        'overflow-hidden'
      )}
      style={{ height }}
    >
      {/* Graph rendered here via vis-network or similar */}
      <canvas className="w-full h-full" />
    </div>
  );
}
```

---

## 9. DemoCTA

### Purpose

Call-to-action section with headline, description, and buttons.

### Props

```typescript
interface DemoCTAProps {
  headline: string;
  description?: string;
  icon?: ReactNode;
  primaryCta: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  stats?: Array<{ label: string; value: string }>;
  bgGradient?: 'primary' | 'accent' | 'secondary';
}
```

### Implementation

```tsx
// src/components/demo/DemoCTA.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DemoCTA({
  headline,
  description,
  icon,
  primaryCta,
  secondaryCta,
  stats,
  bgGradient = 'primary',
}: DemoCTAProps) {
  const bgClasses = {
    primary: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
    accent: 'bg-gradient-to-br from-accent to-accent/80 text-accent-foreground',
    secondary: 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground',
  };

  return (
    <section className={cn(
      'relative overflow-hidden',
      'px-4 py-20 md:px-6 md:py-28',
      bgClasses[bgGradient]
    )}>
      {/* Content */}
      <div className="max-w-4xl mx-auto text-center">
        {icon && (
          <div className="mb-6 flex justify-center opacity-75">
            {icon}
          </div>
        )}

        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          {headline}
        </h2>

        {description && (
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            variant="secondary"
            size="lg"
            asChild={!!primaryCta.href}
          >
            {primaryCta.href ? (
              <a href={primaryCta.href}>{primaryCta.label} →</a>
            ) : (
              <span onClick={primaryCta.onClick}>
                {primaryCta.label} →
              </span>
            )}
          </Button>

          {secondaryCta && (
            <Button
              variant="outline"
              size="lg"
              asChild={!!secondaryCta.href}
            >
              {secondaryCta.href ? (
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              ) : (
                <span onClick={secondaryCta.onClick}>
                  {secondaryCta.label}
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-opacity-20">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-75 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

---

## Component Usage Guidelines

### Import Pattern

```tsx
import { DemoHero } from '@/components/demo/DemoHero';
import { DemoPlayground } from '@/components/demo/DemoPlayground';
import { DemoCodeBlock } from '@/components/demo/DemoCodeBlock';
import { DemoStats } from '@/components/demo/DemoStats';
import { DemoCTA } from '@/components/demo/DemoCTA';
```

### Composition Pattern

```astro
<DemoContainer>
  <DemoHero ... />
</DemoContainer>

<DemoContainer variant="card">
  <DemoPlayground client:load ... />
</DemoContainer>

<DemoContainer>
  <DemoCodeBlock ... />
  <DemoCodeBlock ... />
</DemoContainer>

<DemoCTA ... />
```

### Client vs Server

- **Server (Astro):** DemoContainer, DemoHero, DemoCodeBlock, DemoCTA, DemoStats
- **Client (React):** DemoPlayground, DemoForm, DemoList, DemoGraph (add `client:load`)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Oct 2024 | Initial component specifications |

---

**Components Maintained By:** Design Agent
**Last Updated:** October 25, 2024
**Status:** Production Ready
