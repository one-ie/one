# Knowledge Tagging Hooks

## Overview

The knowledge tagging hooks automatically tag all created/modified artifacts as **knowledge** in the 6-dimension ontology. This enables:

- 📚 Automatic knowledge base building
- 🏷️ Semantic labeling of all artifacts
- 🔍 RAG-ready artifact indexing
- 📊 Knowledge tracking per inference
- 🧠 Complete audit trail of created knowledge

## How It Works

### Pre-Hook: `knowledge-pre.py`

Runs **before** Write/Edit operations to validate and prepare knowledge tagging:

1. ✅ Validates artifact type (code, docs, tests, config, design)
2. 🏷️ Prepares labels based on file path and type
3. 📋 Displays what will be tagged after creation
4. ⚠️ Skips temporary and generated files

**Example Output:**
```
📚 Knowledge Pre-Hook
   Artifact: EntityList.tsx
   Type: code
   Labels: component, frontend, ui, code
   → Will be tagged in knowledge dimension after creation
```

### Post-Hook: `knowledge-post.py`

Runs **after** Write/Edit operations to create knowledge entries:

1. 📝 Creates knowledge entry with metadata
2. 🏷️ Tags with labels (file type, dimension, feature)
3. 🔗 Links to current inference context
4. 💾 Saves to daily knowledge log (~/.claude/knowledge-log/)
5. 🔐 Generates content hash for versioning

**Example Output:**
```
✨ Knowledge Tagged
   Artifact: EntityList.tsx
   Type: code
   Labels: component, frontend, ui, code
   Inference: 22/100
   Hash: a3f9d2c1b4e5f6a7
   → Logged to: knowledge-2025-10-14.jsonl
```

## Knowledge Entry Structure

Each knowledge entry is saved as JSON:

```json
{
  "type": "knowledge_item",
  "artifact_type": "code",
  "file_path": "/Users/toc/Server/ONE/web/src/components/EntityList.tsx",
  "file_name": "EntityList.tsx",
  "labels": ["component", "frontend", "ui", "code"],
  "content_hash": "a3f9d2c1b4e5f6a7",
  "created_at": "2025-10-14T02:30:45.123456",
  "inference_number": 22,
  "feature": "Entity Management",
  "organization": "Default Org",
  "created_by_role": "platform_owner",
  "content_preview": "import { useQuery } from 'convex/react'...",
  "metadata": {
    "file_size": 1234,
    "directory": "/Users/toc/Server/ONE/web/src/components",
    "extension": ".tsx"
  }
}
```

## Artifact Types

The hooks recognize 5 artifact types:

| Type | Extensions | Labels |
|------|-----------|--------|
| **code** | .py, .ts, .tsx, .js, .jsx, .astro, .json, .yaml | `code` |
| **documentation** | .md, .mdx, .txt | `documentation` |
| **test** | .test.ts, .spec.ts, etc. | `test`, `quality` |
| **config** | .json, .yaml, .yml, .toml, .ini | `config` |
| **design** | .fig, .sketch, .svg, .png, .jpg | `design` |

## Smart Labeling

Labels are automatically generated based on file path:

| Path Pattern | Auto Labels |
|-------------|-------------|
| `/web/src/components` | `component`, `frontend`, `ui` |
| `/web/src/pages` | `page`, `frontend`, `routing` |
| `/backend/convex/queries` | `query`, `backend`, `database` |
| `/backend/convex/mutations` | `mutation`, `backend`, `database` |
| `/backend/convex/services` | `service`, `backend`, `business-logic` |
| `/one/things` | `documentation`, `ontology`, `things` |
| `/one/connections` | `documentation`, `ontology`, `connections` |
| `/one/events` | `documentation`, `ontology`, `events` |
| `/one/knowledge` | `documentation`, `ontology`, `knowledge` |
| `/test` | `test`, `quality`, `validation` |

## Knowledge Logs

Knowledge entries are saved to `~/.claude/knowledge-log/` as daily JSONL files:

```
~/.claude/knowledge-log/
├── knowledge-2025-10-14.jsonl
├── knowledge-2025-10-13.jsonl
└── knowledge-2025-10-12.jsonl
```

