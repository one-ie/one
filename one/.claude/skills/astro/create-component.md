# Create React Component

**Category:** astro
**Version:** 1.0.0
**Used By:** agent-frontend, agent-designer

## Purpose

Generates React component with TypeScript and shadcn/ui.

## Example

```typescript
interface PricingTableProps {
  tiers: number;
}

export function PricingTable({ tiers }: PricingTableProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Pricing cards */}
    </div>
  );
}
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
