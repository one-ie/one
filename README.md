# ONE Platform v2.0.8

# ONE Platform

**Make Your Ideas Real**

ONE is an AI-native platform built on a 6-dimension ontology that models reality through: Groups, People, Things, Connections, Events, and Knowledge.

## Quick Start

```bash
# Create a new ONE project
npx oneie@latest init my-project
cd my-project

# Start development
cd web
bun install
bun run dev  # → http://localhost:4321
```

## Architecture

```
ONE/
├── one/           # 6-dimension ontology documentation
├── web/           # Astro 5 + React 19 frontend
├── docs/          # Documentation site
├── .claude/       # AI agent configuration
├── CLAUDE.md      # AI development instructions
├── AGENTS.md      # Convex patterns quick reference
└── README.md      # This file
```

## Technology Stack

- **Frontend**: Astro 5.14+ with React 19, Tailwind CSS v4
- **Backend**: Convex real-time database + Hono API
- **Auth**: Better Auth with 6 authentication methods
- **AI**: Effect.ts services with typed business logic
- **Deployment**: Cloudflare Pages + Convex Cloud

## Repositories

- **Main**: https://github.com/one-ie/one (this repo)
- **Ontology**: https://github.com/one-ie/ontology
- **Web**: https://github.com/one-ie/web
- **Backend**: https://github.com/one-ie/backend
- **CLI**: https://github.com/one-ie/cli
- **Docs**: https://github.com/one-ie/docs

## Documentation

- **Complete Docs**: https://docs.one.ie
- **Quick Reference**: See `AGENTS.md` for Convex patterns
- **AI Development**: See `CLAUDE.md` for AI agent instructions
- **Ontology**: See `one/` directory for 6-dimension specification

## Installation

```bash
# Global install
npm install -g oneie

# Or use with npx
npx oneie@latest --version
```

## Commands

```bash
oneie init <project>     # Create new ONE project
oneie --version          # Show version
oneie --help            # Show help
```

## License

Copyright © 2025 ONE Platform
Licensed under FREE License with Commercial Attribution

See LICENSE.md for details.

---

**Built with clarity, simplicity, and infinite scale in mind.**

https://one.ie • npx oneie
