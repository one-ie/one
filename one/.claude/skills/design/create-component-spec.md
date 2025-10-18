# Create Component Spec

**Category:** design
**Version:** 1.0.0
**Used By:** agent-designer, agent-frontend

## Purpose

Defines component specifications.

## Output

```typescript
interface PricingCardProps {
  tier: string;
  price: number;
  features: string[];
  highlighted: boolean;
}

// States: default, hover, selected
// Events: onClick, onHover
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
