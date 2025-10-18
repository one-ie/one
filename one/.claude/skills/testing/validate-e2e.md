# Validate E2E Tests

**Category:** testing
**Version:** 1.0.0
**Used By:** agent-quality

## Purpose

Runs end-to-end tests for user flows.

## Example

```typescript
test('user can create blog post', async () => {
  await page.goto('/dashboard');
  await page.click('[data-test="new-post"]');
  await page.fill('[name="title"]', 'Test');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL('/blog/test');
});
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
