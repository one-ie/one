#!/usr/bin/env bash
# seo-gate.sh — launch-gate checks from data/text/seo.md §10, as executable
# checks against a running site, not documentation. Treats the site as a
# black box: everything here is driven by curl against $1, never by reading
# repo source. See data/text/seo.md §0 WP-4 for the spec this implements.
#
# Usage: scripts/seo-gate.sh <base-url>
#   scripts/seo-gate.sh http://localhost:4321
#   scripts/seo-gate.sh https://one.ie
#
# Exit 0 only if every check that COULD run passed. Checks that gate on a
# feature not built yet (sitemap, JSON-LD) report SKIP, not FAIL, and do not
# affect the exit code — see the per-check comments for exactly which
# condition flips a SKIP into a hard FAIL once the feature exists.
set -u

BASE_URL="${1:-}"
if [ -z "$BASE_URL" ]; then
  echo "usage: $0 <base-url>" >&2
  echo "  e.g. $0 http://localhost:4321" >&2
  exit 2
fi
# Normalize: strip trailing slash so "$BASE_URL/path" never double-slashes.
BASE_URL="${BASE_URL%/}"

CURL_TIMEOUT=20
TMPDIR="$(mktemp -d "${TMPDIR:-/tmp}/seo-gate.XXXXXX")"
trap 'rm -rf "$TMPDIR"' EXIT

FAILURES=0
CHECKS=0

section() { printf '\n%s\n' "$1"; }
pass() { CHECKS=$((CHECKS + 1)); printf '  [PASS] %s\n' "$1"; }
fail() { CHECKS=$((CHECKS + 1)); FAILURES=$((FAILURES + 1)); printf '  [FAIL] %s\n' "$1"; }
skip() { printf '  [SKIP] %s\n' "$1"; }

have() { command -v "$1" >/dev/null 2>&1; }

if ! have curl; then
  echo "FATAL: curl not found — this script requires curl." >&2
  exit 2
fi
if ! have python3; then
  echo "FATAL: python3 not found — needed to parse HTML/JSON-LD/sitemap output." >&2
  exit 2
fi

echo "seo-gate.sh — checking $BASE_URL"
echo "(§10 launch-gate checklist, data/text/seo.md — green means verified on this URL, not \"code is in the repo\")"

# ---------------------------------------------------------------------------
# Preflight: can we reach the site at all? Everything below depends on this.
# ---------------------------------------------------------------------------
HOME_CODE=$(curl -s -o "$TMPDIR/home.html" -w '%{http_code}' --max-time "$CURL_TIMEOUT" "$BASE_URL/" 2>/dev/null || echo "000")
if [ "$HOME_CODE" = "000" ]; then
  echo
  echo "FATAL: could not reach $BASE_URL/ at all (curl exit != 0, no HTTP response)." >&2
  echo "Is the site running? (e.g. bun run preview)" >&2
  exit 2
fi

ROBOTS_CODE=$(curl -s -o "$TMPDIR/robots.txt" -w '%{http_code}' --max-time "$CURL_TIMEOUT" "$BASE_URL/robots.txt" 2>/dev/null || echo "000")
SITEMAP_URL="$BASE_URL/sitemap.xml"
SITEMAP_CODE=$(curl -s -o "$TMPDIR/sitemap.xml" -w '%{http_code}' --max-time "$CURL_TIMEOUT" "$SITEMAP_URL" 2>/dev/null || echo "000")

# ===========================================================================
# INDEXABILITY
# ===========================================================================
section "INDEXABILITY"

# --- Check 1: robots.txt has no blanket Disallow: / -------------------------
if [ "$ROBOTS_CODE" != "200" ]; then
  fail "robots.txt: expected HTTP 200 at $BASE_URL/robots.txt, got $ROBOTS_CODE"
else
  if grep -Eiq '^[[:space:]]*Disallow:[[:space:]]*/[[:space:]]*$' "$TMPDIR/robots.txt"; then
    fail "robots.txt: found a blanket 'Disallow: /' line — this de-indexes the whole site. Content:
