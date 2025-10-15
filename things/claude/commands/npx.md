# /npx - Fast NPX Publishing Command

⚡ **Rapid NPX Package Updates & Publishing**

*Fast-track NPX package updates with automated version management, testing, and publishing through specialized NPX agent.*

## Core Interface

When `/npx` is invoked, automatically launch the NPX specialist agent for superfast publishing:

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   ███╗   ██╗██████╗ ██╗  ██╗    Fast NPX Publishing                      ║
║   ████╗  ██║██╔══██╗╚██╗██╔╝    Automated Version & Publish               ║
║   ██╔██╗ ██║██████╔╝ ╚███╔╝                                              ║
║   ██║╚██╗██║██╔═══╝  ██╔██╗     🚀 SUPERFAST WORKFLOW                    ║
║   ██║ ╚████║██║     ██╔╝ ██╗    Update → Test → Version → Publish        ║
║   ╚═╝  ╚═══╝╚═╝     ╚═╝  ╚═╝                                             ║
║                                                                            ║
║            NPX Agent - Package Publishing Specialist                      ║
╚════════════════════════════════════════════════════════════════════════════╝

🎯 **QUICK ACTIONS** (Instant Publishing)
   1. Fast Publish Current        → Update, test, version, publish immediately
   2. Version Bump Only          → Update version without publish
   3. Test Before Publish        → Run comprehensive tests first
   4. Full Quality Check         → Complete validation before publish
   5. Emergency Hotfix           → Ultra-fast critical update publish

⚙️  **ADVANCED OPTIONS** (Power User)
   6. Custom Version Number      → Specify exact version to publish
   7. Beta/Alpha Release         → Publish pre-release version
   8. Dry Run Mode              → Test publishing process without actual publish
   9. Multi-Package Publish     → Publish multiple packages simultaneously

🔧 **CONFIGURATION**
   C. Configure NPM Settings     → Setup registry, tokens, defaults
   S. Set Publishing Preferences → Automated testing, versioning rules
   
📊 **STATUS & MONITORING**  
   V. View Current Versions      → See all published versions
   L. Publication Log           → Recent publishing history
   M. Metrics Dashboard         → Download stats, version adoption

❓ **HELP**
   H. Publishing Guide          → Best practices and workflows
   ?. Command Reference         → Complete NPX publishing commands

Auto-launching NPX Agent for superfast publishing...
```

## Command Handler

```yaml
command: /npx
action: launch_npx_agent
description: "Automated NPX package publishing with quality gates"
agent_file: ".claude/agents/npx.md"
workflow: |
  1. Auto-detect package.json and determine current version
  2. Run automated quality checks (lint, test, build)
  3. Prompt for version bump type (patch, minor, major) or use smart detection
  4. Update version and generate changelog
  5. Build package and run pre-publish validation
  6. Publish to NPM with automated retry on failure
  7. Tag Git release and push to repository
  8. Verify publication success and update monitoring
```

## Fast Publishing Workflow

### 1. Instant Publish (Default Option)
```yaml
instant_publish:
  detect: "Auto-detect changes and determine version bump needed"
  test: "Run essential tests (lint, unit tests, build validation)"
  version: "Auto-increment based on change type (patch/minor/major)"
  build: "Generate optimized build with size analysis"
  publish: "Publish to NPM with automated verification"
  tag: "Create Git tag and push to repository"
  verify: "Confirm package availability on NPM registry"
  timing: "<2 minutes end-to-end for most packages"
```

### 2. Quality-First Publish
```yaml
quality_publish:
  analysis: "Deep code analysis and quality scoring"
  testing: "Comprehensive test suite (unit, integration, e2e)"
  security: "Automated security vulnerability scanning"
  performance: "Bundle size analysis and optimization"
  compatibility: "Multi-Node version testing"
  documentation: "Auto-generate/update README and docs"
  publish: "Publish with full quality validation"
  timing: "<5 minutes with comprehensive validation"
```

## Agent Integration

The `/npx` command automatically launches the specialized NPX agent (`/Users/toc/Server/ONE/.claude/agents/npx.md`) which handles:

- **Package Detection**: Auto-detect Node.js packages and current state
- **Version Management**: Smart version bumping based on change analysis  
- **Quality Validation**: Automated testing and quality gates
- **Build Optimization**: Optimized builds with performance monitoring
- **Publishing Automation**: Reliable NPM publishing with retry logic
- **Git Integration**: Automatic tagging and repository updates
- **Verification**: Post-publish validation and monitoring

## Success Metrics

**Publishing Performance Targets:**
- Simple package update: <60 seconds
- Full quality validation: <5 minutes  
- Multi-package monorepo: <10 minutes
- Emergency hotfix: <30 seconds

**Quality Standards:**
- 100% successful publish rate (with retry logic)
- Automated rollback on critical failures
- Comprehensive pre-publish validation
- Real-time monitoring and alerting

**Developer Experience:**
- Zero-configuration setup for most packages
- Intelligent defaults with override options
- Clear progress indication and error messaging  
- Integration with existing development workflows

---

*Designed for maximum speed and reliability in NPX package publishing workflows*