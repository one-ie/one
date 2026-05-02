#!/bin/bash
# DESIGN CHECK — enforces the 6-token design system on every Write/Edit.
#
# Fires after Write/Edit/MultiEdit on web/**/*.{tsx,astro,css}.
# Greps the touched file for banned palette classes (zinc, indigo, ...),
# hex literals, raw hsl()/rgb() calls, and off-scale arbitrary values
# (p-[13px], rounded-[7px], text-[15px]) that escape the spacing/radius
# /typography scales. CSS var refs (text-[var(--size)]) are allowed.
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

# Off-scale escape hatches: arbitrary spacing/sizing/radius/typography values.
# Spacing scale (design.md): 4/8/12/16/20/24/32. Radius: sm/md/lg (6/10/16).
# `text-[var(--size)]` is fine — only literal pixel/rem/em values get flagged.
# Width/height/size deliberately omitted — layout math (h-[calc(100vh-73px)],
# w-[380px] for a fixed widget) legitimately needs values off the 4-step scale.
ARBITRARY_PROPS='p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y|rounded|rounded-t|rounded-b|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|text|leading|tracking'
ARBITRARY_RE="(^|[[:space:]\"'])(${ARBITRARY_PROPS})-\[[^]]+\]"

VIOLATIONS=$(
  {
    grep -nE "$CLASS_RE" "$FILE" 2>/dev/null
    grep -nE "$LITERAL_RE" "$FILE" 2>/dev/null
    grep -nE "$ARBITRARY_RE" "$FILE" 2>/dev/null | grep -v 'var(--'
  } | head -20
)

if [[ -z "$VIOLATIONS" ]]; then
  emit_signal "hook:design-check:ok" 1 "file=$BASE"
  exit 0
fi

COUNT=$(echo "$VIOLATIONS" | wc -l | tr -d ' ')
emit_signal "hook:design-check:warn" -1 "file=$BASE violations=$COUNT"

cat >&2 <<EOF
✗ Design system violation in $BASE — $COUNT line(s) escape the token / scale system.

$VIOLATIONS

The design system is 6 tokens: background, foreground, font, primary, secondary, tertiary.
Plus invariants: white, black, transparent.

Replace banned utilities:
  bg-zinc-*, bg-indigo-*, etc.  →  bg-{background|foreground|primary|secondary|tertiary}
  text-zinc-*, text-emerald-*   →  text-{font|primary|tertiary}  (use /60, /40 for muted)
  border-zinc-*                 →  border-font/10
  Hex literals (#fff, #abc)     →  use a token
  hsl()/rgb() in source         →  only allowed in Layout.astro
  p-[13px], m-[7px], gap-[5px]  →  snap to 4/8/12/16/20/24/32 (p-1, p-2, p-3, p-4, ...)
  rounded-[7px]                 →  rounded-md (10px) / rounded-lg (16px) / use --radius-*
  text-[15px], leading-[18px]   →  Tailwind text-sm/base/lg or text-[var(--size-N)]

Spec: design.md  ·  Rule: .claude/rules/design.md  ·  Showcase: /design
EOF

exit 2
