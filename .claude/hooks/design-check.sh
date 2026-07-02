#!/bin/bash
# DESIGN CHECK — enforces the 6-token design system on every Write/Edit.
#
# Fires after Write/Edit/MultiEdit on src/**/*.{tsx,astro,css}.
# Greps the touched file for banned palette classes, hex literals, raw
# hsl()/rgb() calls, and off-scale arbitrary values. CSS var refs are allowed.
#
# Exit 2 on violation — the editor feeds stderr back so the model self-corrects.
# The edit already landed; the model fixes it on the next turn.
#
# Allowlist: Layout.astro (the token source).
# Rule: .claude/rules/design.md

FILE=$(echo "$1" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

if [[ -z "$FILE" ]]; then exit 0; fi
if [[ ! "$FILE" =~ /src/.*\.(tsx|astro|css)$ ]]; then exit 0; fi

BASE=$(basename "$FILE")
if [[ "$BASE" == "Layout.astro" ]]; then exit 0; fi

PALETTE='zinc|slate|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
PROPS='bg|text|border|ring|from|to|via|fill|stroke|placeholder|caret|accent|decoration|divide|outline|shadow'
CLASS_RE="(${PROPS})-(${PALETTE})-[0-9]+"
LITERAL_RE='#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?\b|\b(hsl|rgb|hsla|rgba)\('
ARBITRARY_PROPS='p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y|rounded|rounded-t|rounded-b|rounded-l|rounded-r|text|leading|tracking'
ARBITRARY_RE="(^|[[:space:]\"'])(${ARBITRARY_PROPS})-\[[^]]+\]"

VIOLATIONS=$(
  {
    grep -nE "$CLASS_RE" "$FILE" 2>/dev/null
    grep -nE "$LITERAL_RE" "$FILE" 2>/dev/null
    grep -nE "$ARBITRARY_RE" "$FILE" 2>/dev/null | grep -v 'var(--'
  } | head -20
)

if [[ -z "$VIOLATIONS" ]]; then exit 0; fi

COUNT=$(echo "$VIOLATIONS" | wc -l | tr -d ' ')
cat >&2 <<EOF
✗ Design system violation in $BASE — $COUNT line(s) escape the token / scale system.

$VIOLATIONS

The design system is 6 tokens: background, foreground, font, primary, secondary, tertiary.
Plus invariants: white, black, transparent.

Replace banned utilities:
  bg-zinc-*, bg-indigo-*, etc.  →  bg-{background|foreground|primary|secondary|tertiary}
  text-zinc-*, text-emerald-*   →  text-{font|primary|tertiary}  (use /60, /40 for muted)
  Hex literals (#fff, #abc)     →  use a token
  hsl()/rgb() in source         →  only allowed in Layout.astro
  p-[13px], gap-[5px]           →  snap to 4/8/12/16/20/24/32 (p-1, p-2, ...)

Rule: .claude/rules/design.md
EOF

exit 2
