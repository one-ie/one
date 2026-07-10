#!/usr/bin/env bash
# seo-drift.sh — post-launch drift monitor from data/text/seo.md §11, as an
# executable snapshot-and-diff tool (not documentation). See data/text/seo.md
# §0 WP-5 for the spec this implements.
#
# Usage:
#   scripts/seo-drift.sh <base-url> [--acknowledge]
#     scripts/seo-drift.sh http://localhost:4321
#     scripts/seo-drift.sh https://one.ie --acknowledge
#
# Behaviour:
#   - No prior snapshot in seo-snapshots/: captures a baseline and exits 0.
#     First run is a baseline, never a failure.
#   - Prior snapshot exists: captures a fresh snapshot, diffs it against the
#     saved one, prints a PASS/FAIL/NOTE line per §11 check, and exits
#     non-zero naming every regressed check by name (never a generic
#     "drift detected").
#   - On a clean run (or a failing run re-invoked with --acknowledge) the
#     saved snapshot is replaced with the fresh state, so the next run
#     diffs against the latest known-good state, not the original baseline
#     forever. On a failing run WITHOUT --acknowledge, the saved snapshot is
#     left untouched so the regression stays visible next time instead of
#     silently becoming the new normal.
#
# §11's single highest-value check: any new `Disallow` line in robots.txt
# versus the saved baseline is the loudest possible alarm on this whole list
# (cheap to run, and it's the exact failure class that once cost a real site
# 36 hours of zero traffic before anyone noticed).
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SNAPSHOT_DIR="$SCRIPT_DIR/seo-snapshots"
CURL_TIMEOUT=20
WORD_COUNT_THRESHOLD=0.70   # a money page below 70% of its baseline word count fails
SITEMAP_DROP_THRESHOLD=0.80 # a sitemap URL count below 80% of its baseline fails

have() { command -v "$1" >/dev/null 2>&1; }
if ! have curl; then
  echo "FATAL: curl not found — this script requires curl." >&2
  exit 2
fi
if ! have python3; then
  echo "FATAL: python3 not found — needed to parse HTML/JSON-LD/sitemap output." >&2
  exit 2
fi

BASE_URL=""
ACK=0
for arg in "$@"; do
  case "$arg" in
    --acknowledge|-a) ACK=1 ;;
    *) [ -z "$BASE_URL" ] && BASE_URL="$arg" ;;
  esac
done
if [ -z "$BASE_URL" ]; then
  echo "usage: $0 <base-url> [--acknowledge]" >&2
  echo "  e.g. $0 http://localhost:4321" >&2
  exit 2
fi
BASE_URL="${BASE_URL%/}"

mkdir -p "$SNAPSHOT_DIR"
WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/seo-drift.XXXXXX")"
trap 'rm -rf "$WORK_DIR"' EXIT

FIRST_RUN=1
[ -f "$SNAPSHOT_DIR/meta.txt" ] && FIRST_RUN=0

FAIL_COUNT=0
PASS_COUNT=0
FAILURE_LIST=""

section() { printf '\n%s\n' "$1"; }
pass() { PASS_COUNT=$((PASS_COUNT + 1)); printf '  [PASS] %s\n' "$1"; }
fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf '  [FAIL] %s\n' "$1"
  FAILURE_LIST="${FAILURE_LIST}${FAILURE_LIST:+$'\n'}  - $1"
}
note() { printf '  [NOTE] %s\n' "$1"; }

fetch_body() {
  # $1 = url, $2 = output file -> prints the FINAL http status code (or 000
  # on failure). Follows redirects (-L): prerendered collection routes in
  # this repo 307 bare "/blog/slug" to "/blog/slug/" (same trailing-slash
  # normalization already seen on /blog and /docs) — that's a cosmetic
  # routing detail, not a page we want to score as "absent". §9/WP-4's gate
  # script is the one responsible for catching a *bad* redirect chain; this
  # tool cares about the content the redirect resolves to.
  # Note: curl's -w '%{http_code}' already prints "000" on a connection
  # failure, so no separate `|| echo 000` fallback here — that would double
  # up into "000000" on a refused connection.
  local code
  code=$(curl -sL --max-redirs 5 -o "$2" -w '%{http_code}' --max-time "$CURL_TIMEOUT" "$1" 2>/dev/null)
  [ -z "$code" ] && code="000"
  printf '%s' "$code"
}

