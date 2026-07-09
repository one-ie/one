#!/bin/bash
# CONTRAST CHECK — catches the "on-foreground" bug class before it ships.
#
# A theme is free to fill --color-foreground with a saturated brand tone
# instead of a near-white/near-black tint (Plum does, in light mode — see
# themes.ts). Any element that fills with --color-foreground (Astro/CSS:
# `background: var(--color-foreground)`; React islands: `background: C.fg`,
# where C is the file's local color-token object) must pair it with
# --color-on-foreground / C.onFg for its text — NOT the plain
# --color-font / --color-muted / C.font / C.muted, which assume the
# surface is always light. Getting this wrong is invisible in the other 11
# themes (foreground stays light there) and only breaks on Plum, which is
# exactly why it's easy to miss — this hook makes it impossible to miss.
#
# Fires after Write/Edit/MultiEdit on src/**/*.{tsx,astro,css}. Scans the
# whole touched file (not just the diff) for a `background: ...foreground`
# declaration within ~15 lines of an unfixed font/muted color declaration —
# wide enough to usually span a CSS rule and its immediate child selectors,
# narrow enough to not flag unrelated rules elsewhere in a long stylesheet.
# Proximity-based, not a real CSS/JS parser — same tradeoff design-check.sh
# makes. False positives are possible (a nested element that deliberately
# sinks back to --color-background — see the -fixed token family — reads
# as a hit); false negatives are the failure mode this hook exists to
# avoid, so it's tuned to over-flag rather than under-flag.
#
# Exit 2 on violation — the editor feeds stderr back so the model
# self-corrects (verify each hit, fix real ones, use -fixed tokens for
# genuine sink-to-background nesting, ignore true false positives).
#
# Allowlist: Layout.astro (defines on-foreground itself).
# Rule: .claude/rules/design.md § "Theme presets"

FILE=$(echo "$1" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

if [[ -z "$FILE" ]]; then exit 0; fi
if [[ ! "$FILE" =~ /src/.*\.(tsx|astro|css)$ ]]; then exit 0; fi
if [[ ! -f "$FILE" ]]; then exit 0; fi

BASE=$(basename "$FILE")
if [[ "$BASE" == "Layout.astro" ]]; then exit 0; fi

# NOTE: no \b word-boundary anchors below — macOS ships BSD awk, which
# doesn't support \b (a GNU/PCRE extension); it silently fails the whole
# alternation instead of erroring, so this is easy to break invisibly.
# Boundaries are hand-rolled as ([^A-Za-z]|$) instead. Verify any regex
# edit here with `awk --version` behavior in mind, not just gawk/grep -P —
# and don't drop the hand-rolled boundary on C\.fg / C\.font / C\.muted,
# or this starts matching C.fontFixed / C.mutedFixed / C.fgWhatever as
# false positives (bit us once already: see git blame).
VIOLATIONS=$(awk '
  { lines[NR] = $0 }
  END {
    win = 15
    n = NR
    for (i = 1; i <= n; i++) {
      if (lines[i] ~ /(background|--tw-prose-[a-z-]*-bg):[[:space:]]*(var\(--color-foreground\)|C\.fg([^A-Za-z]|$))/) {
        lo = (i - win < 1) ? 1 : i - win
        hi = (i + win > n) ? n : i + win
        hit = ""
        for (j = lo; j <= hi; j++) {
          if (lines[j] ~ /(color|borderColor|--tw-prose-[a-z-]*):[[:space:]]*(var\(--color-font\)|var\(--color-muted\)|C\.font([^A-Za-z]|$)|C\.muted([^A-Za-z]|$))/ \
              && lines[j] !~ /on-foreground|onFg|accent-on-foreground|accentOnFg|-fixed|Fixed/) {
            hit = hit j ": " lines[j] "\n"
          }
        }
        if (hit != "") {
          printf "  L%d: %s\n%s", i, lines[i], hit
        }
      }
    }
  }
' "$FILE" | head -40)

if [[ -z "$VIOLATIONS" ]]; then exit 0; fi

cat >&2 <<EOF
✗ Contrast risk in $BASE — background: (var(--color-foreground) | C.fg) paired
  nearby with an unfixed font/muted text color:

$VIOLATIONS

--color-foreground can be a saturated brand fill (Plum, in light mode) —
plain --color-font / --color-muted / C.font / C.muted assume it's always
near-white and go illegible on that fill. For each hit above:
  - Text/icons painted ON the foreground fill → var(--color-on-foreground) / C.onFg
  - Text that specifically wants the brand color (primary) on that fill →
    var(--color-accent-on-foreground) / C.accentOnFg (falls back to
    on-foreground only when primary and foreground are too close to read)
  - A NESTED element that deliberately sinks back to --color-background
    (an input inside a filled card, e.g.) is correct as-is if it's already
    using the --color-font-fixed / --color-muted-fixed / --color-border-fixed
    family — that's the one legitimate reason this hook still fires; verify
    the line before changing it, don't blindly swap every hit.

Rule: .claude/rules/design.md § "Theme presets"
EOF

exit 2
