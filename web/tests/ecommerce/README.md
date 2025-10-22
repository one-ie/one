# Ecommerce Test Suite

Comprehensive test coverage for the ONE Platform ecommerce demo following the 6-dimension ontology and Quality Agent validation principles.

## Test Suites Overview

### 1. Product Browsing Tests (`browsing.test.ts`)
**Coverage:** Product discovery, filtering, sorting, and search

**Ontology Mapping:**
- **Things:** `product` entities
- **Events:** `product_viewed`, `product_searched`, `filter_applied`
- **Knowledge:** Product categories, tags for search

**Test Coverage (28 tests):**
- ✅ Homepage product grid display
- ✅ Category and subcategory navigation
- ✅ Price range filtering
- ✅ Stock availability filtering
- ✅ Product sorting (price, newest)
- ✅ Search by name and description
- ✅ Product card navigation
- ✅ Image display and variants
- ✅ Combined multi-filter scenarios
- ✅ Performance with large datasets

**Key Assertions:**
- Products load with correct structure
- Filters return accurate results
- Sort order is maintained
- Search is case-insensitive
- Images and variants display correctly

---

### 2. Shopping Cart Tests (`cart.test.ts`)
**Coverage:** Add to cart, quantity updates, cart persistence

**Ontology Mapping:**
- **Things:** `cart_item` (temporary client-side)
- **Events:** `item_added_to_cart`, `item_removed_from_cart`, `cart_updated`
- **Connections:** `user → cart_item` (owns)

**Test Coverage (25 tests):**
- ✅ Add product to cart
- ✅ Add with custom quantity
- ✅ Increase quantity for duplicate items
- ✅ Handle product variants
- ✅ Update quantities
- ✅ Remove items
- ✅ Cart badge updates
- ✅ Cart persistence (localStorage)
- ✅ Calculate correct totals
- ✅ Empty cart state
- ✅ Clear cart functionality

**Key Assertions:**
- Cart state updates correctly
- localStorage persistence works
- Variants treated as separate items
- Totals calculate accurately
- Cart count reflects all quantities

---

### 3. Checkout Tests (`checkout.test.ts`)
**Coverage:** Checkout flow, payment processing, order confirmation

**Ontology Mapping:**
- **Things:** `order`, `payment`
- **Events:** `checkout_started`, `payment_submitted`, `payment_succeeded`, `payment_failed`, `order_created`
- **Connections:** `user → order` (owns), `order → payment` (paid_with)

**Test Coverage (30 tests):**
- ✅ Load checkout with cart summary
- ✅ Validate shipping address fields
- ✅ Calculate order totals (subtotal, shipping, tax)
- ✅ Free shipping over $100
- ✅ Stripe Elements integration
- ✅ Payment intent creation
- ✅ Handle successful payments
- ✅ Handle payment errors
- ✅ Card validation
- ✅ Order creation
- ✅ Cart clearing after success
- ✅ Order confirmation display

**Key Assertions:**
- Shipping validation enforces required fields
- Totals include shipping and tax
- Stripe integration configured correctly
- Payment errors handled gracefully
- Order created on successful payment

---

### 4. Accessibility Tests (`accessibility.test.ts`)
**Coverage:** WCAG 2.1 AA compliance, keyboard navigation, screen readers

**Ontology Mapping:**
- **Events:** `accessibility_issue_detected`, `keyboard_navigation_used`
- **Knowledge:** Accessibility best practices, WCAG guidelines

**Test Coverage (35 tests):**
- ✅ Keyboard navigation (Tab, Enter, Escape, Space)
- ✅ Logical tab order
- ✅ Visible focus indicators
- ✅ ARIA labels on interactive elements
- ✅ Screen reader announcements
- ✅ Color contrast (4.5:1 for text, 3:1 for large text)
- ✅ Skip links for navigation
- ✅ Form accessibility (labels, errors)
- ✅ Image alt text
- ✅ Motion preferences (prefers-reduced-motion)
- ✅ Error prevention and recovery

**Key Assertions:**
- All interactive elements keyboard accessible
- Focus visible with sufficient contrast
- ARIA roles and labels present
- Screen reader announcements trigger
- Forms have proper labels and error handling

---

### 5. Mobile Tests (`mobile.test.ts`)
**Coverage:** Mobile responsiveness, touch targets, mobile UX

**Ontology Mapping:**
- **Events:** `mobile_view_detected`, `touch_interaction`, `mobile_menu_opened`

**Test Coverage (30 tests):**
- ✅ Responsive at key breakpoints (375px, 768px, 1024px)
- ✅ Touch targets minimum 44x44px (iOS) / 48x48px (Android)
- ✅ Mobile navigation (hamburger menu)
- ✅ Responsive grid layouts (1/2/3/4 columns)
- ✅ Filter drawer on mobile
- ✅ Swipeable image gallery
- ✅ Sticky elements (header, cart button)
- ✅ Mobile-optimized form inputs
- ✅ Progress indicators
- ✅ Mobile payment methods
- ✅ Text readability (16px+ font size)
- ✅ Safe area insets (iOS)

**Key Assertions:**
- Layout adapts at all breakpoints
- Touch targets meet platform guidelines
- Navigation optimized for mobile
- Forms use appropriate input types
- Sticky elements positioned correctly

---

### 6. Performance Tests (`performance.test.ts`)
**Coverage:** Bundle size, load times, Core Web Vitals, optimization

**Ontology Mapping:**
- **Events:** `performance_measured`, `vitals_recorded`, `optimization_applied`
- **Knowledge:** Performance benchmarks, optimization patterns

**Test Coverage (32 tests):**
- ✅ Bundle size under 50KB (gzipped)
- ✅ Code splitting by route
- ✅ Lazy loading components
- ✅ Image optimization (lazy loading, responsive images, WebP)
- ✅ Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - INP < 200ms
  - TTFB < 600ms