# ---------------------------------------------------------------------------
# python3 helpers — inline, no extra file (this package owns only this
# script + seo-snapshots/, so no helper module lives elsewhere)
# ---------------------------------------------------------------------------
word_count() {
  python3 - "$1" <<'PY'
import sys, re, html as ihtml
data = open(sys.argv[1], encoding='utf-8', errors='replace').read()
data = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', data)
text = re.sub(r'(?s)<[^>]+>', ' ', data)
text = ihtml.unescape(text)
print(len([w for w in text.split() if w.strip()]))
PY
}

heading_list() {
  python3 - "$1" <<'PY'
import sys, re, html as ihtml
data = open(sys.argv[1], encoding='utf-8', errors='replace').read()
data = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', data)
for level, htext in re.findall(r'(?is)<h([1-6])[^>]*>(.*?)</h\1>', data):
    t = re.sub(r'(?s)<[^>]+>', ' ', htext)
    t = ' '.join(ihtml.unescape(t).split())
    if t:
        print(f"h{level}: {t}")
PY
}

canonical_of() {
  python3 - "$1" <<'PY'
import sys, re
data = open(sys.argv[1], encoding='utf-8', errors='replace').read()
m = re.search(r'(?is)<link\s+[^>]*rel=["\']canonical["\'][^>]*>', data)
if m:
    href = re.search(r'(?is)href=["\']([^"\']+)["\']', m.group(0))
    print(href.group(1) if href else "absent")
else:
    print("absent")
PY
}

# Path portion of a URL, ignoring scheme/host. Prerendered routes in this
# repo bake their canonical from the build-time production origin
# (seo-site.ts SITE.url) while the SSR-only homepage computes it from the
# live request host (Astro.url) — both are correct per §0's finding 2, so
# "self-referencing" here means "same path", never "same host as $BASE_URL".
path_of_url() {
  python3 -c "
import sys
from urllib.parse import urlparse
print(urlparse(sys.argv[1]).path or '/')
" "$1"
}

jsonld_status() {
  python3 - "$1" <<'PY'
import sys, re, json
data = open(sys.argv[1], encoding='utf-8', errors='replace').read()
blocks = re.findall(
    r'(?is)<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', data
)
if not blocks:
    print("absent")
else:
    ok = True
    for b in blocks:
        try:
            json.loads(b.strip())
        except Exception:
            ok = False
            break
    print("valid" if ok else "invalid")
PY
}

sitemap_url_count() {
  python3 - "$1" <<'PY'
import sys, re
data = open(sys.argv[1], encoding='utf-8', errors='replace').read()
print(len(re.findall(r'(?is)<loc>', data)))
PY
}

# Discover the first real slug under a collection index (e.g. /blog/ ->
# /blog/hello-template) so this tool works whichever content exists when it
# happens to run, per the brief: "snapshot whatever exists when you run".
discover_first_slug() {
  local index_path="$1" prefix="$2" body_file="$WORK_DIR/discover-$$-$RANDOM.html"
  local code
  code=$(fetch_body "$BASE_URL$index_path" "$body_file")
  if [ "$code" != "200" ]; then
    echo ""
    return
  fi
  grep -oE "href=\"${prefix}[^\"#?]+\"" "$body_file" 2>/dev/null \
    | sed -E 's/^href="//; s/"$//' \
    | grep -vE "^${prefix}\$" \
    | sort -u | head -1
}

# Resolve the key-page target to check, preferring continuity with the last
# run's target (so we keep diffing the same page over time) but falling back
# to rediscovery if that page has disappeared, and to "" (absent) if nothing
# of that content type exists at all.
resolve_target() {
  local prev="$1" index_path="$2" prefix="$3"
  if [ -n "$prev" ]; then
    local code
    code=$(curl -sL --max-redirs 5 -o /dev/null -w '%{http_code}' --max-time "$CURL_TIMEOUT" "$BASE_URL$prev" 2>/dev/null)
    [ -z "$code" ] && code="000"
    if [ "$code" = "200" ]; then
      echo "$prev"
      return
    fi
  fi
  discover_first_slug "$index_path" "$prefix"
}

