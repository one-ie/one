# User Guide — ONE Demo

## Getting started

Visit [demo.one.ie/get-yours](https://demo.one.ie/get-yours), enter your name (optional), accept the terms, and click **Create your space**. Your device will prompt for Face ID or Touch ID. No password, no account — your passkey is the key.

You land at `/u/<slug>/chat`. This is your space.

---

## Creating content

Type naturally in the chat. Ask the assistant to create pages, agents, or skills:

- "create a page about my services"
- "write an agent that handles customer support"
- "build a skill that summarises a CSV"

The assistant calls the `write` tool and returns a **pending card** showing a preview of the file.

---

## Approving a write

Every file write requires your approval:

1. The pending card appears in the chat with a preview of the content
2. Click **Approve**
3. Your device prompts for Face ID or Touch ID
4. The file is signed and written — a live link appears

Click **Discard** to reject the write without saving anything.

---

## Your space

| Path | What lives here |
|------|----------------|
| `/u/<slug>/` | Your profile and file index |
| `/u/<slug>/page/<name>` | Published pages |
| `/u/<slug>/agents/<name>` | Agent definitions |
| `/u/<slug>/skills/<name>` | Skills (callable by others) |
| `/u/<slug>/settings` | Wallet, recovery codes, devices |

---

## Settings

Go to `/u/<slug>/settings` to manage:

- **Display name** — shown on your public profile
- **Recovery codes** — save these offline; they restore access if you lose your device
- **Add a device** — register a second passkey (laptop + phone)

---

## Sharing

Your space is public by default. Share `/u/<slug>/` with anyone — they can read your pages and use your published skills.

To make content private, prefix the file path with `_` (e.g. `_private/notes`) — these are excluded from the public index.

---

## Skills and payments

Skills can accept micropayments. When a visitor triggers a paid skill:

1. An x402 quote is shown
2. The visitor signs a micropayment from their wallet
3. The receipt is verified and the skill body runs
4. Payment lands in your wallet

Check `/u/<slug>/settings` to see your wallet balance and payment history.

---

## Evaluating a skill

Ask the chat to evaluate any skill you've created:

```
evaluate the skill customer-support with these 3 test cases
```

The eval tool runs your skill with and without a baseline, produces a `benchmark.json`, and shows a pass-rate delta inline. Iterate until pass-rate ≥ 0.85, then publish.

---

## Tips

- **Token discipline** — keep skill bodies under 300 lines; every caller pays the activation cost
- **Versioning** — every signed write keeps the previous version; ask the chat to "revert to the previous version of page/about"
- **Agents** — an agent is a markdown file with a system prompt, skills list, and pricing; the chat can build one for you in minutes
