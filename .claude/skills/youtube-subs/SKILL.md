---
name: youtube-subs
description: Download clean text transcripts from YouTube videos, playlists, or full channels. Use when a user wants to learn from / summarize / extract knowledge out of YouTube talks, lectures, or podcasts — especially when refining a Claude Code skill from video content. Requires yt-dlp (brew install yt-dlp).
---

# YouTube Subtitles → Clean Transcripts

A reusable skill for pulling subtitles out of YouTube and converting them to plain-text transcripts suitable for LLM ingestion.

## When to invoke

Use this skill whenever the user says anything like:
- "read the YouTube videos from X channel"
- "download the subtitles / transcripts / captions"
- "summarize this talk / lecture / podcast"
- "refine skill Y from video content"
- "what did <speaker> say in that conference talk"

Do **not** use it for:
- Short single clips where a WebFetch of the transcript panel is enough
- Paywalled or age-gated content (fails)
- Live streams (no captions until VOD)

## Prerequisites

```bash
brew install yt-dlp           # ~200 MB including deno + python@3.14
yt-dlp --version              # should print YYYY.MM.DD
```

## Usage

### One video

```bash
bash .claude/skills/youtube-subs/scripts/fetch.sh <video-id-or-url> <out-dir>
```

Produces `<out-dir>/<id>.txt` (plain text, no timestamps) plus the raw `.vtt` file for reference.

### Playlist

```bash
bash .claude/skills/youtube-subs/scripts/fetch.sh "https://www.youtube.com/playlist?list=..." <out-dir>
```

### Whole channel (last N videos)

```bash
bash .claude/skills/youtube-subs/scripts/fetch.sh "https://www.youtube.com/c/vaticle/videos" <out-dir> 20
```

The third argument caps how many videos to pull (default: unlimited — be careful on large channels).

### Selected video IDs

```bash
bash .claude/skills/youtube-subs/scripts/fetch.sh "ID1 ID2 ID3" <out-dir>
```

Pass space-separated IDs as one argument and the script loops them.

## Output layout

```
<out-dir>/
  raw/
    20240115-LMzZoq6fUqg-Intro_to_TypeDB.en.vtt    # original WebVTT
    20240115-LMzZoq6fUqg-Intro_to_TypeDB.info.json # metadata (title, uploader, duration, views)
  text/
    LMzZoq6fUqg.txt                                 # clean text, one sentence per line
  index.tsv                                         # id <TAB> title <TAB> duration <TAB> lang
```

The clean text files are what you feed to the LLM — they strip timestamps, deduplicate the rolling-captions overlap, and collapse the caption lines into paragraphs.

## How the conversion works

WebVTT auto-captions have three problems:
1. **Timestamps interleaved with text** — noise for an LLM
2. **Rolling overlap** — the same phrase appears in consecutive cues as new words arrive
3. **No sentence boundaries** — caption breaks don't match spoken sentences

`scripts/vtt-to-text.py` handles all three:
- strips timestamp lines (`^\d+:\d+:\d+\.\d+`)
- dedupes adjacent cues using longest-common-suffix detection
- reflows into sentences on `.!?` boundaries

## Quota / rate limit

`yt-dlp` hits YouTube's public endpoints; no API key, no quota. But at >50 videos in a burst, add `--sleep-interval 2` (already wired into `fetch.sh`) to avoid the soft-rate-limit that returns empty playlists.

## Known caveats

- **Auto-captions vs manual**: The script prefers manual subs (`--write-subs`) over auto (`--write-auto-subs`). If only auto is present, quality drops on technical jargon — expect "TypeQL" transcribed as "type ql" or "type cul".
- **Multi-language**: Defaults to `en`. Override with `SUBS_LANG=es bash scripts/fetch.sh ...`.
- **Title sanitization**: Filenames replace `/:?*` with `_`; Unicode is preserved.
- **Age-restricted / members-only**: Require cookies — out of scope for this skill.

## See also

- yt-dlp docs: https://github.com/yt-dlp/yt-dlp
- WebVTT spec: https://www.w3.org/TR/webvtt1/
- TypeDB skill refinement example (the pass that produced this skill): `.claude/skills/typedb/`