# ---------------------------------------------------------------------------
# Load previous target continuity (empty on first run)
# ---------------------------------------------------------------------------
PREV_BLOG_POST=""
PREV_DOCS_PAGE=""
if [ -f "$SNAPSHOT_DIR/meta.txt" ]; then
  PREV_BLOG_POST=$(grep '^BLOG_POST_PATH=' "$SNAPSHOT_DIR/meta.txt" | cut -d= -f2-)
  PREV_DOCS_PAGE=$(grep '^DOCS_PAGE_PATH=' "$SNAPSHOT_DIR/meta.txt" | cut -d= -f2-)
fi

BLOG_POST_PATH=$(resolve_target "$PREV_BLOG_POST" "/blog/" "/blog/")
DOCS_PAGE_PATH=$(resolve_target "$PREV_DOCS_PAGE" "/docs/" "/docs/")

if [ "$FIRST_RUN" = "0" ] && [ -n "$PREV_BLOG_POST" ] && [ "$PREV_BLOG_POST" != "$BLOG_POST_PATH" ]; then
  note "blog-post key page changed: was $PREV_BLOG_POST, now ${BLOG_POST_PATH:-absent (no blog post found)}"
fi
if [ "$FIRST_RUN" = "0" ] && [ -n "$PREV_DOCS_PAGE" ] && [ "$PREV_DOCS_PAGE" != "$DOCS_PAGE_PATH" ]; then
  note "docs-page key page changed: was $PREV_DOCS_PAGE, now ${DOCS_PAGE_PATH:-absent (no docs page found)}"
fi

# ---------------------------------------------------------------------------
# Capture the current state into WORK_DIR
# ---------------------------------------------------------------------------
capture_key_page() {
  # $1 = key name, $2 = path ("" means "doesn't exist")
  local key="$1" path="$2"
  if [ -z "$path" ]; then
    echo "absent (no such page exists yet)" > "$WORK_DIR/canonical-$key.txt"
    echo "absent (no such page exists yet)" > "$WORK_DIR/jsonld-$key.txt"
    return
  fi
  local html_file="$WORK_DIR/keypage-$key.html"
  local code
  code=$(fetch_body "$BASE_URL$path" "$html_file")
  if [ "$code" = "200" ]; then
    canonical_of "$html_file" > "$WORK_DIR/canonical-$key.txt"
    jsonld_status "$html_file" > "$WORK_DIR/jsonld-$key.txt"
  else
    echo "absent (page returned HTTP $code)" > "$WORK_DIR/canonical-$key.txt"
    echo "absent (page returned HTTP $code)" > "$WORK_DIR/jsonld-$key.txt"
  fi
}

capture_money_page() {
  # $1 = key name, $2 = path
  local key="$1" path="$2"
  local html_file="$WORK_DIR/moneypage-$key.html"
  local code
  code=$(fetch_body "$BASE_URL$path" "$html_file")
  if [ "$code" = "200" ]; then
    word_count "$html_file" > "$WORK_DIR/wordcount-$key.txt"
    heading_list "$html_file" > "$WORK_DIR/sections-$key.txt"
  else
    echo "absent (page returned HTTP $code)" > "$WORK_DIR/wordcount-$key.txt"
    : > "$WORK_DIR/sections-$key.txt"
  fi
}

capture_key_page home "/"
capture_key_page blog-post "$BLOG_POST_PATH"
capture_key_page docs-page "$DOCS_PAGE_PATH"

capture_money_page home "/"
capture_money_page blog-index "/blog/"
capture_money_page docs-index "/docs/"

ROBOTS_CODE=$(fetch_body "$BASE_URL/robots.txt" "$WORK_DIR/robots.txt")
if [ "$ROBOTS_CODE" != "200" ]; then
  : > "$WORK_DIR/robots.txt"
  note "robots.txt fetch returned HTTP $ROBOTS_CODE (treating as empty for this snapshot)"
fi

