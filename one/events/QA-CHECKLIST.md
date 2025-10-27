# Demo Pages QA Checklist (Pre-Production)

**Feature:** Beautiful, Interactive 6-Dimension Ontology Demos
**Status:** Ready for QA Testing
**Created:** 2025-10-25
**Version:** 1.0.0

---

## 1. Test Execution Checklist

### 1.1 Unit Tests
- [ ] All unit tests pass (100% pass rate)
  - [ ] HooksDemo component tests pass
  - [ ] SearchDemo component tests pass
  - [ ] PeopleDemo component tests pass
  - [ ] Hook tests pass (useProvider, useGroups, etc.)
- [ ] No flaky tests (all tests pass consistently)
- [ ] Code coverage >= 80% for all dimensions
- [ ] No console errors or warnings in test output

**Command to verify:**
```bash
bun test tests/demo/unit
```

### 1.2 Integration Tests
- [ ] All integration tests pass (100% pass rate)
  - [ ] Demo data flow tests pass
  - [ ] Provider switching tests pass
  - [ ] Ontology operations tests pass
- [ ] No flaky tests
- [ ] Backend connection successful
- [ ] Test data cleanup working properly

**Command to verify:**
```bash
bun test tests/demo/integration
```

### 1.3 E2E Tests
- [ ] All E2E tests pass (100% pass rate)
  - [ ] Demo index page tests pass
  - [ ] Groups dimension tests pass
  - [ ] People dimension tests pass
  - [ ] Things dimension tests pass
  - [ ] Connections dimension tests pass
  - [ ] Events dimension tests pass
  - [ ] Search dimension tests pass
- [ ] All browser tests pass (Chromium, Firefox, Safari)
- [ ] All mobile device tests pass (iOS, Android)
- [ ] No test timeouts or failures
- [ ] Screenshots captured on failures

**Command to verify:**
```bash
bun run test:e2e
```

### 1.4 Visual Regression Tests
- [ ] All visual snapshots match (100% pass rate)
  - [ ] Desktop layouts match
  - [ ] Mobile layouts match
  - [ ] Tablet layouts match
  - [ ] Dark mode layouts match
  - [ ] Light mode layouts match
- [ ] No unexpected visual changes
- [ ] Component styling consistent across pages

**Command to verify:**
```bash
bun run test:visual
```

### 1.5 Accessibility Tests
- [ ] WCAG 2.1 AA compliance verified
  - [ ] Keyboard navigation works (Tab, Enter, Escape)
  - [ ] Screen reader compatibility tested
  - [ ] Color contrast >= 4.5:1 for all text
  - [ ] Images have alt text
  - [ ] Form errors properly announced
  - [ ] Focus visible on all interactive elements
- [ ] All 6 dimensions are accessible
- [ ] Error messages are accessible
- [ ] Loading states are announced

**Manual testing required:**
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Check color contrast with WebAIM Contrast Checker
- [ ] Run axe DevTools accessibility audit

---

## 2. Functional Testing Checklist

