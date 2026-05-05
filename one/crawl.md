# crawl tool — plan

Adds a `crawl` AI SDK tool to `chat.ts` so the LLM can fetch any URL and
extract structured information (products, prices, links, descriptions, etc.)
guided by the user's prompt.

---

## Goal

User says: _"go to example.com/shop and list all products with prices"_ — the
model calls `crawl({ url, intent })`, gets back clean markdown, then answers
from that content. No browser extension. No copy-paste. Works on any public
URL.

---

## How it works

```
user prompt → LLM decides to crawl
  → crawl tool called with { url, intent, limit? }
    → POST /browser-rendering/crawl  (CF account API)
      → returns job_id
    → poll GET until status = "completed" (max 30s, 1s intervals)
      → returns pages[].markdown
    → tool returns markdown joined, trimmed to ~8k chars
  → LLM answers the original question using that content
```

The `intent` parameter is passed in the tool description so the LLM can
frame what to look for — it is NOT sent to CF, it just guides how the model
uses the returned markdown.

---

## Tool signature

```ts
crawl({
  url: string,          // required — the page to fetch
  intent: string,       // required — what to extract, e.g. "list all products with prices"
  limit?: number,       // max pages to crawl (default 1, max 10 for chat)
  depth?: number,       // link depth (default 0 = single page only)
})
```

`depth: 0` = single page (fast, safe default for chat).
`depth: 1` + `limit: 10` = shallow site crawl (user explicitly asks to browse a site).

---

## CF API

```
POST https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/browser-rendering/crawl
Authorization: Bearer {CF_BROWSER_API_KEY}
Content-Type: application/json

{
  "url": "<url>",
  "limit": <limit>,
  "depth": <depth>,
  "formats": ["markdown"],
  "render": true,
  "crawlPurposes": ["ai-input"]
}
```

Response: `{ result: "<job-id>" }`

Poll:
```
GET .../browser-rendering/crawl/<job-id>?limit=100
```

Response: `{ result: { status: "completed", records: [{ url, markdown, metadata }] } }`

---

## Env vars

| Var | Where | Notes |
|-----|-------|-------|
| `CLOUDFLARE_ACCOUNT_ID` | `.env` + wrangler vars | already present |
| `CF_BROWSER_API_KEY` | wrangler secret | API token with "Browser Rendering - Edit" permission |

Add to `wrangler.toml` vars block (non-secret, already exists):
```toml
# CLOUDFLARE_ACCOUNT_ID already in [vars]
```

Add secret:
```bash
wrangler secret put CF_BROWSER_API_KEY
```

---

## Output contract

Tool returns a single string to the LLM:

```
Crawled: <url>
Pages: <n>

---
<markdown content, trimmed to 8000 chars>
```

If the crawl fails or times out, tool returns an error string so the LLM
can tell the user rather than hallucinating.

---

## Implementation tasks

```
T1  Add CF_BROWSER_API_KEY to wrangler.toml [vars] comment + secrets list
T2  Add crawl() execute function in chat.ts (POST → poll → return markdown)
T3  Register tool in streamText tools:{} block with description + zod schema
T4  Update system prompt: "When given a URL and asked to extract info, use crawl."
T5  Test: "go to https://example.com and tell me what it's about"
T6  Test: "find all products at <url>" — verify depth:0 default, markdown trimmed
```

---

## Constraints

- Single page by default (`depth: 0`) — keeps latency under 5s for most pages
- Markdown trimmed to 8k chars before returning to LLM — fits context window
- Poll timeout: 30s hard cap, returns error string on timeout
- Only fires on public URLs — no auth headers, no private endpoints
- `robots.txt` is respected by the CF crawl API automatically

---

## Files touched

| File                              | Change                                                  |
| --------------------------------- | ------------------------------------------------------- |
| `web/src/pages/api/chat.ts`       | add `crawl` tool, update system prompt, extend env type |
| `web/wrangler.toml`               | note `CF_BROWSER_API_KEY` secret                        |
| `web/src/pages/api/chat/crawl`    | this doc                                                |