SITEMAP_CODE=$(fetch_body "$BASE_URL/sitemap.xml" "$WORK_DIR/sitemap.xml")
if [ "$SITEMAP_CODE" = "200" ]; then
  sitemap_url_count "$WORK_DIR/sitemap.xml" > "$WORK_DIR/sitemap-count.txt"
else
  echo "absent" > "$WORK_DIR/sitemap-count.txt"
fi

{
  echo "BASE_URL=$BASE_URL"
  echo "BLOG_POST_PATH=$BLOG_POST_PATH"
  echo "DOCS_PAGE_PATH=$DOCS_PAGE_PATH"
  echo "LAST_RUN=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$WORK_DIR/meta.txt"

SNAPSHOT_FILES="robots.txt sitemap-count.txt meta.txt \
canonical-home.txt canonical-blog-post.txt canonical-docs-page.txt \
jsonld-home.txt jsonld-blog-post.txt jsonld-docs-page.txt \
wordcount-home.txt wordcount-blog-index.txt wordcount-docs-index.txt \
sections-home.txt sections-blog-index.txt sections-docs-index.txt"

commit_snapshot() {
  for f in $SNAPSHOT_FILES; do
    if [ -f "$WORK_DIR/$f" ]; then
      cp "$WORK_DIR/$f" "$SNAPSHOT_DIR/$f"
    fi
  done
}

echo "seo-drift.sh — checking $BASE_URL against $SNAPSHOT_DIR"

# ===========================================================================
# FIRST RUN: no prior state to diff against. Capture baseline, exit clean.
# ===========================================================================
if [ "$FIRST_RUN" = "1" ]; then
  section "BASELINE (no prior snapshot found in $SNAPSHOT_DIR)"
  echo "  robots.txt: $(wc -l < "$WORK_DIR/robots.txt" | tr -d ' ') line(s) captured"
  echo "  sitemap URL count: $(cat "$WORK_DIR/sitemap-count.txt")"
  for key in home blog-post docs-page; do
    echo "  canonical [$key]: $(cat "$WORK_DIR/canonical-$key.txt")"
    echo "  json-ld   [$key]: $(cat "$WORK_DIR/jsonld-$key.txt")"
  done
  for key in home blog-index docs-index; do
    echo "  word count [$key]: $(cat "$WORK_DIR/wordcount-$key.txt")"
    echo "  headings   [$key]: $(wc -l < "$WORK_DIR/sections-$key.txt" | tr -d ' ') section(s)"
  done
  commit_snapshot
  echo
  echo "Baseline saved to $SNAPSHOT_DIR — re-run this script later to check for drift."
  exit 0
fi

# ===========================================================================
# SUBSEQUENT RUN: diff fresh capture against saved snapshot
# ===========================================================================

# --- §11 check 4: robots.txt diff — the loudest alarm on the whole list ---
section "ROBOTS.TXT (§11 check 4 — highest-value check on the list)"
OLD_DISALLOW=$(grep -i '^Disallow:' "$SNAPSHOT_DIR/robots.txt" 2>/dev/null | sort -u)
NEW_DISALLOW=$(grep -i '^Disallow:' "$WORK_DIR/robots.txt" 2>/dev/null | sort -u)
ADDED_DISALLOW=$(comm -13 <(printf '%s\n' "$OLD_DISALLOW") <(printf '%s\n' "$NEW_DISALLOW") 2>/dev/null | sed '/^$/d')
REMOVED_DISALLOW=$(comm -23 <(printf '%s\n' "$OLD_DISALLOW") <(printf '%s\n' "$NEW_DISALLOW") 2>/dev/null | sed '/^$/d')
if [ -n "$ADDED_DISALLOW" ]; then
  fail "robots.txt: NEW Disallow line(s) not in the baseline — $(printf '%s' "$ADDED_DISALLOW" | tr '\n' ';' | sed 's/;$//')"
elif [ -n "$REMOVED_DISALLOW" ]; then
  fail "robots.txt: Disallow line(s) present in the baseline are now gone (unexpected robots.txt drift) — $(printf '%s' "$REMOVED_DISALLOW" | tr '\n' ';' | sed 's/;$//')"
else
  pass "robots.txt: no Disallow drift vs baseline"
fi

# --- §11 check 9 (partial): sitemap URL count should not silently shrink ---
section "SITEMAP URL COUNT"
OLD_SITEMAP=$(cat "$SNAPSHOT_DIR/sitemap-count.txt" 2>/dev/null || echo "absent")
NEW_SITEMAP=$(cat "$WORK_DIR/sitemap-count.txt")
case "$OLD_SITEMAP" in
  absent)
    if [ "$NEW_SITEMAP" = "absent" ]; then
      note "sitemap.xml: still absent (not built yet)"
    else
      pass "sitemap.xml: now present with $NEW_SITEMAP URL(s) (previously absent)"
    fi
    ;;
  *)
    if [ "$NEW_SITEMAP" = "absent" ]; then
      fail "sitemap.xml regression: previously $OLD_SITEMAP URL(s), now absent (unreachable/non-200)"
    else
      SITEMAP_FLOOR=$(python3 -c "print(int($OLD_SITEMAP * $SITEMAP_DROP_THRESHOLD))")
      if [ "$NEW_SITEMAP" -lt "$SITEMAP_FLOOR" ]; then
        fail "sitemap.xml regression: URL count dropped from $OLD_SITEMAP to $NEW_SITEMAP (below ${SITEMAP_DROP_THRESHOLD}x baseline floor of $SITEMAP_FLOOR)"
      else
        pass "sitemap.xml: $NEW_SITEMAP URL(s) (baseline $OLD_SITEMAP)"
      fi
    fi
    ;;
