# Ingestor Command

Intelligently crawl and import TypeScript/React code from local projects into your ONE framework project.

## Usage

```bash
# Basic ingestion from a source directory
/ingestor --source="/path/to/projects" --framework="nextjs"

# Interactive mode - choose which files to import
/ingestor --source="/path/to/projects" --interactive

# Dry run - see what would be imported without making changes
/ingestor --dry-run --source="/path/to/projects"

# Mission-focused ingestion
/ingestor --source="/path/to/projects" --mission="build-dashboard"

# Framework-specific ingestion
/ingestor --source="/path/to/projects" --framework="astro" --components-only

# Selective patterns
/ingestor --source="/path/to/projects" --include="components,hooks" --exclude="tests,stories"
```

## Parameters

- `--source`: Source directory to crawl for projects (required)
- `--framework`: Target framework adaptation (nextjs, astro, vite, tanstack-start)
- `--mission`: Current mission context for relevance scoring
- `--story`: Current story context for relevance scoring  
- `--task`: Current task context for relevance scoring
- `--dry-run`: Preview mode - show what would be imported
- `--interactive`: Step-by-step selection of files to import
- `--include`: Comma-separated list of patterns to include
- `--exclude`: Comma-separated list of patterns to exclude
- `--components-only`: Only import component files
- `--max-size`: Maximum file size to import (default: 1MB)

## What It Does

The Ingestor Agent:

1. **Discovers Projects**: Recursively scans source directory for TypeScript/React projects
2. **Detects Frameworks**: Identifies Next.js, Astro, Vite, TanStack Start configurations  
3. **Maps Context**: Analyzes current missions/stories/tasks for relevance scoring
4. **Classifies Files**: Categorizes files by type and required transformation
5. **Smart Import**: Copies some files directly, modifies others for compatibility
6. **Adapts Code**: Updates imports, paths, and framework-specific patterns
7. **Generates Report**: Creates detailed ingestion summary with warnings

## File Processing Types

- **Direct Copy**: Assets, configs, and standalone files copied as-is
- **Smart Modify**: TypeScript/React files with import path updates and adaptations
- **Config Adapt**: Framework configs adapted for target environment  
- **Manual Review**: Complex files flagged for human review

## Framework Adaptations

### Next.js → Other Frameworks
- Converts `next/image` → generic image components
- Converts `next/link` → framework-appropriate routing
- Removes Next.js specific hooks and utilities
- Adapts App Router / Pages Router patterns

### Astro → Other Frameworks  
- Converts `.astro` components to JSX
- Removes Astro frontmatter scripts
- Adapts island architecture patterns

### Universal Adaptations
- Updates import paths to match target project structure
- Adapts Tailwind CSS configurations
- Updates TypeScript configurations
- Merges package.json dependencies intelligently

## Mission Integration

The ingestor uses your current ONE framework context:

- **Mission Keywords**: Files matching mission objectives get higher priority
- **Story Requirements**: Components needed for active stories are prioritized
- **Task Context**: Files supporting current tasks are identified
- **Smart Scoring**: AI-based relevance scoring (0-1) for each discovered file

## Output Structure

Imported files are organized in your target project:

```
your-project/
├── src/
│   ├── components/     # UI components
│   ├── hooks/          # React hooks  
│   ├── lib/utils/      # Utility functions
│   ├── pages/          # Page components
│   ├── styles/         # CSS/SCSS files
│   ├── types/          # TypeScript definitions
│   └── __tests__/      # Test files
├── public/             # Static assets
└── ingestion-report.md # Detailed import summary
```

## Quality Gates

- **TypeScript Compliance**: All imported code must compile
- **ESLint Standards**: Code passes project linting rules
- **Import Resolution**: All dependencies resolve correctly
- **Security Scanning**: No vulnerabilities or secrets imported

## Example Workflows

### Dashboard Mission
```bash
# Import components for dashboard mission
/ingestor --source="/Users/dev/projects" --mission="dashboard" --components-only
# Result: Chart components, data tables, dashboard layouts prioritized
```

### UI Library Migration  
```bash
# Interactive import of UI components
/ingestor --source="/old-design-system" --interactive --include="components"
# Result: Step-by-step selection of reusable UI components
```

### Cross-Framework Migration
```bash
# Migrate Next.js project to Astro
/ingestor --source="/nextjs-app" --framework="astro" --dry-run
# Result: Preview of required adaptations and potential issues
```

The Ingestor Agent transforms manual code hunting into an intelligent, context-aware import system that respects your project structure and maintains code quality.