# Pattern: React Component Template

**Category:** Frontend
**Context:** When creating React components with shadcn/ui for interactive features
**Problem:** Need consistent component structure that uses Convex hooks, handles loading/error states, and follows accessibility guidelines

## Solution

Use shadcn/ui components, Convex React hooks for real-time data, proper loading/error states, and TypeScript for type safety.

## Template

```tsx
// src/components/features/{EntityName}List.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import { Link } from "@/components/ui/link";

interface {EntityName}ListProps {
  type?: string;
  status?: "draft" | "active" | "archived";
  limit?: number;
}

export function {EntityName}List({ type, status, limit }: {EntityName}ListProps) {
  // Fetch data with Convex hook (real-time)
  const {entities} = useQuery(api.queries.{entities}.list, {
    type,
    status,
    limit,
  });

  // Loading state
  if ({entities} === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Empty state
  if ({entities}.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No {entities} found. Create your first {entity} to get started.
        </AlertDescription>
        <Button asChild className="mt-4">
          <Link href="/{entities}/new">
            <Plus className="mr-2 h-4 w-4" />
            Create {EntityName}
          </Link>
        </Button>
      </Alert>
    );
  }

  // Success state
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{EntityName}s</h2>
        <Button asChild>
          <Link href="/{entities}/new">
            <Plus className="mr-2 h-4 w-4" />
            New {EntityName}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {{entities}.map(({entity}) => (
          <Card key={typeof {entity}._id === 'string' ? {entity}._id : JSON.stringify({entity}._id)}>
            <CardHeader>
              <CardTitle>{typeof {entity}.name === 'string' ? {entity}.name : 'Untitled'}</CardTitle>
              <CardDescription>
                {typeof {entity}.properties?.description === 'string' ? {entity}.properties.description : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Status: {typeof {entity}.status === 'string' ? {entity}.status : 'unknown'}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/{entities}/${typeof {entity}._id === 'string' ? {entity}._id : JSON.stringify({entity}._id)}`}>
                    View
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Variables

- `{EntityName}` - PascalCase entity name (e.g., "Course", "Lesson")
- `{entity}` - Lowercase entity name (e.g., "course", "lesson")
- `{entities}` - Plural lowercase (e.g., "courses", "lessons")

## Usage

1. Copy template to `src/components/features/{EntityName}List.tsx`
2. Replace all `{EntityName}`, `{entity}`, `{entities}`
3. Import shadcn/ui components as needed
4. Customize card content for entity-specific fields
5. Add filtering/sorting UI if needed

## Example (Course List)

```tsx
// src/components/features/CourseList.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseList() {
  const courses = useQuery(api.queries.entities.list, {
    type: "course",
    status: "active",
  });

  if (courses === undefined) {
    return <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
    </div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {courses.map((course) => (
        <Card key={course._id}>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>{course.name}</CardTitle>
              <Badge>{course.properties?.level}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{course.properties?.description}</p>
            <div className="mt-4 flex justify-between">
              <span className="font-bold">${course.properties?.price}</span>
              <Button asChild size="sm">
                <Link href={`/courses/${course._id}`}>View</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Loading States

Always handle three states:

1. **Loading** (`data === undefined`) → Show `Skeleton`
2. **Empty** (`data.length === 0`) → Show empty state with CTA
3. **Success** (`data.length > 0`) → Show data

## Common Mistakes

- **Mistake:** Not handling loading state
  - **Fix:** Check if `data === undefined` and show skeleton
- **Mistake:** Not handling empty state
  - **Fix:** Show helpful message and CTA when no data
- **Mistake:** Not using shadcn/ui components
  - **Fix:** Use Card, Button, etc. for consistency
- **Mistake:** Hardcoding href paths
  - **Fix:** Use template literals with entity IDs
- **Mistake:** Assuming properties exist
  - **Fix:** Use optional chaining (`properties?.field`)

## Related Patterns

- **form-template.md** - Forms for creating/editing
- **page-template.md** - Pages that use these components
- **shadcn/ui docs** - Component API reference