$(sed 's/^/           /' "$TMPDIR/robots.txt")"
  else
    pass "robots.txt: no blanket 'Disallow: /' (HTTP 200, permissive)"
  fi
fi

# --- Check 2: robots.txt Sitemap: directive (only once a sitemap is live) --
# Graceful by design: if the sitemap doesn't exist yet (expected pre-WP-2/
# WP-6), this is a SKIP, not a FAIL. Once /sitemap.xml is confirmed live,
# a missing "Sitemap:" line in robots.txt becomes a hard FAIL.
if [ "$ROBOTS_CODE" != "200" ]; then
  skip "sitemap directive: robots.txt itself isn't reachable (see check above) — skipping"
elif [ "$SITEMAP_CODE" = "200" ]; then
  if grep -Eiq '^[[:space:]]*Sitemap:[[:space:]]*https?://' "$TMPDIR/robots.txt"; then
    SITEMAP_LINE=$(grep -Ei '^[[:space:]]*Sitemap:' "$TMPDIR/robots.txt" | head -1)
    pass "robots.txt: Sitemap: directive present ($SITEMAP_LINE)"
  else
    fail "robots.txt: $SITEMAP_URL is live (HTTP 200) but robots.txt has no 'Sitemap:' line — add it (WP-6)"
  fi
else
  skip "sitemap directive: $SITEMAP_URL not live yet (HTTP $SITEMAP_CODE) — deferred until the sitemap ships (WP-2/WP-6). Will hard-fail once it is live and the directive is still missing."
fi

# --- Check 3: no x-robots-tag: noindex header on / -------------------------
HOME_HEADERS=$(curl -sI --max-time "$CURL_TIMEOUT" "$BASE_URL/" 2>/dev/null)
if [ -z "$HOME_HEADERS" ]; then
  fail "curl -I $BASE_URL/ returned no headers at all"
else
  XROBOTS=$(printf '%s' "$HOME_HEADERS" | grep -i '^x-robots-tag:' | grep -i 'noindex')
  if [ -n "$XROBOTS" ]; then
    fail "curl -I $BASE_URL/ has an x-robots-tag: noindex header: $(printf '%s' "$XROBOTS" | tr -d '\r')"
  else
    pass "curl -I $BASE_URL/: no x-robots-tag: noindex header"
  fi
fi

# --- Check 4: no <meta name="robots" content="noindex..."> on / ------------
# NOTE: each python helper below is written to a temp .py file, then invoked
# as a plain argument (never a heredoc nested inside a $(...) command
# substitution) — this system's /bin/bash mis-tracks quote state when a
# heredoc body containing quotes sits inside $(...), even with a quoted
# 'PY' delimiter, and corrupts parsing of everything after it.
cat > "$TMPDIR/meta_noindex.py" <<'PY'
import re, sys
html = open(sys.argv[1], encoding="utf-8", errors="replace").read()
for tag in re.findall(r'<meta\b[^>]*>', html, re.I):
    if re.search(r'name=["\']robots["\']', tag, re.I) and re.search(r'content=["\'][^"\']*noindex', tag, re.I):
        print(tag)
        break
PY
META_NOINDEX=$(python3 "$TMPDIR/meta_noindex.py" "$TMPDIR/home.html")
if [ -n "$META_NOINDEX" ]; then
  fail "/ page source has a robots noindex meta tag: $META_NOINDEX"
else
  pass "/ page source: no <meta name=\"robots\" content=\"noindex...\">"
fi

# --- Check 5: garbage URL returns real 404, not a soft-404 200 -------------
# This is §9's single most important check — verify the ACTUAL status code,
# never the body content ("looks like a 404 page" is not the same as "is a
# 404 response").
GARBAGE_URL="$BASE_URL/definitely-not-a-real-page-xyz-123"
GARBAGE_CODE=$(curl -s -o "$TMPDIR/garbage.html" -w '%{http_code}' --max-time "$CURL_TIMEOUT" "$GARBAGE_URL" 2>/dev/null || echo "000")
if [ "$GARBAGE_CODE" = "404" ]; then
  pass "garbage URL ($GARBAGE_URL) correctly returns HTTP 404"
