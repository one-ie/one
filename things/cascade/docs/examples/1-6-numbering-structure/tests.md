# Tests for Feature 1-6: Numbering and File Structure

**Feature:** 1-6-numbering-structure
**Status:** Tests Defined → Design Phase
**Quality Agent:** agent-quality.md

---

## User Flows

### Flow 1: Assign Plan Number
**User goal:** Director assigns unique plan number
**Time budget:** < 1 second
**Steps:**
1. Idea validated
2. Director queries existing plans
3. Director assigns next number (maxPlanNumber + 1)
4. Plan ID: `N-plan-name`
5. File created: `plans/N-plan-name.md`
6. Event logged

**Acceptance Criteria:**
- [ ] Plan number unique (no duplicates)
- [ ] Plan number sequential (no gaps unless intentional)
- [ ] File created in correct location
- [ ] Filename matches ID
- [ ] Assignment time: < 1 second
- [ ] Event logged with plan number

---

### Flow 2: Assign Feature Numbers
**User goal:** Director assigns feature numbers within plan
**Time budget:** < 2 seconds for 5 features
**Steps:**
1. Plan created with ID: `2-course-platform`
2. Director breaks into 4 features
3. Features numbered: `2-1`, `2-2`, `2-3`, `2-4`
4. Files created: `features/2-1-course-crud.md`, etc.
5. Events logged

**Acceptance Criteria:**
- [ ] Feature numbers inherit plan number
- [ ] Feature numbers sequential within plan
- [ ] Files created in correct location
- [ ] Filenames match IDs
- [ ] Total time: < 2 seconds
- [ ] Events logged

---

### Flow 3: Create Task List
**User goal:** Director creates numbered tasks for feature
**Time budget:** < 3 seconds for 6 tasks
**Steps:**
1. Feature approved: `2-1-course-crud`
2. Director creates task list
3. Tasks numbered: `2-1-task-1`, `2-1-task-2`, ..., `2-1-task-6`
4. File created: `features/2-1-course-crud/tasks.md`
5. Event logged

**Acceptance Criteria:**
- [ ] Task numbers inherit feature number
- [ ] Task numbers sequential
- [ ] Task list file in feature subdirectory
- [ ] Filename: `{featureId}/tasks.md`
- [ ] Total time: < 3 seconds
- [ ] Event logged

---

### Flow 4: Parse and Validate IDs
**User goal:** System understands hierarchical IDs
**Time budget:** < 10ms per ID
**Steps:**
1. System receives ID (e.g., `2-1-task-3`)
2. System parses: plan=2, feature=1, task=3
3. System validates format
4. System extracts components
5. System uses for file operations

**Acceptance Criteria:**
- [ ] Parses plan IDs: `N-name`
- [ ] Parses feature IDs: `N-M-name`
- [ ] Parses task IDs: `N-M-task-K`
- [ ] Rejects invalid formats
- [ ] Parse time: < 10ms
- [ ] Extracted components correct

---

### Flow 5: Navigate Hierarchy via IDs
**User goal:** Developer finds all related files quickly
**Time budget:** < 5 seconds
**Steps:**
1. Developer has feature ID: `2-1-course-crud`
2. Developer searches: `grep "2-1-" -r .`
3. System returns all files:
   - `features/2-1-course-crud.md`
   - `features/2-1-course-crud/tests.md`
   - `features/2-1-course-crud/design.md`
   - `features/2-1-course-crud/tasks.md`
   - `events/completed/2-1-course-crud-complete.md`
4. Developer navigates hierarchy

**Acceptance Criteria:**
- [ ] Search finds all related files
- [ ] Hierarchy clear from IDs
- [ ] Search time: < 5 seconds
- [ ] Files sort naturally (1-1 before 1-2)
- [ ] No ambiguity
- [ ] Easy to navigate

---

## Technical Tests

### Unit Tests

**Number Assignment:**
- [ ] `assignPlanNumber()` returns next number
- [ ] `assignPlanNumber()` increments correctly (1, 2, 3, ...)
- [ ] `assignFeatureNumber(planId)` returns next feature number
- [ ] `assignFeatureNumber("2-*")` returns 2-1, 2-2, 2-3, ...
- [ ] `assignTaskNumber(featureId)` returns task numbers
- [ ] `assignTaskNumber("2-1-*")` returns 2-1-task-1, 2-1-task-2, ...

**ID Parsing:**
- [ ] `parseId("1-workflow")` returns { type: "plan", planNumber: 1, name: "workflow" }
- [ ] `parseId("2-1-course-crud")` returns { type: "feature", planNumber: 2, featureNumber: 1, name: "course-crud" }
- [ ] `parseId("2-1-task-3")` returns { type: "task", planNumber: 2, featureNumber: 1, taskNumber: 3 }
- [ ] `parseId("invalid")` throws error

**ID Validation:**
- [ ] `validateId("1-workflow", "plan")` returns true
- [ ] `validateId("2-1-feature", "feature")` returns true
- [ ] `validateId("2-1-task-1", "task")` returns true
- [ ] `validateId("invalid", "plan")` returns false
- [ ] `validateId("1-workflow", "feature")` returns false (wrong type)

**File Creation:**
- [ ] `createPlanFile(planId)` creates file in `plans/`
- [ ] `createFeatureFile(featureId)` creates file in `features/`
- [ ] `createTaskFile(featureId)` creates file in `features/{featureId}/`
- [ ] Files created with correct names
- [ ] Directories created automatically if missing

---

### Integration Tests

**Complete Numbering Flow:**
- [ ] Idea validated → Plan number assigned (1)
- [ ] Plan created → Features numbered (1-1, 1-2, 1-3)
- [ ] Features approved → Tasks numbered (1-1-task-1, ...)
- [ ] All files created in correct locations
- [ ] All events logged with numbers

**Multiple Plans:**
- [ ] Plan 1 created (features 1-1, 1-2, 1-3)
- [ ] Plan 2 created (features 2-1, 2-2, 2-3, 2-4)
- [ ] Plan 3 created (features 3-1, 3-2)
- [ ] No number conflicts
- [ ] All hierarchies independent

**Search and Navigation:**
- [ ] Search "1-1-" finds all feature 1-1 files
- [ ] Search "2-*" finds all plan 2 files
- [ ] Files sort correctly (ls shows natural order)
- [ ] Navigation clear and intuitive

---

### E2E Tests

**Complete Workflow with Numbering:**
- [ ] Idea → Plan 2 (`2-course-platform`)
- [ ] Plan → Features (2-1, 2-2, 2-3, 2-4)
- [ ] Feature 2-1 → Tasks (2-1-task-1, ..., 2-1-task-6)
- [ ] All files in correct locations
- [ ] All IDs parse correctly
- [ ] Hierarchy clear from IDs

**Scale Test:**
- [ ] 10 plans created
- [ ] 50 features total (varying per plan)
- [ ] 200 tasks total
- [ ] All numbers unique
- [ ] All files organized correctly
- [ ] Search performance acceptable

**Developer Experience:**
- [ ] New developer understands hierarchy in < 5 minutes
- [ ] ID reveals relationships (2-1-task-3 = Plan 2, Feature 1, Task 3)
- [ ] Search finds files quickly
- [ ] Git operations natural (sort, branch names, commit messages)

---

## Definition of Done

- [ ] Numbering system documented
- [ ] File structure defined
- [ ] ID parsing works correctly
- [ ] Validation catches errors
- [ ] Directories created automatically
- [ ] Hierarchy clear from IDs
- [ ] System scales to 100+ features
- [ ] All tests pass

---

**Next:** Design phase - Numbering logic and file system architecture
