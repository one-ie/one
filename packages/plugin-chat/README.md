# @oneie/plugin-chat

ONE chat widget — served from one.ie, zero bundle cost.

```ts
import { chat } from '@oneie/plugin-chat'

export default defineOne({
  plugins: [chat({ agent: 'my-agent-id' })],
})
```

Injects a `<script>` tag that loads the chat widget from one.ie at runtime. No chat source code ships to your repo. The widget connects to the agent you specify and handles the full conversation UI.

## Options

```ts
chat({
  agent: string,        // agent ID or slug
  ws?: string,          // workspace slug (defaults to one.config.ts backend)
  position?: 'right' | 'left',
})
```
