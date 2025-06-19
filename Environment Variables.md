# Environment Variables Dashboard

> **🔐 Single Source of Truth for ONE Project Configuration**

## Quick Links to .env Files

- [[.env|🔑 Main Environment File (.env)]]
- [[.env.local|📍 Local Environment (.env.local)]]
- [[.env.example|📋 Example Template (.env.example)]]

## Current API Keys & Services

### 🤖 AI Services
- **OpenAI**: `OPENAI_API_KEY`
- **Anthropic (Claude)**: `ANTHROPIC_API_KEY`
- **Google Gemini**: `GEMINI_API_KEY`
- **Mistral**: `MISTRAL_API_KEY`
- **OpenRouter**: `OPENROUTER_API_KEY`
- **Groq**: `GROQ_API_KEY`
- **Replicate**: `REPLICATE_API_TOKEN`

### 💳 Payment & Commerce
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`
- **Shopify**: `PUBLIC_SHOPIFY_SHOP`, `ADMIN_ACCESS_TOKEN`

### 🗄️ Databases & Backend
- **Convex**: `CONVEX_DEPLOYMENT`, `VITE_CONVEX_URL`
- **Supabase**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- **Notion**: `NOTION_API_KEY`, `NOTION_DATABASE_ID`

### 🛠️ Development Tools
- **GitHub**: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
- **Figma**: `FIGMA_PERSONAL_ACCESS_TOKEN`
- **Resend**: `RESEND_API_KEY`
- **ExaSearch**: `EXASEARCH_API_KEY`

## File Locations

```
/Users/toc/Server/ONE/one/
├── .env              # Main configuration (git-ignored)
├── .env.local        # Local overrides (git-ignored)
└── .env.example      # Template for new developers
```

## Obsidian Tips for .env Files

1. **Direct Editing**: Click on any .env file link above to edit directly
2. **Search**: Use Cmd+Shift+F to search across all .env files
3. **Quick Switch**: Use Cmd+O and type ".env" to quickly open any env file
4. **Split View**: Right-click on .env link → "Open in new pane" to compare files

## Security Reminders

- ✅ All .env files are in `.gitignore`
- ✅ Never commit real API keys
- ✅ Use `.env.example` as template for sharing
- ⚠️ Keep this vault secure as it contains sensitive data

---

*Last updated: [[2024-05-27]]*
*Project: [[CLAUDE|ONE Project Guide]]*