# Check Astro Build

**Category:** astro
**Version:** 1.0.0
**Used By:** agent-quality, agent-ops

## Purpose

Runs Astro build check and reports errors.

## Example

```bash
bunx astro check --minimumSeverity warning
```

**Output:**
```json
{
  "success": true,
  "errors": 0,
  "warnings": 0,
  "files": 252
}
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