elif [ "$GARBAGE_CODE" = "200" ]; then
  if cmp -s "$TMPDIR/garbage.html" "$TMPDIR/home.html"; then
    fail "SOFT 404: $GARBAGE_URL returned HTTP 200 with body byte-identical to the homepage. §9: every broken URL is being served as the homepage — Google will index infinite soft-404 junk."
  else
    fail "SOFT 404: $GARBAGE_URL returned HTTP 200 (expected 404). Body differs from the homepage, but the status code is still wrong — search engines see this as a real, indexable 200 page."
  fi
else
  fail "garbage URL ($GARBAGE_URL) returned HTTP $GARBAGE_CODE (expected 404)"
fi

# --- Check 9 (grouped here per §10's INDEXABILITY block): AI crawlers not --
# blocked. Cloudflare ships a CDN-level "block AI bots" toggle that is
# invisible to robots.txt (§9) — the only way to verify the actual outcome
# is to fetch as that user-agent from outside and read the real status code.
GPTBOT_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time "$CURL_TIMEOUT" -A "GPTBot" "$BASE_URL/" 2>/dev/null || echo "000")
if [ "$GPTBOT_CODE" = "200" ]; then
  pass "GPTBot user-agent fetch of / returns HTTP 200 (not blocked)"
else
  fail "GPTBot user-agent fetch of / returned HTTP $GPTBOT_CODE (expected 200) — check robots.txt AND the Cloudflare dashboard 'block AI bots' toggle (CDN-level, invisible to this repo)"
fi

# ===========================================================================
# SITEMAP
# ===========================================================================
section "SITEMAP"

# --- Check 6: /sitemap.xml is 200 AND has > 0 <url> entries ----------------
# §9's "200-but-empty sitemap" killer: a naive "does it 200?" check passes
# while Google is handed nothing. Parse the actual entry count.
if [ "$SITEMAP_CODE" != "200" ]; then
  skip "/sitemap.xml not live yet (HTTP $SITEMAP_CODE) — deferred until it ships (WP-2). Will hard-fail (200-but-empty or non-200) once it exists."
else
  URL_COUNT=$(grep -o '<url>' "$TMPDIR/sitemap.xml" | wc -l | tr -d '[:space:]')
  # Fallback: some generators omit the plain <url> tag or use a namespace
  # prefix; also count <loc> as a sanity cross-check.
  LOC_COUNT=$(grep -o '<loc>' "$TMPDIR/sitemap.xml" | wc -l | tr -d '[:space:]')
  if [ "${URL_COUNT:-0}" -gt 0 ]; then
    pass "/sitemap.xml: HTTP 200, $URL_COUNT <url> entries (>0), $LOC_COUNT <loc> entries"
  else
    fail "/sitemap.xml returned HTTP 200 but contains 0 <url> entries (found $LOC_COUNT <loc> tags) — §9's '200-but-empty sitemap' killer, cost a real site 6 days of lost indexing"
  fi
fi

# ===========================================================================
# ASSETS (§9's "200-but-broken page" — HTML 200s, stylesheet is dead)
# ===========================================================================
section "ASSETS"

# --- Check 7: the primary CSS asset / actually links to returns 200 + ------
# text/css. Found dynamically by parsing the page source for a
# <link rel="stylesheet" href="..."> — never hardcode a filename, since the
# build hashes asset names. This site currently sets
# build.inlineStylesheets: 'always' in astro.config.mjs, which can mean
# there is no external stylesheet link at all (CSS is inlined as a <style>
# block) — in that case there is no network request that can silently die,
# so this check reports SKIP with the reason rather than failing on an
# absence that isn't a bug.
cat > "$TMPDIR/find_css.py" <<'PY'
import re, sys
from urllib.parse import urljoin
base, path = sys.argv[1], sys.argv[2]
html = open(path, encoding="utf-8", errors="replace").read()
found = None
for tag in re.findall(r'<link\b[^>]*>', html, re.I):
    if re.search(r'rel=["\'][^"\']*\bstylesheet\b[^"\']*["\']', tag, re.I):
        m = re.search(r'href=["\']([^"\']+)["\']', tag, re.I)
        if m:
            found = m.group(1)
            break