esac

# --- §11 checks 5 + 7: canonical still self-referencing, JSON-LD still valid
section "CANONICAL + JSON-LD ON KEY PAGES"
for key in home blog-post docs-page; do
  case "$key" in
    home) EXPECT_PATH="/" ;;
    blog-post) EXPECT_PATH="$BLOG_POST_PATH" ;;
    docs-page) EXPECT_PATH="$DOCS_PAGE_PATH" ;;
  esac

  OLD_CANON=$(cat "$SNAPSHOT_DIR/canonical-$key.txt" 2>/dev/null || echo "absent")
  NEW_CANON=$(cat "$WORK_DIR/canonical-$key.txt")
  case "$NEW_CANON" in
    absent*)
      case "$OLD_CANON" in
        absent*) note "canonical [$key]: still absent (page doesn't exist)" ;;
        *) fail "canonical regression [$key]: was '$OLD_CANON', now $NEW_CANON" ;;
      esac
      ;;
    *)
      # Self-referencing = same PATH, never "same host as $BASE_URL": a
      # prerendered route's canonical is legitimately built from the
      # production origin (seo-site.ts) while an SSR route's canonical is
      # built from the live request host (§0 finding 2) — both correct,
      # different hosts. Trailing slash tolerated (collection routes 307
      # bare "/blog/slug" -> "/blog/slug/", same as /blog and /docs).
      NEW_CANON_PATH=$(path_of_url "$NEW_CANON")
      if [ "${NEW_CANON_PATH%/}" != "${EXPECT_PATH%/}" ]; then
        fail "canonical [$key] no longer self-referencing: page at path '$EXPECT_PATH' has canonical '$NEW_CANON' (path '$NEW_CANON_PATH')"
      else
        case "$OLD_CANON" in
          absent*) pass "canonical [$key]: self-referencing ($NEW_CANON) — newly present" ;;
          "$NEW_CANON") pass "canonical [$key]: self-referencing, unchanged ($NEW_CANON)" ;;
          *) fail "canonical drift [$key]: was '$OLD_CANON', now '$NEW_CANON'" ;;
        esac
      fi
      ;;
  esac

  OLD_JSONLD=$(cat "$SNAPSHOT_DIR/jsonld-$key.txt" 2>/dev/null || echo "absent")
  NEW_JSONLD=$(cat "$WORK_DIR/jsonld-$key.txt")
  case "$NEW_JSONLD" in
    invalid) fail "json-ld [$key]: present but does not parse as valid JSON" ;;
    valid) pass "json-ld [$key]: valid" ;;
    *)
      case "$OLD_JSONLD" in
        valid) fail "json-ld regression [$key]: was valid, now $NEW_JSONLD" ;;
        *) note "json-ld [$key]: absent (not implemented yet)" ;;
      esac
      ;;
  esac
