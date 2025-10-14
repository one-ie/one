# Pattern: React Form Template

**Category:** Frontend
**Context:** When creating forms for creating/editing entities with validation and Convex mutations
**Problem:** Need consistent form structure that uses React Hook Form, Zod validation, shadcn/ui, and handles submission properly

## Solution

Use React Hook Form + Zod for validation, shadcn/ui Form components for UI, Convex useMutation for submissions, and proper error/success states.

## Template

```tsx
// src/components/features/{EntityName}Form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

// Zod schema for validation
const {entity}Schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  // Add entity-specific fields
});

type {EntityName}FormValues = z.infer<typeof {entity}Schema>;

interface {EntityName}FormProps {
  {entity}Id?: Id<"{entities}">;
  initialData?: Partial<{EntityName}FormValues>;
  onSuccess?: () => void;
}

export function {EntityName}Form({ {entity}Id, initialData, onSuccess }: {EntityName}FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex mutations
  const create{EntityName} = useMutation(api.mutations.{entities}.create);
  const update{EntityName} = useMutation(api.mutations.{entities}.update);

  // Form setup
  const form = useForm<{EntityName}FormValues>({
    resolver: zodResolver({entity}Schema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "draft",
    },
  });

  // Submit handler
  async function onSubmit(values: {EntityName}FormValues) {
    setIsSubmitting(true);
    try {
      if ({entity}Id) {
        // Update existing
        await update{EntityName}({
          id: {entity}Id,
          ...values,
        });
        toast.success("{EntityName} updated successfully");
      } else {
        // Create new
        await create{EntityName}({
          name: values.name,
          properties: {
            description: values.description,
          },
        });
        toast.success("{EntityName} created successfully");
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save {entity}");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter {entity} name" {...field} />
              </FormControl>
              <FormDescription>
                The name of your {entity}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your {entity}"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Current status of the {entity}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : {entity}Id ? "Update" : "Create"} {EntityName}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## Variables

- `{EntityName}` - PascalCase entity name (e.g., "Course", "Lesson")
- `{entity}` - Lowercase entity name (e.g., "course", "lesson")
- `{entities}` - Table name (always "entities" in our ontology)

## Usage

1. Copy template to `src/components/features/{EntityName}Form.tsx`
2. Replace all `{EntityName}`, `{entity}`, `{entities}`
3. Update Zod schema with entity-specific fields
4. Add form fields for each schema property
5. Customize success/error messages
6. Use in pages with appropriate props

## Example (Course Form)

```tsx
// src/components/features/CourseForm.tsx
const courseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be positive"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
});

// In form:
<FormField
  control={form.control}
  name="price"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Price</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="0.00"
          {...field}
          onChange={(e) => field.onChange(parseFloat(e.target.value))}
        />
      </FormControl>
      <FormDescription>Course price in USD</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Validation Patterns

**Common Zod validations:**

```typescript
// Required string
z.string().min(1, "Field is required")

// Email
z.string().email("Invalid email address")

// URL
z.string().url("Invalid URL")

// Number range
z.number().min(0).max(100)

// Enum
z.enum(["option1", "option2", "option3"])

// Optional with default
z.string().optional().default("default value")

// Custom validation
z.string().refine((val) => val.length > 0, "Custom error")
```

## Common Mistakes

- **Mistake:** Not using Zod for validation
  - **Fix:** Always define schema with Zod, use zodResolver
- **Mistake:** Not showing loading state during submission
  - **Fix:** Use `isSubmitting` state, disable button
- **Mistake:** Not handling errors with toast
  - **Fix:** Always catch errors, show user-friendly message
- **Mistake:** Not resetting form after success
  - **Fix:** Call `form.reset()` after successful submission
- **Mistake:** Hardcoding field names instead of using `field` object
  - **Fix:** Always spread `{...field}` on inputs

## Related Patterns

- **component-template.md** - Components that use forms
- **page-template.md** - Pages that contain forms
- **mutation-template.md** - Backend mutations called by forms