print(urljoin(base, found) if found else "")
PY
CSS_URL=$(python3 "$TMPDIR/find_css.py" "$BASE_URL/" "$TMPDIR/home.html")
if [ -z "$CSS_URL" ]; then
  skip "no external <link rel=\"stylesheet\"> found on / (site inlines CSS via astro.config.mjs build.inlineStylesheets:'always') — nothing external to verify. If this ever stops being fully inlined, this check will pick up the real asset URL automatically."
else
  CSS_CODE=$(curl -s -o /dev/null -D "$TMPDIR/css.headers" -w '%{http_code}' --max-time "$CURL_TIMEOUT" "$CSS_URL" 2>/dev/null || echo "000")
  CSS_CTYPE=$(grep -i '^content-type:' "$TMPDIR/css.headers" 2>/dev/null | tail -1 | cut -d: -f2- | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  if [ "$CSS_CODE" = "200" ] && printf '%s' "$CSS_CTYPE" | grep -qi 'text/css'; then
    pass "primary CSS asset ($CSS_URL): HTTP 200, content-type: $CSS_CTYPE"
  else
    fail "primary CSS asset ($CSS_URL): expected HTTP 200 + text/css, got HTTP $CSS_CODE, content-type: '${CSS_CTYPE:-<none>}' — §9's 200-but-broken-page killer: HTML serves fine but visitors get an unstyled page"
  fi
fi

# ===========================================================================
# SCHEMA
# ===========================================================================
section "SCHEMA"

# --- Check 8: JSON-LD on / parses as valid JSON -----------------------------
cat > "$TMPDIR/check_jsonld.py" <<'PY'
import re, sys, json
html = open(sys.argv[1], encoding="utf-8", errors="replace").read()
blocks = re.findall(
    r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    html, re.I | re.S,
)
if not blocks:
    print("NONE")
    sys.exit(0)
errors = []
node_count = 0
for i, b in enumerate(blocks):
    try:
        data = json.loads(b.strip())
        graph = data.get("@graph") if isinstance(data, dict) else None
        node_count += len(graph) if isinstance(graph, list) else 1
    except Exception as e:
        errors.append("block %d: %s" % (i, e))
if errors:
    print("INVALID:" + " | ".join(errors))
else:
    print("VALID:%d:%d" % (len(blocks), node_count))
PY
JSONLD_RESULT=$(python3 "$TMPDIR/check_jsonld.py" "$TMPDIR/home.html")
case "$JSONLD_RESULT" in
  NONE)
    skip "no <script type=\"application/ld+json\"> found on / yet — schema check deferred until it ships (WP-1). Will hard-fail on invalid JSON once present."
    ;;
  VALID:*)
    IFS=':' read -r _ nblocks nnodes <<<"$JSONLD_RESULT"
    pass "JSON-LD on /: $nblocks script block(s) parse as valid JSON ($nnodes graph node(s) total)"
    ;;
  INVALID:*)
    fail "JSON-LD on / failed to parse: ${JSONLD_RESULT#INVALID:}"
    ;;
  *)
    fail "JSON-LD check produced an unexpected result: $JSONLD_RESULT"
    ;;
esac

# ===========================================================================
# SUMMARY
# ===========================================================================
section "SUMMARY"
echo "  $CHECKS check(s) evaluated, $FAILURES failure(s)."
if [ "$FAILURES" -gt 0 ]; then
  echo "  Result: FAIL"
  exit 1
else
  echo "  Result: PASS"
  exit 0
fi
