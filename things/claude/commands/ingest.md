# Ingest Command - Parallel Agent Project Analysis

Orchestrate multiple specialized agents in parallel to perform comprehensive project discovery, analysis, and intelligent code import from local directories.

## Usage

```bash
# Basic parallel ingestion with all agents
/ingest --source="/path/to/projects"

# Mission-focused parallel analysis
/ingest --source="/Users/dev/projects" --mission="dashboard" --agents="ingestor,architect,qa"

# Framework-specific analysis with full team
/ingest --source="/nextjs-apps" --framework="nextjs" --parallel=5

# Interactive mode with selective agent spawning
/ingest --source="/path/projects" --interactive --preview

# Dry run with architecture analysis
/ingest --source="/projects" --dry-run --agents="ingestor,architect,research"

# Deep analysis with all specialists
/ingest --source="/codebase" --deep --agents="all" --output="analysis-report"
```

## Cascade System Integration

The `/ingest` command leverages the existing **Mission → Story → Task → Agent** parallel orchestration system to spawn specialized agents for comprehensive project analysis. It utilizes the proven concurrent task orchestration engine (1000+ simultaneous tasks) and elastic agent scaling (43-430 agents) already validated in the ONE framework.

## Agent Coordination

The `/ingest` command spawns specialized agents using the established parallel cascade infrastructure:

### 🔍 **Primary Ingestion Agents**
- **Engineering Ingestor**: Core code discovery, classification, and intelligent import
- **Engineering Architect**: System architecture analysis and design recommendations
- **Engineering Quality Assurance**: Code quality validation, testing strategies, security audit

### 📊 **Analysis & Intelligence Agents** 
- **Research Market Analyst**: Technology stack analysis, dependency audit, trend identification
- **Content Team Manager**: Documentation analysis, README optimization, knowledge extraction
- **Engineering Performance**: Performance bottleneck identification and optimization recommendations

### 🎯 **Optional Specialist Agents**
- **Marketing Director**: Competitive analysis and positioning insights (for product projects)
- **Crypto Token Analyst**: DeFi/blockchain project analysis (for crypto projects)
- **Engineering User Experience**: UX/UI pattern analysis and improvement suggestions

## Parameters

### Source & Target
- `--source <path>`: Source directory to analyze (required)
- `--target <path>`: Target directory for imports (defaults to current directory)
- `--framework <type>`: Target framework (nextjs, astro, vite, tanstack-start)

### Context Integration
- `--mission <name>`: Current mission context for relevance scoring
- `--story <name>`: Current story context for focused analysis
- `--task <name>`: Current task context for specific objectives

### Agent Control
- `--agents <list>`: Comma-separated list of agents to spawn
  - `ingestor` (default) - Core code import agent
  - `architect` - Architecture analysis
  - `qa` - Quality assurance and testing
  - `research` - Technology and market analysis
  - `content` - Documentation analysis
  - `performance` - Performance optimization
  - `all` - All available agents

### Execution Control
- `--parallel <number>`: Maximum parallel agents (default: 3, max: 8)
- `--timeout <seconds>`: Agent timeout in seconds (default: 300)
- `--dry-run`: Analysis only, no file imports
- `--interactive`: Interactive agent selection and approval
- `--preview`: Show analysis results before importing

### Output & Reporting
- `--output <name>`: Output report name (default: ingestion-analysis)
- `--format <type>`: Report format (md, json, yaml, all)
- `--verbose`: Detailed logging and progress tracking
- `--silent`: Minimal output, results only

### Filtering & Control
- `--include <patterns>`: File patterns to include
- `--exclude <patterns>`: File patterns to exclude  
- `--max-size <bytes>`: Maximum file size per agent
- `--deep`: Enable deep analysis mode (slower, more comprehensive)

## Execution Workflow

### Phase 1: Discovery & Planning (Parallel)
```
🔍 Engineering Ingestor    → Project discovery, file classification
🏗️ Engineering Architect   → Architecture pattern identification  
📊 Research Market Analyst → Technology stack analysis
```

### Phase 2: Analysis & Validation (Parallel)
```
🧪 Engineering QA         → Code quality and security audit
📝 Content Team Manager   → Documentation and knowledge extraction
⚡ Engineering Performance → Performance bottleneck identification
```

### Phase 3: Import & Integration (Coordinated)
```
🔄 Engineering Ingestor    → Intelligent file import and adaptation
🎯 Mission Integration     → Context-aware relevance scoring
📋 Quality Validation     → Final quality gates and reporting
```

### Phase 4: Reporting & Recommendations (Aggregated)
```
📊 Consolidated Analysis   → Multi-agent insights compilation
🎯 Action Recommendations → Prioritized improvement suggestions  
📈 Success Metrics        → Quality scores and validation results
```

## Agent Coordination Features

### 🚀 **Parallel Execution** (Leverages Existing CASCADE Infrastructure)
- **Concurrent Task Engine**: Utilizes 1000+ simultaneous task capacity
- **Dynamic Agent Assignment**: AI-powered optimal matching under 30 seconds
- **Elastic Agent Pool**: Auto-scales from 43 to 430 agents based on demand
- **Deadlock Prevention**: DAG-based dependency management with timeout mechanisms
- **Quality Maintenance**: 4.0+ stars maintained under 20x throughput load

