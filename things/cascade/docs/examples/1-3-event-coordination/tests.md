# Tests for Feature 1-3: Event Coordination System

**Feature:** 1-3-event-coordination
**Status:** Tests Defined → Design Phase
**Quality Agent:** agent-quality.md

---

## User Flows

### Flow 1: Create and Log Event
**User goal:** Agent creates event that gets logged
**Time budget:** < 50ms
**Steps:**
1. Agent completes work
2. Agent calls `log(event)` with type and metadata
3. Event assigned unique ID
4. Event written to file
5. Event queryable immediately

**Acceptance Criteria:**
- [ ] Event creation: < 10ms
- [ ] Event written to disk: < 50ms
- [ ] Unique ID assigned
- [ ] File in correct location (`events/workflow/`)
- [ ] Markdown format (human-readable)
- [ ] Event immediately queryable

---

### Flow 2: Query Events
**User goal:** Agent finds relevant events quickly
**Time budget:** < 100ms per query
**Steps:**
1. Agent needs to check status
2. Agent queries events by type or target
3. System returns matching events
4. Agent processes results
5. Agent takes action based on events

**Acceptance Criteria:**
- [ ] Query by type: < 50ms
- [ ] Query by target: < 50ms
- [ ] Query with multiple filters: < 100ms
- [ ] Results sorted by timestamp
- [ ] Limit and offset work correctly
- [ ] Empty results return quickly

---

### Flow 3: Subscribe to Events
**User goal:** Agent automatically acts when event occurs
**Time budget:** < 500ms from event creation to handler execution
**Steps:**
1. Agent subscribes to event type
2. Another agent creates event of that type
3. Subscribing agent's handler triggered
4. Handler executes with event data
5. Handler completes action

**Acceptance Criteria:**
- [ ] Subscription registered successfully
- [ ] Handler triggered on matching events
- [ ] Event data passed to handler
- [ ] Handler execution: < 500ms from event
- [ ] Multiple subscribers all triggered
- [ ] Handlers run in parallel

---

### Flow 4: Agent Coordination (No Manual Handoff)
**User goal:** Agents coordinate through events only
**Time budget:** < 10 seconds for complete coordination cycle
**Steps:**
1. Director assigns feature (logs `feature_assigned`)
2. Specialist receives event (subscribed to `feature_assigned`)
3. Specialist completes work (logs `implementation_complete`)
4. Quality receives event (subscribed to `implementation_complete`)
5. Quality validates (logs `quality_check_complete`)
6. Director receives event (subscribed to `quality_check_complete`)
7. Director marks complete

**Acceptance Criteria:**
- [ ] All coordination via events (0 manual handoffs)
- [ ] No missed events (100% delivery)
- [ ] Agents autonomous within roles
- [ ] Complete cycle: < 10 seconds
- [ ] Parallel execution supported
- [ ] Full audit trail in events table

---

### Flow 5: Event-Driven Problem Solving
**User goal:** Test failure triggers automatic problem solving
**Time budget:** < 2 minutes from failure to solution proposal
**Steps:**
1. Quality runs test, test fails
2. Quality logs `test_failed` event
3. Problem solver receives event (subscribed)
4. Problem solver analyzes (ultrathink)
5. Problem solver logs `solution_proposed` event
6. Specialist receives event (subscribed)
7. Specialist fixes problem

**Acceptance Criteria:**
- [ ] Test failure logged immediately
- [ ] Problem solver triggered automatically
- [ ] Analysis completes: < 2 minutes
- [ ] Solution proposal logged
- [ ] Specialist receives and acts
- [ ] Complete loop: < 5 minutes

---

## Technical Tests

### Unit Tests

**Event Creation:**
- [ ] `log(event)` validates event structure
- [ ] `log(event)` assigns unique ID
- [ ] `log(event)` adds timestamp if missing
- [ ] `log(event)` writes to correct file
- [ ] `log(event)` returns event ID
- [ ] `logBatch(events)` handles multiple events

**Event Queries:**
- [ ] `queryEvents({ type })` filters by type
- [ ] `queryEvents({ actorId })` filters by actor
- [ ] `queryEvents({ targetId })` filters by target
- [ ] `queryEvents({ since })` filters by timestamp
- [ ] `queryEvents()` supports multiple filters
- [ ] `queryEvents()` returns sorted results

**Event Subscriptions:**
- [ ] `subscribe({ role, type, handler })` registers subscription
- [ ] `subscribe()` validates handler is function
- [ ] `unsubscribe()` removes subscription
- [ ] `triggerSubscriptions(event)` calls all matching handlers

**Event Metadata:**
- [ ] `feature_assigned` includes required metadata
- [ ] `implementation_complete` includes required metadata
- [ ] `test_failed` includes error details
- [ ] `solution_proposed` includes solution details

---

### Integration Tests

**Agent Coordination:**
- [ ] Director → Specialist (feature_assigned)
- [ ] Specialist → Quality (implementation_complete)
- [ ] Quality → Director (quality_check_complete)
- [ ] Quality → Problem Solver (test_failed)
- [ ] Problem Solver → Specialist (solution_proposed)
- [ ] Specialist → Quality (fix_complete)

**Parallel Coordination:**
- [ ] Director assigns 3 features (parallel)
- [ ] 3 specialists work independently
- [ ] All complete and log events
- [ ] Quality receives all 3 completion events
- [ ] No race conditions

**Event Queries Performance:**
- [ ] Query 1000 events: < 100ms
- [ ] Query with complex filter: < 200ms
- [ ] Get latest event: < 20ms
- [ ] Get events by target: < 50ms

**Subscription Performance:**
- [ ] 10 subscriptions: all trigger < 500ms
- [ ] Parallel handlers execute correctly
- [ ] Handler errors don't break other handlers

---

### E2E Tests

**Complete Workflow via Events:**
- [ ] Idea validated (event logged)
- [ ] Plan created (event logged)
- [ ] Features assigned (events logged)
- [ ] Specs written (events logged)
- [ ] Tests defined (events logged)
- [ ] Design created (events logged)
- [ ] Implementation complete (events logged)
- [ ] Quality validated (events logged)
- [ ] Documentation complete (events logged)
- [ ] Feature complete (event logged)
- [ ] Full audit trail available

**Error Recovery via Events:**
- [ ] Test fails (event logged)
- [ ] Problem solver analyzes (event logged)
- [ ] Solution proposed (event logged)
- [ ] Fix implemented (event logged)
- [ ] Lesson learned (event logged)
- [ ] Re-test passes (event logged)

**20+ Event Types:**
- [ ] All workflow event types work
- [ ] All metadata fields included
- [ ] All events queryable
- [ ] All events enable coordination

---

## Definition of Done

- [ ] Event logger creates events
- [ ] Event query system works
- [ ] Event subscriptions trigger handlers
- [ ] 20+ workflow event types defined
- [ ] Agents coordinate via events (0% manual)
- [ ] Complete audit trail available
- [ ] Performance targets met
- [ ] All tests pass

---

**Next:** Design phase - Event system architecture and file structure