done

# --- §11 check 9: content regression — word count + section list ----------
section "MONEY-PAGE CONTENT (word count + section/heading list)"
for key in home blog-index docs-index; do
  OLD_WC=$(cat "$SNAPSHOT_DIR/wordcount-$key.txt" 2>/dev/null || echo "absent")
  NEW_WC=$(cat "$WORK_DIR/wordcount-$key.txt")

  case "$NEW_WC" in
    ''|*[!0-9]*)
      case "$OLD_WC" in
        ''|*[!0-9]*) note "content [$key]: page unreachable ($NEW_WC)" ;;
        *) fail "content regression [$key]: page now unreachable/absent ($NEW_WC), previously $OLD_WC word(s)" ;;
      esac
      ;;
    *)
      case "$OLD_WC" in
        ''|*[!0-9]*) pass "content [$key]: $NEW_WC word(s) (no prior numeric baseline)" ;;
        *)
          WC_FLOOR=$(python3 -c "print(int($OLD_WC * $WORD_COUNT_THRESHOLD))")
          if [ "$NEW_WC" -lt "$WC_FLOOR" ]; then
            PCT=$(python3 -c "print(int($WORD_COUNT_THRESHOLD * 100))")
            fail "content regression [$key]: word count dropped from $OLD_WC to $NEW_WC (below ${PCT}% of baseline, floor $WC_FLOOR)"
          else
            pass "content [$key]: $NEW_WC word(s) (baseline $OLD_WC)"
          fi
          ;;
      esac
      ;;
  esac

  OLD_SECTIONS_FILE="$SNAPSHOT_DIR/sections-$key.txt"
  NEW_SECTIONS_FILE="$WORK_DIR/sections-$key.txt"
  if [ -f "$OLD_SECTIONS_FILE" ]; then
    OLD_SEC_COUNT=$(wc -l < "$OLD_SECTIONS_FILE" | tr -d ' ')
    NEW_SEC_COUNT=$(wc -l < "$NEW_SECTIONS_FILE" | tr -d ' ')
    MISSING_HEADINGS=$(comm -23 <(sort -u "$OLD_SECTIONS_FILE") <(sort -u "$NEW_SECTIONS_FILE") 2>/dev/null | sed '/^$/d')
    if [ -n "$MISSING_HEADINGS" ] && [ "$NEW_SEC_COUNT" -lt "$OLD_SEC_COUNT" ]; then
      FIRST_MISSING=$(printf '%s\n' "$MISSING_HEADINGS" | head -1)
      fail "content regression [$key]: section/heading count dropped from $OLD_SEC_COUNT to $NEW_SEC_COUNT — e.g. missing '$FIRST_MISSING'"
    elif [ -n "$MISSING_HEADINGS" ]; then
      note "content [$key]: heading text changed vs baseline (section count steady at $NEW_SEC_COUNT, not a thinning regression)"
    else
      pass "content [$key]: section/heading list intact ($NEW_SEC_COUNT heading(s))"
    fi
  fi
done

# ===========================================================================
# SUMMARY
# ===========================================================================
section "SUMMARY"
echo "  $((PASS_COUNT + FAIL_COUNT)) check(s) evaluated: $PASS_COUNT passed, $FAIL_COUNT regressed."

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "  Result: PASS — no drift. Updating snapshot to this state."
  commit_snapshot
  exit 0
fi

echo "  Result: FAIL — $FAIL_COUNT regression(s) detected:"
printf '%s\n' "$FAILURE_LIST"

if [ "$ACK" -eq 1 ]; then
  echo
  echo "  --acknowledge passed: accepting the above as the new baseline."
  commit_snapshot
  exit 0
else
  echo
  echo "  Snapshot NOT updated — the regression(s) above stay visible on the"
  echo "  next run. Fix them, or re-run with --acknowledge to accept this"
  echo "  state as the new baseline on purpose."
  exit 1
fi
