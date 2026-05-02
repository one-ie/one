#!/bin/bash
# DESIGN CHECK — enforces the 6-token design system on every Write/Edit.
#
# Fires after Write/Edit/MultiEdit on web/**/*.{tsx,astro,css}.
# Greps the touched file for banned palette classes (zinc, indigo, ...),
# hex literals, and raw hsl()/rgb() calls.
#
# Exit 2 on violation — Claude Code feeds stderr back to the model so it
# self-corrects on the next turn. The edit already landed; the model fixes it.
#
# Allowlist: Layout.astro (token source) and design.astro (showcase).
# Spec: /Users/toc/Server/one-ie/one/design.md
# Rule: .claude/rules/design.md

# shellcheck source=lib/signal.sh
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/signal.sh"

FILE=$(echo "$1" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

# Scope: only web source files in the design system
if [[ -z "$FILE" ]]; then exit 0; fi
if [[ ! "$FILE" =~ /web/src/.*\.(tsx|astro|css)$ ]]; then exit 0; fi

# Allowlist — the token source and the showcase intentionally use raw HSL
BASE=$(basename "$FILE")
if [[ "$BASE" == "Layout.astro" ]] || [[ "$BASE" == "design.astro" ]]; then
  emit_signal "hook:design-check:skip" 0 "file=$BASE allowlisted"
  exit 0
fi

PALETTE='zinc|slate|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
PROPS='bg|text|border|ring|from|to|via|fill|stroke|placeholder|caret|accent|decoration|divide|outline|shadow'
CLASS_RE="(${PROPS})-(${PALETTE})-[0-9]+"
LITERAL_RE='#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?\b|\b(hsl|rgb|hsla|rgba)\('

VIOLATIONS=$(
  {
    grep -nE "$CLASS_RE" "$FILE" 2>/dev/null
    grep -nE "$LITERAL_RE" "$FILE" 2>/dev/null
  } | head -20
)

if [[ -z "$VIOLATIONS" ]]; then
  emit_signal "hook:design-check:ok" 1 "file=$BASE"
  exit 0
fi

COUNT=$(echo "$VIOLATIONS" | wc -l | tr -d ' ')
emit_signal "hook:design-check:warn" -1 "file=$BASE violations=$COUNT"

cat >&2 <<EOF
✗ Design system violation in $BASE — $COUNT line(s) use non-token colors.

$VIOLATIONS

The design system is 6 tokens: background, foreground, font, primary, secondary, tertiary.
Plus invariants: white, black, transparent.

Replace banned utilities:
  bg-zinc-*, bg-indigo-*, etc.  →  bg-{background|foreground|primary|secondary|tertiary}
  text-zinc-*, text-emerald-*   →  text-{font|primary|tertiary}  (use /60, /40 for muted)
  border-zinc-*                 →  border-font/10
  Hex literals (#fff, #abc)     →  use a token
  hsl()/rgb() in source         →  only allowed in Layout.astro

Spec: design.md  ·  Rule: .claude/rules/design.md  ·  Showcase: /design
EOF

exit 2
