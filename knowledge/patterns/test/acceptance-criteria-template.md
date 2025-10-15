# Pattern: Acceptance Criteria Template

**Category:** Testing
**Context:** When defining specific, measurable criteria that prove a feature works correctly
**Problem:** Need clear, testable criteria that can be checked off without ambiguity

## Solution

Write acceptance criteria in Given-When-Then format, make them specific and measurable, tie to user flows, keep them independent.

## Template

```markdown
# Acceptance Criteria: {Feature Name}

**Feature:** {N}-{M}-{feature-name}
**User Flows Reference:** {N}-{M}-{feature-name}/tests.md
**Date:** YYYY-MM-DD
**Quality Agent:** [Your name]

---

## Critical Criteria (Must Pass)

These criteria MUST pass for the feature to be considered complete.

### AC-1: User can [action]

**Given:** User is authenticated and on [page/section]
**When:** User clicks [button] and fills [form fields]
**Then:**
- New {entity} is created in database
- User sees success toast message
- {Entity} appears in list immediately
- Form resets to empty state

**Test Method:** Manual + Automated
**Priority:** Critical
**User Flow:** Flow 1, Step 5-6

---

### AC-2: [Condition] displays correctly

**Given:** [Precondition/data state]
**When:** User navigates to [page]
**Then:**
- [Specific element] is visible
- [Element] contains [expected text/data]
- [Element] has [expected style/state]

**Test Method:** Automated (E2E)
**Priority:** Critical
**User Flow:** Flow 1, Step 1

---

### AC-3: Validation prevents invalid [action]

**Given:** User is filling [form]
**When:** User enters [invalid data]
**Then:**
- Form shows error message: "[exact message]"
- Submit button is disabled
- Invalid field is highlighted
- Focus moves to invalid field

**Test Method:** Automated (Integration)
**Priority:** Critical
**User Flow:** Flow 1, Edge Case 1

---

### AC-4: Real-time updates work

**Given:** User A creates/updates [entity]
**When:** User B is viewing [list/page]
**Then:**
- User B sees update within 2 seconds
- No page refresh required
- Update is animated (not jarring)
- Data is consistent across users

**Test Method:** Manual (multi-user scenario)
**Priority:** Critical
**User Flow:** Flow 1, Step 6

---

## Important Criteria (Should Pass)

These criteria should pass but are not blockers.

### AC-5: Performance meets targets

**Given:** [Typical data load - specify size]
**When:** User performs [action]
**Then:**
- Action completes in < {N}ms (p95)
- No visible lag or jank
- Optimistic updates show immediately
- Network latency handled gracefully

**Test Method:** Automated (Performance test)
**Priority:** Important
**Performance Target:** [Specific metric]

---

### AC-6: Empty state is helpful

**Given:** No {entities} exist yet
**When:** User navigates to [list page]
**Then:**
- Empty state graphic is shown
- Message explains what {entities} are
- Call-to-action button is prominent
- User can create first {entity} from empty state

**Test Method:** Manual
**Priority:** Important
**User Flow:** Edge case

---

### AC-7: Error messages are clear

**Given:** [Error condition - network, validation, permission]
**When:** Error occurs during [action]
**Then:**
- Error message explains what happened
- Error message suggests how to fix
- User can retry without losing data
- Technical details hidden by default (but accessible)

**Test Method:** Manual (simulate errors)
**Priority:** Important
**User Flow:** Flow 1, Edge Case 2

---

## Nice-to-Have Criteria (Optional)

These criteria enhance UX but are not required for launch.

### AC-8: Keyboard shortcuts work

**Given:** User is on [page]
**When:** User presses [key combination]
**Then:**
- [Expected action] happens
- Shortcut is discoverable (tooltip/help)

**Test Method:** Manual
**Priority:** Nice-to-have
**Milestone:** v1.1

---

### AC-9: Mobile experience is optimized

**Given:** User is on mobile device (< 768px)
**When:** User performs [any flow]
**Then:**
- All actions are touch-friendly (44×44px min)
- Text is readable without zoom
- Modals work well on small screens
- Performance is acceptable on 3G

**Test Method:** Manual (device testing)
**Priority:** Nice-to-have
**Milestone:** v1.2

---

## Ontology Alignment Criteria

These ensure the implementation follows the 6-dimension ontology.

### AC-10: Data stored correctly in ontology

**Given:** User creates [entity]
**When:** Data is saved
**Then:**
- Entity in `entities` table with correct `type`
- Properties in `properties` field (JSON)
- `organizationId` is set correctly (multi-tenancy)
- `status` is set to "draft" initially
- `createdAt` and `updatedAt` timestamps are set

**Test Method:** Automated (Unit test service)
**Priority:** Critical
**Ontology:** Things dimension

---

### AC-11: Connections created correctly

**Given:** User creates relationship between [entity A] and [entity B]
**When:** Relationship is saved
**Then:**
- Connection in `connections` table
- `sourceId` and `targetId` are correct
- `type` matches connection type in ontology
- `metadata` contains relationship-specific data
- Bidirectional if specified

**Test Method:** Automated (Integration test)
**Priority:** Critical
**Ontology:** Connections dimension

---

### AC-12: Events logged correctly

**Given:** User performs [action]
**When:** Action completes
**Then:**
- Event in `events` table
- `type` matches ontology event type
- `actorId` is user who performed action
- `targetId` is affected entity
- `timestamp` is accurate
- `metadata` contains action-specific data

**Test Method:** Automated (Integration test)
**Priority:** Important
**Ontology:** Events dimension

---

## Cross-Feature Criteria

These ensure integration with other features works.

### AC-13: Works with [Related Feature]

**Given:** [Related feature] is active
**When:** User uses this feature
**Then:**
- Data flows correctly between features
- No conflicts or race conditions
- Both features remain functional

**Test Method:** Integration test
**Priority:** Critical (if related feature is critical)
**Dependency:** Feature {X}-{Y}

---

## Measurement Criteria

These define how we measure success post-launch.

### MC-1: Usage metrics

**Metric:** Daily active users performing [action]
**Target:** > {N} per day within 30 days
**Measurement:** Analytics event tracking

### MC-2: Success rate

**Metric:** Percentage of [action] attempts that succeed
**Target:** > 95%
**Measurement:** Error rate tracking

### MC-3: Time to completion

**Metric:** Median time to complete [user flow]
**Target:** < {N} seconds
**Measurement:** Performance monitoring

---

## Acceptance Criteria Checklist

**Before marking AC as complete:**
- [ ] Criterion is specific and measurable
- [ ] Test method is documented
- [ ] Expected vs actual behavior is clear
- [ ] Criterion maps to user flow
- [ ] Priority is assigned
- [ ] Test data is available

**When testing:**
- [ ] Tested in isolation (not dependent on other ACs)
- [ ] Tested with invalid data
- [ ] Tested on target browsers/devices
- [ ] Tested by someone other than implementer
- [ ] Screenshots/recordings captured for visual criteria

---

## Test Execution Log

| AC ID | Test Date | Tester | Result | Notes |
|-------|-----------|--------|--------|-------|
| AC-1  | YYYY-MM-DD | [Name] | ✅ Pass | [Any notes] |
| AC-2  | YYYY-MM-DD | [Name] | ❌ Fail | [Issue description] |
| AC-3  | YYYY-MM-DD | [Name] | 🔄 Retest | [After fix] |

**Overall Status:** {N} passed, {M} failed, {P} pending

---

## Failure Analysis

**When AC fails:**

1. **Document the failure**
   - What was expected vs what happened
   - Steps to reproduce
   - Screenshots/error messages

2. **Classify the failure**
   - Logic error in implementation?
   - Missing dependency?
   - Wrong pattern applied?
   - AC was unclear/incorrect?

3. **Reference lessons learned**
   - Search for similar issues: `grep -i "keyword" lessons-learned.md`

4. **Propose solution**
   - Problem solver analyzes
   - Specialist implements fix
   - Retest AC after fix
   - Add lesson if new pattern discovered

---

## Success Metrics

**Feature is ready when:**
- [ ] All Critical ACs pass (100%)
- [ ] All Important ACs pass (≥ 90%)
- [ ] Performance ACs meet targets
- [ ] Ontology alignment ACs pass
- [ ] Accessibility ACs pass
- [ ] No unresolved test failures
```