### 2.1 Demo Index Page (/demo)
- [ ] Page loads successfully
- [ ] Page loads in < 1 second
- [ ] All 6 navigation cards visible
- [ ] Navigation cards have correct links
- [ ] Navigation cards respond to click
- [ ] Navigation cards respond to keyboard (Enter/Space)
- [ ] Status badges display correctly
- [ ] Hero section renders with correct styling
- [ ] No console errors
- [ ] Responsive on mobile (375px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on desktop (1920px)

**Manual test steps:**
1. Navigate to `http://localhost:4321/demo`
2. Verify page loads immediately
3. Check all 6 cards are visible (Groups, People, Things, Connections, Events, Search)
4. Click each card and verify navigation works
5. Use keyboard (Tab, Enter) to navigate and verify
6. Open DevTools and verify no errors in console
7. Resize window and verify responsive layout

### 2.2 Groups Dimension (/demo/groups)
- [ ] Page loads with groups data
- [ ] Groups list displays correctly
- [ ] Can create new group
- [ ] Can read/view group details
- [ ] Can update group properties
- [ ] Can delete/archive group
- [ ] Hierarchical groups display correctly
- [ ] Parent-child relationships shown
- [ ] Pagination works (if applicable)
- [ ] Search/filter works
- [ ] Errors handled gracefully
- [ ] Loading states display

**Manual test steps:**
1. Navigate to `/demo/groups`
2. Verify list loads within 1 second
3. Click "Create Group" button
4. Fill form: name="Test Group", type="organization"
5. Click "Create" and verify success message
6. New group appears in list within 500ms
7. Click group to view details
8. Click "Edit" and update description
9. Click "Save" and verify update succeeds
10. Click "Delete" and confirm removal

### 2.3 People Dimension (/demo/people)
- [ ] Page loads with people data
- [ ] People list displays correctly
- [ ] Can create new person (role, email, etc.)
- [ ] Can view person details and roles
- [ ] Can update person properties
- [ ] Can delete person
- [ ] Role-based access shown (org_owner, org_user, customer)
- [ ] Authorization information displayed
- [ ] Errors handled gracefully
- [ ] Loading states display

**Manual test steps:**
1. Navigate to `/demo/people`
2. Verify list loads
3. Create new person
4. Verify person appears with correct role
5. Click person to view details
6. Update role and verify change

### 2.4 Things Dimension (/demo/things)
- [ ] Page loads with things data
- [ ] Things list displays with filters
- [ ] Can filter by type (course, blog_post, etc.)
- [ ] Can filter by status (draft, active, published)
- [ ] Can search things by name
- [ ] Search debounces and works efficiently
- [ ] Can create new thing
- [ ] Can view thing details and properties
- [ ] Can update thing properties
- [ ] Can delete thing
- [ ] Properties object renders correctly
- [ ] Errors handled gracefully
- [ ] Performance: search 500+ things within 500ms

**Manual test steps:**
1. Navigate to `/demo/things`
2. Verify list loads with filter options
3. Select filter "type: course" and verify list updates
4. Type in search box "React" and verify results within 300ms
5. Verify no results show for "zxcvbnm" (nonsense)
6. Click "Create Thing" button
7. Fill form and create thing
8. Verify thing appears in list
9. Click thing to view details
10. Update property and save

### 2.5 Connections Dimension (/demo/connections)
- [ ] Page loads with connections data
- [ ] Connections graph displays
- [ ] Graph shows nodes for things
- [ ] Graph shows edges for connections
- [ ] Can create new connection
- [ ] Can filter by relationship type
- [ ] Can view connection details
- [ ] Connection metadata displays
- [ ] Can delete connection
- [ ] Graph updates in real-time
- [ ] Graph layout smooth and readable
- [ ] Errors handled gracefully

**Manual test steps:**
1. Navigate to `/demo/connections`
2. Verify graph displays with nodes and edges
3. Click on a connection to see details
4. Filter by relationship type and verify graph updates
5. Create new connection and verify it appears
6. Delete connection and verify it disappears

### 2.6 Events Dimension (/demo/events)
- [ ] Page loads with events timeline
- [ ] Events display in reverse chronological order (most recent first)
- [ ] Can filter events by type
- [ ] Can filter events by date range
- [ ] Event details display correctly
- [ ] Actor information shown
- [ ] Target information shown
- [ ] Metadata displays as JSON
- [ ] Timeline loads 1000+ events efficiently
- [ ] Virtualization works (< 50 DOM nodes)
- [ ] Scrolling smooth (60 FPS)
- [ ] Errors handled gracefully

**Manual test steps:**
1. Navigate to `/demo/events`
2. Verify timeline loads with events
3. Verify events ordered most recent first
4. Filter by type "thing_created" and verify results
5. Filter by date and verify results
6. Click event to see full details
7. Verify JSON metadata displays correctly
8. Scroll through timeline and verify smooth performance

### 2.7 Search Dimension (/demo/search)
- [ ] Page loads with search UI
- [ ] Search input focused by default
- [ ] Results appear within 500ms of typing
- [ ] Search debounces (no search on every keystroke)
- [ ] Results grouped by type (things, events, knowledge)
- [ ] Results ranked by relevance
- [ ] Can filter results by dimension
- [ ] "No results found" message shown when appropriate
- [ ] Performance: search 10,000+ entities within 500ms
- [ ] Errors handled gracefully
- [ ] Clear button works

**Manual test steps:**
1. Navigate to `/demo/search`
2. Type "React" and wait for results
3. Verify results appear within 500ms
4. Verify results grouped by type
5. Select filter "Things only" and verify results update
6. Type nonsense query and verify "No results found"
7. Click clear and verify search clears

---

## 3. Backend Connection Testing

### 3.1 Connected State
- [ ] Backend provider loads successfully
- [ ] Connection status shows "Connected"
- [ ] Connection status badge is green
- [ ] Data comes from real Convex backend
- [ ] API response time < 200ms
- [ ] No connection errors in console

**Test steps:**
1. Ensure backend is running
2. Load any demo page
3. Check connection status indicator
4. Open Network tab in DevTools
5. Perform operation and verify API calls complete within 200ms

### 3.2 Disconnected State (Mock Mode)
- [ ] Backend unavailable fallback works
- [ ] Connection status shows "Mock Data Mode"
- [ ] Connection status badge is red/yellow
- [ ] Data comes from mock provider
- [ ] Page still fully functional
- [ ] All operations work with mock data
- [ ] No errors in console

**Test steps:**
1. Shut down backend or disable network
2. Load demo page
3. Verify connection status shows mock mode
4. Verify page still functional
5. Perform operations and verify they work with mock data

### 3.3 Error Handling
- [ ] Network timeout handled gracefully (5+ seconds)
- [ ] 500 errors show error message
- [ ] Form remains populated on error
- [ ] Retry button available
- [ ] Error messages clear and helpful
- [ ] No uncaught exceptions

**Test steps:**
1. Simulate network latency (DevTools throttle)
2. Make request and verify timeout message after 5s
3. Simulate 500 error response
4. Verify form populated with original data
5. Verify error message explains what happened

---

## 4. Performance Testing Checklist

### 4.1 Page Load Times
- [ ] Demo index page FCP (First Contentful Paint) < 800ms
- [ ] Demo index page LCP (Largest Contentful Paint) < 1200ms
- [ ] Demo dimension pages load < 1 second
- [ ] Initial load same as cached load (within 10%)
- [ ] No layout shifts (CLS < 0.1)

**Test with Lighthouse:**
```
Cmd+Shift+P → Run Lighthouse
```

### 4.2 API Performance
- [ ] All API calls complete < 200ms
- [ ] Concurrent requests handled efficiently
- [ ] No waterfall loading (requests in parallel)
- [ ] Search debounces (only final query sent)
- [ ] Pagination efficient (< 300ms per page)

**Test with DevTools Network tab:**
1. Open DevTools → Network tab
2. Perform operations
3. Check Timing column for each request
4. Verify all < 200ms

### 4.3 Rendering Performance
- [ ] Page interactive within 1 second (TTI)
- [ ] Scrolling smooth (60 FPS) in list views
- [ ] Large lists virtualized (< 100 DOM nodes)
- [ ] Form interactions responsive (no lag)
- [ ] Modal/dialog opens immediately
- [ ] Filter/search updates within 300ms

**Test with DevTools Performance tab:**
1. Open DevTools → Performance tab
2. Record while scrolling list
3. Check for 60 FPS (frames should be < 16.67ms)
4. No long tasks (> 50ms)

### 4.4 Resource Usage
- [ ] CSS bundle < 50KB gzipped
- [ ] JavaScript bundle < 100KB gzipped (per page)
- [ ] Images optimized and lazy-loaded
- [ ] No unused CSS or JavaScript
- [ ] Memory doesn't grow unbounded (no leaks)

**Test with DevTools:**
1. Network tab → Filter by type
2. Check file sizes
3. Memory tab → Check for memory leaks during operations

### 4.5 Lighthouse Audit
- [ ] Performance score >= 95
- [ ] Accessibility score >= 95
- [ ] Best Practices score >= 95
- [ ] SEO score >= 95
- [ ] No critical issues

**Run Lighthouse:**
```bash
npm run lighthouse
# or manually: Cmd+Shift+P → Run Lighthouse
```

---

## 5. Cross-Browser Testing Checklist

### 5.1 Desktop Browsers
- [ ] Chrome (latest) - All tests pass
- [ ] Firefox (latest) - All tests pass
- [ ] Safari (latest) - All tests pass
- [ ] Edge (latest) - All tests pass
- [ ] No visual differences between browsers
- [ ] No JavaScript errors in console

### 5.2 Mobile Browsers
- [ ] iOS Safari (latest) - All tests pass
- [ ] Chrome Mobile (latest) - All tests pass
- [ ] Samsung Internet (latest) - All tests pass
- [ ] No visual differences between mobile browsers
- [ ] Touch interactions work smoothly
- [ ] No horizontal scroll on mobile

### 5.3 Tablet Browsers
- [ ] iPad Safari - All tests pass
- [ ] Android Chrome - All tests pass
- [ ] Responsive layout correct for tablet viewport

---

## 6. Security Testing Checklist

- [ ] No XSS vulnerabilities
  - [ ] User input properly escaped
  - [ ] No innerHTML usage with user data
  - [ ] Event handlers sanitized
- [ ] No CSRF vulnerabilities
  - [ ] POST requests require CSRF tokens
  - [ ] Same-site cookies configured
- [ ] No SQL injection
  - [ ] All queries use parameterized statements
- [ ] No sensitive data in console logs
- [ ] No sensitive data in URLs
- [ ] API endpoints properly authenticated
- [ ] API endpoints properly authorized (group scoping)
- [ ] No sensitive data exposed in error messages
- [ ] Passwords never logged or displayed

**Test CSRF:**
1. Create form on external site that POSTs to demo
2. Verify request rejected or CSRF token required

**Test XSS:**
1. Try to inject `<script>alert('xss')</script>` in form fields
2. Verify script doesn't execute
3. Verify value properly escaped in display

---

## 7. Data Integrity Testing Checklist

### 7.1 Create Operations
- [ ] Created entities have all required fields
- [ ] IDs are unique
- [ ] Timestamps are correct
- [ ] Relationships are created correctly
- [ ] Events are logged for all creates
- [ ] Data persists in database

### 7.2 Read Operations
- [ ] Correct data returned
- [ ] Relationships populated correctly
- [ ] Filters work correctly
- [ ] Pagination returns correct subset
- [ ] Search results relevant

### 7.3 Update Operations
- [ ] Only specified fields updated
- [ ] Other fields unchanged
- [ ] Relationships preserved
- [ ] Timestamps updated
- [ ] Events logged
- [ ] Changes persisted

### 7.4 Delete Operations
- [ ] Entity archived (soft delete)
- [ ] Entity no longer in list
- [ ] Relationships cleaned up
- [ ] Events logged
- [ ] No orphaned records
- [ ] Can restore if needed (recoverable)

### 7.5 Multi-Tenant Isolation
- [ ] Cannot see data from other groups
- [ ] Cannot update other groups' data
- [ ] Cannot delete other groups' data
- [ ] Group filtering enforced in all queries
- [ ] No cross-group data leakage

**Test isolation:**
1. Create data in Group A
2. Switch to Group B
3. Verify Group A data not visible
4. Try to access Group A data directly
5. Verify access denied

---

## 8. User Experience Testing Checklist

### 8.1 Error Messages
- [ ] Error messages are clear and helpful
- [ ] Error messages don't use technical jargon
- [ ] Users know how to fix errors
- [ ] Error messages positioned near errors
- [ ] Colors distinct from success messages

### 8.2 Loading States
- [ ] Loading indicators visible immediately
- [ ] Loading indicators removed when done
- [ ] No loading state for very fast operations (< 200ms)
- [ ] Progress shown for long operations
- [ ] Spinners/skeletons used appropriately

### 8.3 Success Feedback
- [ ] Success messages shown for all operations
- [ ] Success messages auto-dismiss after 3-5 seconds
- [ ] Undo option available when appropriate
- [ ] Data updates immediately (optimistic updates)
- [ ] Toast notifications non-intrusive

### 8.4 Form Experience
- [ ] Form labels clear
- [ ] Form validation provides feedback
- [ ] Form errors prevent submission
- [ ] Form values preserved on error
- [ ] Tab order logical
- [ ] Required fields marked

### 8.5 Confirmation Dialogs
- [ ] Destructive actions require confirmation
- [ ] Delete/archive require confirmation
- [ ] Confirmation dialog clearly asks for action
- [ ] Cancel option available
- [ ] Default action safe (cancel/no)

---

## 9. Browser Compatibility Checklist

### 9.1 CSS Features
- [ ] CSS Grid supported
- [ ] CSS Flexbox supported
- [ ] CSS Custom Properties (variables)
- [ ] Dark mode (prefers-color-scheme)
- [ ] Transitions and animations
- [ ] Gradient backgrounds

### 9.2 JavaScript Features
- [ ] ES2020+ syntax works
- [ ] Async/await supported
- [ ] Fetch API supported
- [ ] LocalStorage available
- [ ] SessionStorage available
- [ ] Window.matchMedia available

### 9.3 DOM APIs
- [ ] IntersectionObserver supported
- [ ] ResizeObserver supported
- [ ] MutationObserver supported
- [ ] Scroll behavior supported

---

## 10. Documentation & Handoff Checklist

- [ ] README.md updated with demo instructions
- [ ] TEST-PLAN.md complete and current
- [ ] Test coverage report generated
- [ ] All test results documented
- [ ] Known issues documented
- [ ] Performance baseline established
- [ ] API documentation up to date
- [ ] Component prop types documented
- [ ] Hook documentation complete
- [ ] Error handling documented
- [ ] Backend integration documented

**Generate reports:**
```bash
bun test -- --coverage
bun run test:e2e -- --reporter=html
bun run lighthouse
```

---

## 11. Regression Testing Checklist

Before each release:

- [ ] Run full test suite (unit + integration + E2E)
- [ ] Run visual regression tests
- [ ] Run performance tests (Lighthouse)
- [ ] Manual smoke test all features
- [ ] Cross-browser spot check
- [ ] Mobile device spot check
- [ ] Accessibility spot check

**Release sign-off:**

- [ ] All tests pass
- [ ] No known regressions
- [ ] Performance baseline met
- [ ] QA manager approval
- [ ] Product owner sign-off

---

## 12. Final Checklist (Before Production)

### Code Quality
- [ ] No TypeScript errors (`bun astro check`)
- [ ] ESLint passes (`bun lint`)
- [ ] Code formatted (`bun format`)
- [ ] No console errors or warnings
- [ ] No unused imports or variables
- [ ] Comments are clear and helpful

### Test Coverage
- [ ] 80%+ statement coverage
- [ ] 80%+ branch coverage
- [ ] 80%+ function coverage
- [ ] All critical paths tested
- [ ] All error scenarios tested

### Performance
- [ ] Lighthouse scores >= 95
- [ ] Page load < 1 second
- [ ] API response < 200ms
- [ ] No memory leaks
- [ ] Smooth 60 FPS scrolling

### Security
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities
- [ ] No SQL injection risks
- [ ] Proper authentication
- [ ] Proper authorization
- [ ] No sensitive data exposure

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast adequate
- [ ] Focus visible
- [ ] No content gaps

### Cross-Browser
- [ ] Chrome passes
- [ ] Firefox passes
- [ ] Safari passes
- [ ] Edge passes
- [ ] iOS Safari passes
- [ ] Chrome Mobile passes

### Documentation
- [ ] README updated
- [ ] Tests documented
- [ ] API documented
- [ ] Components documented
- [ ] Hooks documented
- [ ] Known issues documented

### Sign-Off
- [ ] QA manager: ___________________
- [ ] Dev lead: ___________________
- [ ] Product manager: ___________________
- [ ] Release date: ___________________

---

## Notes & Issues

### Known Issues
(Document any issues found during testing)

### Recommended Improvements
(For future releases)

### Outstanding Tasks
(Anything that should be completed before release)

---

**Status:** Ready for Production
**Last Updated:** 2025-10-25
**Next Review:** (after release)
