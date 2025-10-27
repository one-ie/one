# Agent Skills

This directory contains specialized skills for each ONE Platform agent. Each agent has a dedicated skills directory with task-specific capabilities.

## Skill Organization

```
.claude/skills/agents/
├── agent-backend/        # Backend specialist skills
├── agent-frontend/       # Frontend specialist skills
├── agent-designer/       # Design specialist skills
├── agent-director/       # Director/orchestration skills
├── agent-quality/        # Quality assurance skills
├── agent-documenter/     # Documentation skills
├── agent-ops/            # DevOps/operations skills
└── ...                   # One directory per agent
```

## How Agent Skills Work

1. **Skill Discovery**: When an agent is invoked, Claude Code automatically discovers skills in the agent's directory
2. **Progressive Loading**: Metadata (name, description) loads immediately; detailed instructions load on-demand
3. **Auto-Invocation**: Claude uses skills when relevant to the task without explicit user request
4. **Context Efficiency**: Skills are modular, reducing token overhead

## Skill File Structure

Each skill is a markdown file with YAML frontmatter:

```markdown
---
name: skill-name
description: What this skill does (max 1024 chars)
---

# Skill Name

## Purpose
What problem does this solve?

## Instructions
Step-by-step guidance for using this skill.

## Examples
Concrete code or usage examples.

## Related Skills
Links to complementary skills.
```

## Naming Convention

- Skill files: `lowercase-with-hyphens.md`
- Skill names: `agent-name:skill-name` (e.g., `agent-backend:create-mutation`)
- Maximum 64 characters for `name` field

## Examples

### Backend Skills
- `create-mutation.md` - Generate Convex mutations with validation
- `create-query.md` - Generate Convex queries with filtering
- `design-schema.md` - Design 6-dimension ontology schema

### Frontend Skills
- `create-page.md` - Generate Astro pages with SSR
- `create-component.md` - Generate React components
- `optimize-performance.md` - Optimize Lighthouse scores

### Designer Skills
- `create-wireframe.md` - Generate wireframes from tests
- `define-components.md` - Define component specifications
- `set-design-tokens.md` - Generate design tokens

## Usage in Agent Files

Add skills to an agent's frontmatter (`.claude/agents/agent-*.md`):

```yaml
---
name: agent-backend
description: Backend specialist...
tools: Read, Write, Edit, Bash, Grep, Glob
skills: create-mutation, create-query, design-schema
---
```

When this agent is invoked, these skills will be available for auto-discovery.

## Creating a New Skill

1. Create the skill file in the agent's directory
2. Add YAML frontmatter with `name` and `description`
3. Add instructions and examples
4. Reference from agent's `skills:` field

Example:

```bash
# Create skill for agent-backend
cat > .claude/skills/agents/agent-backend/design-schema.md << 'EOF'
---
name: design-schema
description: Design Convex schema for 6-dimension ontology
---

# Design Schema

## Purpose
Generate Convex schema that implements the 6-dimension ontology...
EOF
```

## Best Practices

### 1. Keep Skills Focused
- One skill = one clear task
- Examples: "create-mutation", "validate-query", "optimize-index"

### 2. Include Examples
- Concrete code samples
- Before/after comparisons
- Real-world use cases

### 3. Document Dependencies
- Link to related skills
- Mention prerequisites
- Note version compatibility

### 4. Version Your Skills
- Track changes in version history
- Update when agent requirements change
- Maintain backwards compatibility when possible

### 5. Progressive Detail
- Metadata (name, description) ~100 tokens
- Instructions ~500 tokens
- Examples/resources ~2000+ tokens (loaded on-demand)

## Skill Discovery

Claude Code automatically discovers skills when:

1. Agent is invoked via Task tool with `subagent_type`
2. Skills directory exists at `.claude/skills/agents/{agent-name}/`
3. SKILL.md files have valid YAML frontmatter
4. Skill names are referenced in agent's `skills:` field

## Examples by Agent

### Agent-Backend Skills
Used for Convex implementation:
- `create-mutation` - Mutation generators
- `create-query` - Query generators
- `design-schema` - Schema design
- `validate-types` - TypeScript validation

### Agent-Frontend Skills
Used for Astro + React:
- `create-page` - Astro page generation
- `create-component` - React component generation
- `optimize-performance` - Lighthouse optimization
- `style-with-tailwind` - Tailwind v4 styling

### Agent-Designer Skills
Used for design systems:
- `create-wireframe` - Wireframe generation
- `define-components` - Component specifications
- `set-design-tokens` - Token generation
- `validate-accessibility` - WCAG compliance

## Performance Considerations

### Token Usage
- Metadata only: ~50 tokens per skill
- With instructions: ~500 tokens
- With examples: ~2000 tokens
- Total budget per agent: 3000 tokens

### Caching
- Metadata cached at startup
- Instructions cached per session
- Examples loaded on first use

### Optimization Tips
- Keep instructions under 5K tokens
- Use examples sparingly (on-demand)
- Link to detailed docs in knowledge base
- Reference patterns from ontology

## Integration with Agent Lifecycle

```
Agent Invoked
    ↓
Skills Discovered
    ↓
Metadata Loaded (~50 tokens)
    ↓
[Agent works on task]
    ↓
Skill Needed?
    ↓
Instructions Loaded (~500 tokens)
    ↓
Example Code Loaded (on-demand)
    ↓
Agent Executes Skill
    ↓
Task Complete
```

## Troubleshooting

### Skill Not Found
- Check directory: `.claude/skills/agents/{agent-name}/`
- Verify YAML frontmatter
- Check skill is referenced in agent's `skills:` field

### Token Overload
- Reduce instruction size
- Move examples to linked resources
- Use knowledge base for detailed docs

### Outdated Skill
- Update version in `## Version History`
- Test with actual agent
- Document breaking changes

## Related Documentation

- [Claude Code Agent System](../agents/README.md)
- [6-Dimension Ontology](../../one/knowledge/ontology.md)
- [Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)

---

**Last Updated:** 2025-10-27
**Status:** Foundation Phase