## Variables

- `{Feature Name}` - Human-readable feature name
- `{N}-{M}-{feature-name}` - Feature ID
- `{entity}` - Lowercase entity name
- `{Entity}` - Title case entity name
- `{N}`, `{M}`, `{P}` - Number placeholders

## Usage

1. Copy template to `one/things/features/{N}-{M}-{feature-name}/tests.md` (same file as user flows)
2. Write criteria in Given-When-Then format
3. Make each criterion specific and measurable
4. Assign priority (Critical/Important/Nice-to-have)
5. Map to user flows
6. Document test method (Manual/Automated)
7. Track execution in log table

## Common Mistakes

- **Mistake:** Vague criteria ("User can use feature")
  - **Fix:** Be specific ("User can create {entity} with valid data")
- **Mistake:** No Given-When-Then structure
  - **Fix:** Always use GWT format for clarity
- **Mistake:** Criteria depend on each other
  - **Fix:** Make each AC independently testable
- **Mistake:** No priority assigned
  - **Fix:** Every AC must be Critical/Important/Nice-to-have
- **Mistake:** Missing ontology alignment
  - **Fix:** Always verify data stored correctly in 6 dimensions

## Related Patterns

- **user-flow-template.md** - High-level user goals
- **technical-test-template.md** - Implementation tests
- **lessons-learned.md** - Failure analysis reference