### 🔄 **Result Aggregation** (CASCADE Integration)
- **Event-Driven Coordination**: Uses existing message bus and distributed consensus
- **Intelligent Conflict Resolution**: AI-mediated priority queuing for overlapping analysis
- **Quality Amplification**: Compound quality effects measured across all agent results
- **Performance Monitoring**: Real-time bottleneck detection and optimization

### 📊 **Real-time Progress Tracking**
```
Agent Status Dashboard:
┌─────────────────────┬─────────┬──────────┬─────────┐
│ Agent               │ Status  │ Progress │ ETA     │
├─────────────────────┼─────────┼──────────┼─────────┤
│ Engineering Ingestor│ Running │ ████░░░░ │ 2m 15s  │
│ Engineering QA      │ Running │ ██████░░ │ 1m 45s  │  
│ Research Analyst    │ Complete│ ████████ │ Done    │
│ Content Manager     │ Running │ ███░░░░░ │ 3m 30s  │
└─────────────────────┴─────────┴──────────┴─────────┘
```

### 🛡️ **Error Handling & Recovery**
- Individual agent failure doesn't stop the entire process  
- Automatic retry logic with exponential backoff
- Graceful degradation when agents encounter issues
- Comprehensive error reporting with actionable suggestions

## Output Reports

### 📋 **Consolidated Analysis Report**
```markdown
# Project Ingestion Analysis Report
Generated by: 6 parallel agents | Duration: 4m 32s

## Executive Summary
- Projects Discovered: 12
- Files Analyzed: 1,247  
- Code Quality Score: 4.2/5.0 ⭐⭐⭐⭐
- Architecture Health: 3.8/5.0 ⭐⭐⭐⭐
- Security Rating: 4.5/5.0 ⭐⭐⭐⭐⭐

## Agent Results
### 🔍 Engineering Ingestor
- Relevant Files: 156 (12.5% of total)
- Import Recommendations: 89 files
- Framework Adaptations: 23 required

### 🏗️ Engineering Architect  
- Architecture Patterns: 8 identified
- Improvement Areas: 5 critical
- Design Recommendations: 12 actionable

### 🧪 Engineering QA
- Quality Issues: 3 critical, 12 warnings
- Test Coverage: 67% (target: 80%)
- Security Vulnerabilities: 2 medium risk
```

### 📊 **JSON Analysis Data**
```json
{
  "ingestion": {
    "agents_deployed": 6,
    "execution_time": "4m 32s",
    "projects_analyzed": 12,
    "files_processed": 1247,
    "recommendations": {
      "import": 89,
      "refactor": 23,
      "security": 15,
      "performance": 8
    }
  }
}
```

## Example Usage Scenarios

### 🎯 **Mission-Driven Development**
```bash
# Dashboard mission with focused analysis
/ingest --source="/Users/dev/projects" --mission="dashboard" \
        --agents="ingestor,architect,performance" \
        --include="components,hooks,utils" \
        --output="dashboard-analysis"

# Result: Smart component discovery for dashboard features
```

### 🔄 **Framework Migration** 
```bash
# Next.js to Astro migration analysis
/ingest --source="/nextjs-projects" --framework="astro" \
        --agents="ingestor,architect,qa" \
        --dry-run --deep

# Result: Comprehensive migration strategy with compatibility analysis
```

### 🧪 **Code Quality Audit**
```bash
# Full quality and security analysis
/ingest --source="/production-apps" \
        --agents="qa,performance,research" \
        --deep --format="all" \
        --output="security-audit"

# Result: Enterprise-grade quality assessment with actionable recommendations
```

### 🚀 **Startup Acceleration**
```bash
# Interactive component library building
/ingest --source="/ui-examples" \
        --agents="ingestor,content,architect" \
        --interactive --preview \
        --include="components,styles"

# Result: Curated component library with documentation
```

## Performance Optimization

### 🚄 **Speed Enhancements**
- **Parallel Processing**: Up to 8 agents simultaneously
- **Smart Caching**: Avoid redundant analysis across agents
- **Progressive Results**: Stream results as agents complete
- **Early Termination**: Stop on critical errors or user request

### 💾 **Resource Management**
- **Memory Limits**: Per-agent memory constraints
- **CPU Throttling**: Automatic load balancing
- **Disk Usage**: Temporary file cleanup
- **Network Limits**: Concurrent request management

### 📈 **Scalability Features**
- **Agent Pool**: Reuse agent instances for multiple projects
- **Batch Processing**: Queue multiple ingestion requests
- **Distributed Mode**: Support for remote agent execution
- **Load Balancing**: Optimal task distribution

## Quality Gates

### 🎯 **Multi-Agent Validation**
Each agent maintains its own 4.0+ star quality standards:
- **Engineering Ingestor**: Import accuracy and adaptation quality
- **Engineering Architect**: Design pattern adherence and scalability
- **Engineering QA**: Code quality, security, and test coverage
- **Content Manager**: Documentation completeness and clarity

### 📊 **Consolidated Scoring**
```
Overall Project Health: 4.2/5.0 ⭐⭐⭐⭐
├─ Code Quality: 4.1/5.0 (Engineering QA)
├─ Architecture: 3.9/5.0 (Engineering Architect)  
├─ Security: 4.5/5.0 (Engineering QA)
├─ Documentation: 3.8/5.0 (Content Manager)
└─ Performance: 4.3/5.0 (Engineering Performance)
```

---

**The `/ingest` command transforms project discovery from sequential analysis into a coordinated intelligence operation, delivering comprehensive insights through parallel agent expertise.**