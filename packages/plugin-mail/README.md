# @oneie/plugin-mail

ONE mail — full inbox UI served from one.ie, real-time via the channels worker. Zero mail source ships to your repo.

## Install

```bash
bun add @oneie/plugin-mail
```

## one.config.ts

```ts
import { mail } from '@oneie/plugin-mail'

export default defineOne({
  plugins: [
    mail({
      ws: 'your-workspace',
      agent: 'your-agent-slug', // optional — enables AI-assisted inbox
      folders: ['inbox', 'sent', 'drafts', 'trash'],
      layout: 'three-pane',
    }),
  ],
})
```

## Usage

### Full mail client

Mount the complete three-pane mail client on a dedicated `/mail` page:

```astro
---
import { OneMail } from '@oneie/plugin-mail/OneMail.astro'
---

<OneMail
  ws="your-workspace"
  agent="your-agent-slug"
  folders={['inbox', 'sent', 'drafts', 'trash']}
  layout="three-pane"
/>
```

The component renders a full-height `<div id="one-mail">` and loads `mail.js` from one.ie. The widget hydrates with the folder list on the left, message list in the centre, and message view on the right.

### Compact inbox embed

Embed a compact message list in a dashboard or sidebar with `OneInbox`:

```astro
---
import { OneInbox } from '@oneie/plugin-mail/OneInbox.astro'
---

<OneInbox ws="your-workspace" limit={5} />
```

`OneInbox` renders only the message list (`data-mount="inbox"`), suitable for widgets and preview panels.

## Options

### `mail()` config

| Option | Type | Default | Description |
|---|---|---|---|
| `ws` | `string` | — | Workspace slug (required) |
| `agent` | `string` | — | Agent slug for AI-assisted inbox |
| `folders` | `string[]` | `['inbox','sent','drafts','trash']` | Shown folder list |
| `layout` | `'three-pane' \| 'list'` | `'three-pane'` | Layout style |
| `channelsUrl` | `string` | ONE backend | Channels worker URL override |
| `endpoint` | `string` | — | API endpoint override |

### `<OneMail>` props

All `mail()` config options plus:

| Prop | Type | Description |
|---|---|---|
| `integrity` | `string` | SRI hash for pinned version URLs |

### `<OneInbox>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `ws` | `string` | — | Workspace slug (required) |
| `limit` | `number` | `10` | Max messages shown |
| `channelsUrl` | `string` | ONE backend | Channels worker URL override |
| `integrity` | `string` | — | SRI hash for pinned version URLs |

## Real-time updates

The mail widget opens an SSE connection to the channels worker on mount. New messages, read/unread state, and folder moves update in real time without polling. The `channelsUrl` option lets you point at a self-hosted channels worker if you are not using the ONE backend.

## AI-assisted inbox

Set `agent` to a deployed ONE agent slug to enable AI-assisted mail:

- **Auto-draft** — the agent drafts replies in your voice, ready to send or edit
- **Prioritize** — the agent surfaces urgent mail and suppresses noise
- **Summarize** — long threads are condensed to a single paragraph

The agent receives only the mail context you configure. It does not have access to other workspace data unless you grant it explicitly via the agent's skill set.

## SRI

Pin a specific script version and lock it with a subresource integrity hash:

```astro
<OneMail
  ws="your-workspace"
  integrity="sha384-<hash>"
/>
```

Generate the hash:

```bash
curl -s https://one.ie/ml/mail.js | openssl dgst -sha384 -binary | openssl base64 -A
```
