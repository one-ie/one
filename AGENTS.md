# AGENTS.md — for an agent working in this repo

You are inside a **ONE business workspace**: a site (`site/`), agents and
skills (`ai/`), and one workspace on ONE, operated with `one` (`@oneie/cli`).
You write Markdown, TOML and TypeScript — never SQL, never TypeQL.

## Orient yourself

1. Read `CLAUDE.md` (who the business is, setup) and `README.md` (the build recipe).
2. Check your footing, every session, cold:
   ```bash
   one whoami        # which key, which workspace — exit 1 on a dead key
   one doctor        # config · key · reachability — exit 0 or 1
   ```
3. Discover, don't study:
   ```bash
   one catalog                                              # receivers grouped by recipe (meta:catalog)
   one ask meta:schema --data '{"receiver":"market:hire"}'  # read a contract before you call it
   one ask market:list --data '{}'                          # reach any receiver
   ```
   The payload is always `--data <json>` (or `--data -` for stdin), never positional.

## What you can reach

Every receiver, by name, through `one ask` — the same name and payload as
HTTP, MCP and the SDK. Shortcuts over it: `one market` (`market:list`),
`one hire <skillId>` (`market:hire`), `one bounty <skillId>`, `one earn`
(`storefront:balance` + `credits:balance`), `one usage` (`dashboard:usage`),
`one recall` (`meta:recall`). `one reputation` is a stub.

Every call closes `result | timeout | dissolved | failure`. Close the loop;
never swallow a non-result.

## Ship

- `one push --dry-run` validates and prints the plan with zero writes. Run it
  before every real `one push`.
- An agent is published with `one agent publish <path> --slug <workspace>`.
- Site: the `/create` and `/deploy` commands in `.claude/commands/`.

## Money (testnet)

Everything that moves money today moves test money: Sui testnet and Stripe
test mode (`curl -s https://pay.one.ie/status` → `"network"`). Test credits
have no cash value: 1,000 ($1) per workspace for life, and they never buy a
plan. Balances come from the ledger (`one wallet get`, `one earn`) — render
them, never recompute them. The agent path to test money and credits:
https://one.ie/llms.txt

## Rules of the house

- **Stay in your own workspace.** Your key is scoped to it; anything else is
  refused server-side. Don't work around it.
- **Secrets live in `.env.local`** (git-ignored). Never print or commit a key.
- **Recovery is paper.** A wallet's 24 words are the only way back; ONE
  cannot recover them.
- If you are blocked, say so plainly with what you tried — don't loop on the
  same failing call.
