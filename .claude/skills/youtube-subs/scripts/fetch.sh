#!/usr/bin/env bash
# youtube-subs/fetch.sh — download subtitles for a video, playlist, channel, or list of IDs
#
# Usage:
#   fetch.sh <url-or-ids> <out-dir> [max-videos]
#
# Env:
#   SUBS_LANG=en     (override subtitle language, default en)
#   PREFER_AUTO=0    (if 1, accept auto-generated even when manual exists)

set -euo pipefail

if [[ $# -lt 2 ]]; then
  cat >&2 <<EOF
Usage: $0 <url-or-space-separated-ids> <out-dir> [max-videos]

Examples:
  $0 dQw4w9WgXcQ ./out
  $0 "https://www.youtube.com/c/vaticle/videos" ./out 20
  $0 "ID1 ID2 ID3" ./out
EOF
  exit 1
fi

TARGET="$1"
OUT_DIR="$2"
MAX="${3:-0}"
LANG="${SUBS_LANG:-en}"

mkdir -p "$OUT_DIR/raw" "$OUT_DIR/text"

# If TARGET is a space-separated list of IDs, turn them into URLs
if [[ "$TARGET" =~ ^[A-Za-z0-9_-]{11}([[:space:]]+[A-Za-z0-9_-]{11})*$ ]]; then
  URLS=()
  for id in $TARGET; do
    URLS+=("https://www.youtube.com/watch?v=$id")
  done
else
  URLS=("$TARGET")
fi

# Build yt-dlp args
COMMON_ARGS=(
  --skip-download
  --write-subs
  --write-auto-subs
  --sub-langs "$LANG"
  --sub-format "vtt"
  --write-info-json
  --no-warnings
  --sleep-interval 1
  --ignore-errors
  -o "$OUT_DIR/raw/%(upload_date>%Y%m%d)s-%(id)s-%(title).80s.%(ext)s"
)

if [[ "$MAX" != "0" ]]; then
  COMMON_ARGS+=(--playlist-end "$MAX")
fi

echo "→ Fetching subtitles for ${#URLS[@]} target(s) into $OUT_DIR/raw/"
for url in "${URLS[@]}"; do
  yt-dlp "${COMMON_ARGS[@]}" "$url" || echo "  ⚠ partial failure on $url (continuing)"
done

echo "→ Converting VTT to clean text"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/vtt-to-text.py" "$OUT_DIR/raw" "$OUT_DIR/text"

echo "→ Building index"
INDEX="$OUT_DIR/index.tsv"
printf "id\ttitle\tduration\tupload_date\tview_count\n" > "$INDEX"
for info in "$OUT_DIR"/raw/*.info.json; do
  [[ -e "$info" ]] || continue
  jq -r '[.id, .title, (.duration // 0), (.upload_date // "NA"), (.view_count // 0)] | @tsv' "$info" >> "$INDEX"
done

# Summary
RAW_COUNT=$(find "$OUT_DIR/raw" -name "*.vtt" 2>/dev/null | wc -l | tr -d ' ')
TXT_COUNT=$(find "$OUT_DIR/text" -name "*.txt" 2>/dev/null | wc -l | tr -d ' ')
echo
echo "✓ $RAW_COUNT VTT files, $TXT_COUNT text files"
echo "  Index: $INDEX"
echo "  Feed text/ to an LLM for synthesis"