- ✅ Lighthouse scores 90+
- ✅ Resource loading optimization
- ✅ Caching strategy
- ✅ JavaScript performance (debounce, throttle, memoization)
- ✅ CSS performance
- ✅ Network optimization
- ✅ Memory management
- ✅ Rendering performance

**Key Assertions:**
- Bundle size within limits
- Core Web Vitals meet targets
- Images lazy load and optimize
- Scripts defer when possible
- Caching configured correctly

---

### 7. Integration Tests (`integration.test.ts`)
**Coverage:** Complete end-to-end user flows

**Ontology Mapping:**
- **Event Chains:** `product_viewed` → `item_added_to_cart` → `checkout_started` → `payment_succeeded` → `order_created`
- **Multi-Entity Flows:** product → cart → order → payment
- **Cross-Dimensional:** Things + Connections + Events + Knowledge

**Test Coverage (10 complete flows):**
1. ✅ Browse → Add to Cart → Checkout → Success
2. ✅ Search → Filter → Add → Checkout
3. ✅ Variant Selection → Add → Update Qty → Checkout
4. ✅ Multiple Products → Remove Some → Checkout
5. ✅ Empty Cart → Browse → Add → Checkout
6. ✅ Cart Persistence Across Sessions
7. ✅ Out of Stock Handling
8. ✅ Payment Error Recovery
9. ✅ Free Shipping Threshold
10. ✅ Multi-Variant Cart Summary

**Key Assertions:**
- All flows complete successfully
- State persists correctly
- Events logged in proper sequence
- Error recovery works
- Cart and checkout maintain integrity

---

## Test Statistics

**Total Test Suites:** 7
**Total Test Cases:** 180+
**Ontology Coverage:**
- ✅ Things: product, cart_item, order, payment
- ✅ Connections: owns, paid_with
- ✅ Events: 15+ event types
- ✅ Knowledge: categories, tags, best practices

**Code Coverage Goals:**
- Target: 80%+
- Critical Paths: 100%

---

## Running Tests

### Run All Ecommerce Tests
```bash
bun test test/ecommerce
```

### Run Specific Suite
```bash
bun test test/ecommerce/browsing.test.ts
bun test test/ecommerce/cart.test.ts
bun test test/ecommerce/checkout.test.ts
bun test test/ecommerce/accessibility.test.ts
bun test test/ecommerce/mobile.test.ts
bun test test/ecommerce/performance.test.ts
bun test test/ecommerce/integration.test.ts
```

### Run in Watch Mode
```bash
bun test test/ecommerce --watch
```

### Generate Coverage Report
```bash
bun test test/ecommerce --coverage
```

### Run with UI
```bash
bun test:ui test/ecommerce
```

---

## Test Fixtures

All test data is centralized in `fixtures.ts`:

- **mockProducts** - Sample product catalog
- **mockCartItems** - Pre-configured cart items
- **mockShippingAddress** - Valid shipping address
- **stripeTestCards** - Stripe test card numbers
- **mockPaymentIntent** - Payment intent response
- **mockFilterOptions** - Filter and sort options

**Helper Functions:**
- `calculateCartTotals()` - Calculate subtotal, shipping, tax, total
- `createMockLocalStorage()` - Mock localStorage for tests
- `mockMatchMedia()` - Mock media queries for responsive tests
- `createMockIntersectionObserver()` - Mock for lazy loading tests

---

## Quality Gates

Tests enforce the following quality standards:

### Functional Requirements
- ✅ All user flows complete successfully
- ✅ Cart operations work correctly
- ✅ Checkout processes payments
- ✅ Error handling is robust

### Accessibility (WCAG 2.1 AA)
- ✅ Keyboard navigation functional
- ✅ Screen reader compatible
- ✅ Color contrast sufficient (4.5:1)
- ✅ ARIA labels present

### Performance
- ✅ Bundle size < 50KB
- ✅ LCP < 2.5s
- ✅ FID < 100ms
- ✅ CLS < 0.1
- ✅ Lighthouse score 90+

### Mobile Experience
- ✅ Responsive at all breakpoints
- ✅ Touch targets 44px+
- ✅ Mobile-optimized navigation
- ✅ Safe area support

---

## Continuous Integration

Tests run automatically on:
- ✅ Pull requests
- ✅ Commits to main branch
- ✅ Pre-deployment checks

**CI Configuration:** See `.github/workflows/test.yml`

---

## Troubleshooting

### Tests Failing Locally

1. **Clear test cache:**
   ```bash
   bun test --clearCache
   ```

2. **Update dependencies:**
   ```bash
   bun install
   ```

3. **Check Node version:**
   ```bash
   node --version  # Should be 18+
   ```

### Coverage Not Generating

```bash
bun test --coverage --reporter=verbose
```

### Mock Issues

Ensure mocks are properly reset:
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  cartActions.clearCart();
});
```

---

## Future Enhancements

- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Add load testing for high traffic
- [ ] Add security testing (XSS, CSRF)
- [ ] Add internationalization tests
- [ ] Add A/B testing framework

---

## Contributing

When adding new features:

1. Write tests FIRST (TDD approach)
2. Follow ontology mapping principles
3. Maintain 80%+ coverage
4. Document test cases clearly
5. Update this README

**Test Naming Convention:**
```typescript
describe('Feature Name', () => {
  it('should [expected behavior]', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

---

## Contact

For questions about testing:
- See `one/knowledge/rules.md` for AI testing guidelines
- See `one/connections/workflow.md` for development workflow
- Check `.claude/agents/agent-quality.md` for Quality Agent specs

**Built with quality, tested with precision. 🎯**
