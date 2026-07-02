# @oneie/plugin-media

ONE media — video gallery and player served from one.ie. Supports Mux and YouTube. Zero bundle cost; no media source ships to your repo.

Requires a workspace key (CONNECTED tier).

## Install

```bash
bun add @oneie/plugin-media
```

## one.config.ts

```ts
import { defineOne } from '@oneie/frontend'
import { media } from '@oneie/plugin-media'

export default defineOne({
  plugins: [
    media({
      ws: 'your-workspace-slug',
      provider: 'both',   // 'mux' | 'youtube' | 'both'
      layout: 'grid',     // 'grid' | 'list' | 'featured'
      columns: 3,         // 2 | 3 | 4
    }),
  ],
})
```

## Usage

### Video gallery

```astro
---
import { OneMedia } from '@oneie/plugin-media/OneMedia.astro'
---

<OneMedia
  ws="your-workspace-slug"
  provider="both"
  layout="grid"
  columns={3}
/>
```

### Single video player

```astro
---
import { OneVideoPlayer } from '@oneie/plugin-media/OneVideoPlayer.astro'
---

<!-- Mux — pass the playbackId -->
<OneVideoPlayer
  ws="your-workspace-slug"
  videoId="DS00Spx1CV902MCtPj5WknGlR102V5HFkDe"
  provider="mux"
/>

<!-- YouTube — pass the video ID from the URL -->
<OneVideoPlayer
  ws="your-workspace-slug"
  videoId="dQw4w9WgXcQ"
  provider="youtube"
  autoplay={false}
/>
```

## Provider IDs

| Provider | Where to find the ID |
|----------|----------------------|
| Mux | Mux dashboard → Asset → Playback ID (the `DS00Spx1…` string) |
| YouTube | `youtube.com/watch?v=dQw4w9WgXcQ` → the `v=` value |

## Version pinning with SRI

Pass an `integrity` hash to pin a specific version and enable Subresource Integrity checking:

```astro
<OneMedia
  ws="your-workspace-slug"
  integrity="sha384-abc123..."
/>
```

The hash matches the versioned URL (e.g. `one.ie/m/media@1.2.0.js`). Obtain the hash from the ONE dashboard or the one.ie/m/media.js.sri endpoint.

## Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ws` | `string` | — | Workspace slug (required) |
| `provider` | `'mux' \| 'youtube' \| 'both'` | `'both'` | Which providers to surface |
| `layout` | `'grid' \| 'list' \| 'featured'` | `'grid'` | Gallery layout |
| `columns` | `2 \| 3 \| 4` | `3` | Grid column count |
| `endpoint` | `string` | — | Override the media API endpoint |
| `videoId` | `string` | — | Mux playbackId or YouTube video ID (player only) |
| `autoplay` | `boolean` | `false` | Autoplay on load (player only) |
| `integrity` | `string` | — | SRI hash for version pinning |
