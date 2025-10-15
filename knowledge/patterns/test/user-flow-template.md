# Pattern: User Flow Template

**Category:** Testing
**Context:** When defining what users must accomplish for a feature to be considered complete
**Problem:** Need clear, testable user flows that drive design and implementation decisions

## Solution

Write user flows from user perspective (not technical), define time budgets, specify success criteria, keep flows independent and testable.

## Template

```markdown
# User Flows: {Feature Name}

**Feature:** {N}-{M}-{feature-name}
**Date:** YYYY-MM-DD
**Quality Agent:** [Your name]

---

## Flow 1: {Primary User Goal}

**User Goal:** As a [user type], I want to [action] so that [benefit]

**Prerequisites:**
- User is authenticated
- User has [permission/role]
- [Any required data exists]

**Time Budget:** < {N} seconds for completion

### Steps

1. **User navigates to {page/section}**
   - Expected: Page loads in < 500ms
   - Expected: User sees [specific UI element]

2. **User clicks [button/link]**
   - Expected: [Modal/page] opens
   - Expected: Focus moves to [first input]

3. **User fills in [form field 1]**
   - Input: [example value]
   - Expected: Field validates in real-time
   - Expected: No errors for valid input

4. **User fills in [form field 2]**
   - Input: [example value]
   - Expected: Field validates
   - Expected: Related fields update if applicable

5. **User clicks [Submit/Save/Create] button**
   - Expected: Button shows loading state
   - Expected: Form disables during submission
   - Expected: Success/error message appears within 2s

6. **User sees confirmation**
   - Expected: Success toast appears
   - Expected: New {entity} appears in list
   - Expected: User can immediately interact with new {entity}

### Success Criteria

- [ ] All steps complete without errors
- [ ] Total time < {N} seconds
- [ ] User receives clear feedback at each step
- [ ] User can complete flow without documentation/help

### Edge Cases

1. **User submits with invalid data**
   - Expected: Clear error messages
   - Expected: Focus returns to first invalid field
   - Expected: Valid data is preserved

2. **Network request fails**
   - Expected: Error message explains what happened
   - Expected: User can retry without losing data
   - Expected: Form is still usable

3. **User navigates away mid-flow**
   - Expected: Unsaved changes warning (if applicable)
   - Expected: Data is not saved
   - Expected: No partial/corrupted state

---

## Flow 2: {Secondary User Goal}

**User Goal:** As a [user type], I want to [action] so that [benefit]

**Prerequisites:**
- [Required state/data]

**Time Budget:** < {N} seconds

### Steps

[Repeat steps format from Flow 1]

### Success Criteria

[Same format as Flow 1]

### Edge Cases

[Same format as Flow 1]

---

## Flow 3: {Alternative Path}

[Continue pattern for each major user flow]

---

## Common User Errors

**Error 1: User forgets required field**
- **Prevention:** Mark required fields clearly
- **Recovery:** Show validation errors immediately
- **Message:** "Please enter [field name]"

**Error 2: User enters invalid format**
- **Prevention:** Show input format hint
- **Recovery:** Validate on blur, show example
- **Message:** "[Field name] must be in format: [example]"

**Error 3: User loses internet connection**
- **Prevention:** Show connection status indicator
- **Recovery:** Queue action, retry when online
- **Message:** "Connection lost. Will retry when online."

---

## Flow Dependencies

```
Flow 1 (Create {Entity})
   ↓ Creates data needed for
Flow 2 (Edit {Entity})
   ↓ Modified entity used in
Flow 3 (Delete {Entity})
```

**Test Order:** Must test Flow 1 → Flow 2 → Flow 3 in sequence.

---

## Performance Requirements

| Flow | Time Budget | Measured At |
|------|-------------|-------------|
| Flow 1 | < 5 seconds | From click to confirmation |
| Flow 2 | < 3 seconds | From open to save |
| Flow 3 | < 2 seconds | From click to removal |

**Measurement:** Use Chrome DevTools Performance tab, measure 3x, use median.

---

## Accessibility Requirements

**Keyboard Navigation:**
- All flows completable with keyboard only
- Tab order is logical (top → bottom, left → right)
- Escape key closes modals/cancels actions

**Screen Reader:**
- All actions announced
- Form errors read aloud
- Success/error messages read aloud

**Visual:**
- All text at least 4.5:1 contrast ratio
- Interactive elements at least 44×44px touch target
- Focus indicators visible on all interactive elements

---

## Test Data

**Valid Test Data:**
```json
{
  "name": "Test {Entity} 1",
  "description": "Valid description for testing",
  "status": "active",
  "properties": {
    "field1": "value1",
    "field2": 42
  }
}
```

**Invalid Test Data:**
```json
{
  "name": "",  // Empty - should fail
  "description": "x",  // Too short - should fail
  "status": "invalid",  // Not in enum - should fail
}
```

---

## Success Metrics

**Flow Completion Rate:** > 95% of users complete flow without errors

**Time to Completion:** < {N} seconds (median across all users)

**Error Rate:** < 5% of attempts result in errors

**User Satisfaction:** > 4.0/5.0 rating ("easy to use")
```

## Variables

- `{Feature Name}` - Human-readable feature name
- `{N}-{M}-{feature-name}` - Feature ID
- `{entity}` - Lowercase entity name (e.g., "course")
- `{Entity}` - Title case entity name (e.g., "Course")
- `{N}` - Number placeholder for time budgets

## Usage

1. Copy template to `one/things/features/{N}-{M}-{feature-name}/tests.md`
2. Write user flows from user perspective (not technical)
3. Define time budgets for each flow
4. List all steps with expected outcomes
5. Document edge cases and error scenarios
6. Specify accessibility requirements
7. Provide test data examples

## Common Mistakes

- **Mistake:** Writing flows from developer perspective
  - **Fix:** Use "User does X" not "System calls Y"
- **Mistake:** No time budgets
  - **Fix:** Every flow must have < N seconds requirement
- **Mistake:** Missing edge cases
  - **Fix:** Always test invalid input, network errors, navigation
- **Mistake:** No accessibility requirements
  - **Fix:** Specify keyboard, screen reader, visual requirements
- **Mistake:** Vague success criteria
  - **Fix:** Make criteria specific and measurable

## Related Patterns

- **acceptance-criteria-template.md** - Specific, measurable criteria
- **technical-test-template.md** - Implementation tests
- **wireframe-template.md** - Visual design that enables flows
