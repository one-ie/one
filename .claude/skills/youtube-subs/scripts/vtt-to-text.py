#!/usr/bin/env python3
"""Convert WebVTT files to clean plain-text transcripts.

Handles YouTube's auto-caption quirks:
  - Timestamps on their own lines (stripped)
  - Inline cue timing tags like <00:00:01.500> (stripped)
  - Rolling-window overlap between adjacent cues (de-duplicated)
  - HTML entities + positioning metadata (stripped)

Usage:
    vtt-to-text.py <input-dir> <output-dir>

Each `<id>-<title>.en.vtt` → `<id>.txt` (one sentence per line where detectable).
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

# Line-start timestamp: "00:00:05.000 --> 00:00:08.000" and variations
TS_LINE = re.compile(r"^\d+:\d+:\d+\.\d+\s*-->\s*\d+:\d+:\d+\.\d+.*$")
# Inline timing tags: <00:00:01.500>
INLINE_TS = re.compile(r"<\d+:\d+:\d+\.\d+>")
# Positioning tags: <c>, </c>, <c.colorFFFFFF>
INLINE_TAG = re.compile(r"</?c[^>]*>")
# WebVTT header + cue-ids + positioning lines
META_LINE = re.compile(r"^(WEBVTT|NOTE|Kind:|Language:|X-TIMESTAMP|\d+)(\s|$)")

EXTRACT_ID = re.compile(r"-([A-Za-z0-9_-]{11})-")


def parse_vtt(text: str) -> list[str]:
    """Return ordered list of cue lines with timing/tags stripped."""
    cues: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if TS_LINE.match(line):
            continue
        if META_LINE.match(line):
            continue
        # Strip inline tags
        line = INLINE_TS.sub("", line)
        line = INLINE_TAG.sub("", line)
        line = html.unescape(line).strip()
        if line:
            cues.append(line)
    return cues


def dedupe_rolling(cues: list[str]) -> list[str]:
    """YouTube auto-captions repeat each phrase as the rolling window advances.

    Strategy: if cue N fully starts with cue N-1, keep only the new suffix.
    Otherwise look for the longest suffix of cue N-1 that is a prefix of cue N
    and drop that overlap.
    """
    out: list[str] = []
    prev = ""
    for cur in cues:
        if not prev:
            out.append(cur)
            prev = cur
            continue
        if cur == prev:
            continue
        if cur.startswith(prev):
            suffix = cur[len(prev) :].strip()
            if suffix:
                out.append(suffix)
            prev = cur
            continue
        # Find longest overlap: prev's suffix == cur's prefix
        overlap = 0
        max_k = min(len(prev), len(cur))
        for k in range(max_k, 0, -1):
            if prev.endswith(cur[:k]):
                overlap = k
                break
        trimmed = cur[overlap:].strip()
        if trimmed:
            out.append(trimmed)
        prev = cur
    return out


def reflow_sentences(pieces: list[str]) -> str:
    """Join cue fragments into flowing text, break on sentence-end punctuation."""
    joined = " ".join(pieces)
    joined = re.sub(r"\s+", " ", joined).strip()
    # Insert newlines after sentence-ending punctuation
    joined = re.sub(r"([.!?])\s+(?=[A-Z0-9])", r"\1\n", joined)
    return joined


def convert(vtt_path: Path) -> str:
    raw = vtt_path.read_text(encoding="utf-8", errors="replace")
    cues = parse_vtt(raw)
    cues = dedupe_rolling(cues)
    return reflow_sentences(cues)


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: vtt-to-text.py <input-dir> <output-dir>", file=sys.stderr)
        return 2
    in_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    count = 0
    for vtt in sorted(in_dir.glob("*.vtt")):
        m = EXTRACT_ID.search(vtt.name)
        if m:
            out_name = f"{m.group(1)}.txt"
        else:
            out_name = vtt.stem + ".txt"
        text = convert(vtt)
        (out_dir / out_name).write_text(text + "\n", encoding="utf-8")
        count += 1
    print(f"  converted {count} VTT → txt")
    return 0


if __name__ == "__main__":
    sys.exit(main())
