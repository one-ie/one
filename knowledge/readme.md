# Knowledge Base

This directory contains the institutional knowledge of the ONE Platform development workflow: lessons learned from problems solved and reusable patterns for common implementations.

## Structure

```
one/knowledge/
├── lessons-learned.md          # Problems solved and solutions found
├── patterns/                   # Reusable implementation templates
│   ├── backend/               # Service, mutation, query templates
│   ├── frontend/              # Page, component, form templates
│   ├── design/                # Wireframe, component architecture templates
│   └── test/                  # User flow, acceptance criteria, technical test templates
└── readme.md                  # This file
```

## How to Use

### When Implementing Features

**1. Read relevant patterns BEFORE coding:**

```bash
# Backend feature
Read patterns/backend/service-template.md
Read patterns/backend/mutation-template.md
Read patterns/backend/query-template.md

# Frontend feature
Read patterns/frontend/page-template.md
Read patterns/frontend/component-template.md
Read patterns/frontend/form-template.md

# Design phase
Read patterns/design/wireframe-template.md
Read patterns/design/component-architecture.md

# Testing phase
Read patterns/test/user-flow-template.md
Read patterns/test/acceptance-criteria-template.md
Read patterns/test/technical-test-template.md
```

**2. Search for similar problems:**

```bash
# Search lessons learned for relevant keywords
grep -i "authentication" lessons-learned.md
grep -i "validation" lessons-learned.md
grep -i "real-time" lessons-learned.md
```

**3. Apply patterns:**
- Copy template to your feature directory
- Replace variables with your entity names
- Customize for specific requirements
- Follow the examples provided

### When Solving Problems

**1. Search for similar issues:**

```bash
# Search by error message
grep -i "cannot read property" lessons-learned.md

# Search by feature area
grep -i "Backend" lessons-learned.md | grep -i "validation"

# Search by ontology dimension
grep -i "connections" lessons-learned.md
```

**2. If similar issue found:**
- Review the solution
- Apply the same pattern
- Verify it works
- Reference the lesson in your commit

**3. If no similar issue found:**
- Solve the problem
- **Add a new lesson to lessons-learned.md**
- Use the lesson template at bottom of file
- Help future developers (including future you!)

## Searching Tips

**By keyword:**
```bash
grep -i "keyword" lessons-learned.md
```

**By date:**
```bash
grep "2025-01" lessons-learned.md
```

**By feature:**
```bash
grep "Feature: 1-1" lessons-learned.md
```

**By category:**
```bash
grep "Backend" lessons-learned.md
grep "Frontend" lessons-learned.md
grep "Testing" lessons-learned.md
```

**Multiple keywords (AND):**
```bash
grep -i "authentication" lessons-learned.md | grep -i "error"
```

**Context (show surrounding lines):**
```bash
grep -A 5 -B 2 "keyword" lessons-learned.md
```

## Philosophy

1. **Every problem is a learning opportunity** - Don't just fix and move on, capture the lesson
2. **Patterns emerge from practice** - Don't prematurely create patterns, let them emerge from repeated lessons
3. **Simplicity wins** - Grep and markdown beat complex knowledge management systems
4. **Future you will thank you** - Document for future developers (who might be you)
5. **Institutional knowledge compounds** - Every lesson makes the entire system smarter

---

**Built with:** Markdown, grep, git, and institutional learning.