Each line is a complete JSON knowledge entry. This format enables:

- 📊 Easy aggregation and analysis
- 🔍 Fast searching with grep/jq
- 📈 Knowledge growth tracking
- 🧠 RAG corpus building

## Inference Context Integration

The hooks integrate with the inference tracking system (`todo.py`):

- 📍 Current inference number (1-100)
- 🎯 Feature being implemented
- 🏢 Organization context
- 👤 Person role (platform_owner, org_owner, etc.)

This links every knowledge artifact back to the inference that created it.

## Filtering Rules

The hooks **skip** tagging for:

- ❌ Temporary files (`/tmp/`, `/.temp/`)
- ❌ Generated files (`/_generated/`, `/node_modules/`)
- ❌ Non-recognized artifact types
- ❌ Non-Write/Edit operations (Read, Bash, etc.)

## Usage Example

When you create a new component:

```typescript
// Write: frontend/src/components/TokenBalance.tsx
import { useQuery } from 'convex/react';
export function TokenBalance({ userId }) { ... }
```

**Pre-Hook Output:**
```
📚 Knowledge Pre-Hook
   Artifact: TokenBalance.tsx
   Type: code
   Labels: component, frontend, ui, code
   → Will be tagged in knowledge dimension after creation
```

**Post-Hook Output:**
```
✨ Knowledge Tagged
   Artifact: TokenBalance.tsx
   Type: code
   Labels: component, frontend, ui, code
   Inference: 22/100
   Hash: b8c3d4e5f6a7b8c9
   → Logged to: knowledge-2025-10-14.jsonl
```

## Querying Knowledge Logs

Use `jq` to query knowledge logs:

```bash
# All artifacts created today
cat ~/.claude/knowledge-log/knowledge-$(date +%Y-%m-%d).jsonl | jq .

# All code artifacts
cat ~/.claude/knowledge-log/*.jsonl | jq 'select(.artifact_type == "code")'

# All artifacts for inference 22
cat ~/.claude/knowledge-log/*.jsonl | jq 'select(.inference_number == 22)'

# All frontend components
cat ~/.claude/knowledge-log/*.jsonl | jq 'select(.labels | contains(["component", "frontend"]))'

# Count by artifact type
cat ~/.claude/knowledge-log/*.jsonl | jq -r '.artifact_type' | sort | uniq -c
```

## Integration with 6-Dimension Ontology

These hooks implement **Dimension 6: Knowledge** of the ontology:

```
Organizations → Multi-tenant isolation
People        → Authorization & roles
Things        → Entities (66+ types)
Connections   → Relationships (25+ types)
Events        → Actions (67+ types)
Knowledge     → 🟢 Labels + embeddings + vectors (YOU ARE HERE)
```

Every artifact created is:
1. ✅ Tagged as a **knowledge_item** (thing type)
2. 🏷️ Labeled with semantic metadata
3. 🔗 Linked to inference context (event)
4. 📊 Indexed for RAG search

## Future Enhancements

Planned improvements:

- 🧠 Auto-generate embeddings with OpenAI/Anthropic
- 🔍 Vector search across all knowledge
- 📊 Knowledge dashboard visualization
- 🤖 RAG-powered code search
- 📈 Knowledge growth metrics
- 🔗 Link artifacts to related things (features, tasks, tests)

## Troubleshooting

### Hooks not running?

Check that hooks are executable:
```bash
chmod +x .claude/hooks/knowledge-*.py
```

### Knowledge logs not created?

Ensure directory exists:
```bash
mkdir -p ~/.claude/knowledge-log
```

### Want to disable temporarily?

Remove from `.claude/settings.local.json`:
```json
// Remove these blocks
{
  "type": "command",
  "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/knowledge-pre.py",
  "timeout": 5
}
```

## See Also

- **`validate-ontology-structure.py`**: Validates 6-dimension ontology structure
- **`todo.py`**: Inference context tracking (Infer 1-100)
- **`done.py`**: Marks inferences complete
- **`one/knowledge/ontology.md`**: Complete 6-dimension ontology spec

---

**Built with clarity, simplicity, and infinite scale in mind.**
