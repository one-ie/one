# React Component Pattern

**Category:** Frontend
**Type:** UI Component
**Used for:** Building reusable, accessible React components with Convex

---

## Pattern Overview

Every React component should:
1. Use TypeScript for type safety
2. Fetch data with Convex hooks
3. Handle loading and error states
4. Follow accessibility best practices
5. Use shadcn/ui components when available

## Code Template

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EntityListProps {
  type: string;
  status?: string;
}

export function EntityList({ type, status = "active" }: EntityListProps) {
  // 1. Fetch data with Convex query
  const entities = useQuery(api.queries.entities.list, { type, status });
  const deleteEntity = useMutation(api.mutations.entities.delete);

  // 2. Handle loading state
  if (entities === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // 3. Handle empty state
  if (entities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No {type}s found</p>
        </CardContent>
      </Card>
    );
  }

  // 4. Handle action
  const handleDelete = async (id: string) => {
    try {
      await deleteEntity({ id });
    } catch (error) {
      console.error("Failed to delete:", error);
      // Show error toast/notification
    }
  };

  // 5. Render list
  return (
    <div className="space-y-4">
      {entities.map((entity) => (
        <Card key={entity._id}>
          <CardHeader>
            <CardTitle>{entity.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {entity.type}
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(entity._id)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## When to Use

- Building list views of entities
- Creating forms for entity creation/editing
- Displaying entity details
- Building dashboards and analytics views

## Best Practices

1. **Use Convex hooks** - `useQuery` for reads, `useMutation` for writes
2. **Handle all states** - Loading, empty, error, and success states
3. **Use shadcn/ui** - Leverage pre-built accessible components
4. **Type everything** - Define interfaces for props and data
5. **Accessibility first** - Use semantic HTML and ARIA attributes

## Common Mistakes

❌ **Don't:** Skip loading states
✅ **Do:** Always show loading UI while data fetches

❌ **Don't:** Ignore error handling
✅ **Do:** Catch errors and show user-friendly messages

❌ **Don't:** Use `any` type
✅ **Do:** Define proper TypeScript interfaces

❌ **Don't:** Forget accessibility
✅ **Do:** Use semantic HTML and ARIA labels

## Related Patterns

- [Astro Islands Pattern](./astro-islands-pattern.md)
- [Form Handling Pattern](./form-handling-pattern.md)
- [Error Boundary Pattern](./error-boundary-pattern.md)
