#!/usr/bin/env bash
# ONE's Herdr, set up in one go: installs the Herdr app if it isn't there, adds the ONE layout
# (brand, Start panel, Documents, website icons on the spaces, changed files highlighted),
# makes the profile's spaces with Claude Code ready, and remembers where it came from so the
# window can say when a newer version exists.
#
#   bash install.sh                      everything, for this repo's profile
#   bash install.sh --no-spaces          everything except making spaces
#   bash install.sh --remove             take it all out again (kept in the backup)
#   bash install.sh pull                 developers: copy the live mods back into this folder
#   bash install.sh --self-test          prove it, in a throwaway Herdr home
#
# Safe to run again: it only replaces what changed, and never deletes anything: replaced
# files go to ~/.config/herdr-app/.one-pack-backup/<time>/ first.
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOME_DIR="${HERDR_APP_HOME:-$HOME/.config/herdr-app}"
HERDR="${HERDR_APP_BIN:-$(command -v herdr-app || echo "$HOME/.local/bin/herdr-app")}"
MODS=(one-brand spaces-one one-start tabs-one documents files-md markdown)
LAYOUT=one
# spaces-one is cloned from Herdr 0.1.10's spaces; older Herdr may not run it.
HERDR_MIN=0.1.10
VERSION="$(cat "$HERE/VERSION" 2>/dev/null || echo 0.0.0)"
BACKUP="$HOME_DIR/.one-pack-backup/$(date +%Y%m%d-%H%M%S)"
# Files the installer writes per person: never compared, never pulled back.
WRITTEN=(one-brand/brand.json one-brand/source.json spaces-one/icons.json one-start/start.json)
SKIP=(-x gpui-kit.d.ts -x jsconfig.json -x '.*' -x brand.json -x source.json -x icons.json -x start.json)

PROFILE="" SPACES_ON=1 REMOVE=0 REPO="" MODE=install
while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="${2:-}"; shift ;;
    --profile=*) PROFILE="${1#--profile=}" ;;
    --repo) REPO="${2:-}"; shift ;;
    --repo=*) REPO="${1#--repo=}" ;;
    --no-spaces) SPACES_ON=0 ;;
    --remove) REMOVE=1 ;;
    pull) MODE=pull ;;
    --self-test) MODE=self-test ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) echo "unknown option: $1 (try --help)"; exit 2 ;;
  esac
  shift
done

# ── --self-test: every promise of this script, in a throwaway home ───────────────
if [ "$MODE" = self-test ]; then
  T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
  fails=0
  ok() { printf '  ok    %s\n' "$1"; }
  no() { printf '  FAIL  %s\n' "$1"; fails=$((fails+1)); }
  run() { HERDR_APP_HOME="$T/home" HERDR_NO_APP=1 HERDR_NO_WINDOW=1 "${BASH:-bash}" "$@"; }
  mkdir -p "$T/home/mods" "$T/repo/site"
  [ -x "$(command -v herdr-app)" ] || { echo "herdr-app is not installed: cannot run the checks"; exit 3; }

  out="$(run "$HERE/install.sh" --profile one --repo "$T/repo" 2>&1)"; rc=$?
  [ $rc = 0 ] && ok "first install exits 0" || { no "first install exited $rc"; printf '%s\n' "$out"; }
  n=0; for m in "${MODS[@]}"; do [ -f "$T/home/mods/$m/main.js" ] && n=$((n+1)); done
  [ $n = ${#MODS[@]} ] && ok "all ${#MODS[@]} mods installed" || no "only $n of ${#MODS[@]} mods installed"
  grep -q "all ${#MODS[@]} mods pass herdr-app check" <<<"$out" && ok "herdr-app check passes on every mod" || no "herdr-app check did not pass on every mod"
  [ -f "$T/home/layouts/$LAYOUT.json" ] && ok "layout $LAYOUT installed" || no "layout $LAYOUT missing"
  [ ! -e "$T/home/mods/one-brand/brand.json" ] && ok "one profile keeps ONE's own mark (no brand.json)" || no "brand.json should not exist for ONE"
  icons="$(cat "$T/home/mods/spaces-one/icons.json" 2>/dev/null)"
  if node -e '
    const m = JSON.parse(process.argv[1]), home = process.argv[2], repo = process.argv[3], fs = require("fs");
    const want = { [repo]: "one.svg" };
    for (const [f, n] of Object.entries(want)) if (!m[f] || !m[f].icon.endsWith(n) || !fs.existsSync(home + "/" + m[f].icon)) process.exit(1);
  ' "$icons" "$T/home" "$(cd "$T/repo" && pwd -P)"; then ok "icons.json maps the repo folder, absolute, to a file that exists"; else no "icons.json wrong: $icons"; fi
  node -e 'const s=JSON.parse(require("fs").readFileSync(process.argv[1]));process.exit(Array.isArray(s)&&s.length>=3?0:1)' "$T/home/mods/one-start/start.json" 2>/dev/null \
    && ok "Start prompts written" || no "start.json missing or short"
  node -e 'const s=JSON.parse(require("fs").readFileSync(process.argv[1]));process.exit(s.version===process.argv[2]&&s.profile==="one"&&s.repo.startsWith("/")?0:1)' "$T/home/mods/one-brand/source.json" "$VERSION" 2>/dev/null \
    && ok "source.json names the repo, profile and version $VERSION" || no "source.json wrong"
  grep -q '"cmd-shift-m"' "$T/home/keys.json" 2>/dev/null && ok "markdown key added" || no "keys.json has no cmd-shift-m"

  out2="$(run "$HERE/install.sh" --profile one --repo "$T/repo" 2>&1)"
  up="$(grep -c 'up to date' <<<"$out2")"
  [ "$up" = "${#MODS[@]}" ] && ok "second run: all ${#MODS[@]} mods up to date" || no "second run: $up of ${#MODS[@]} up to date"
  [ "$(ls "$T/home/.one-pack-backup" 2>/dev/null | wc -l | tr -d ' ')" = 0 ] && ok "second run backs nothing up" || no "second run made a backup"

  echo "// edited" >> "$T/home/mods/documents/main.js"
  sleep 1
  run "$HERE/install.sh" --profile one --repo "$T/repo" >/dev/null 2>&1
  cmp -s "$HERE/mods/documents/main.js" "$T/home/mods/documents/main.js" && ok "an edited mod is put back" || no "edited mod not restored"
  grep -rq '// edited' "$T/home/.one-pack-backup" 2>/dev/null && ok "the edit is kept in the backup" || no "the edit was lost"

  # red half: a broken mod must fail the install, not pass it
  cp -R "$HERE" "$T/broken"; echo 'export default class {' > "$T/broken/mods/one-start/main.js"
  HERDR_APP_HOME="$T/home2" HERDR_NO_APP=1 HERDR_NO_WINDOW=1 bash "$T/broken/install.sh" --profile one --repo "$T/repo" >"$T/broken.log" 2>&1; rc=$?
  [ $rc = 4 ] && grep -q 'check FAILED: mods/one-start' "$T/broken.log" && ok "a broken mod fails the install (exit 4)" || no "a broken mod was not caught (exit $rc)"
  [ -z "$(ls "$T/home2/mods" 2>/dev/null)" ] && [ ! -e "$T/home2/layouts/$LAYOUT.json" ] && ok "a failed check installs nothing (no mods, no layout)" || no "a failed check still installed files"

  run "$HERE/install.sh" --remove >/dev/null 2>&1
  left=0; for m in "${MODS[@]}"; do [ -e "$T/home/mods/$m" ] && left=$((left+1)); done
  [ $left = 0 ] && [ ! -e "$T/home/layouts/$LAYOUT.json" ] && ok "--remove takes every mod and the layout out" || no "--remove left $left mods"

  [ $fails = 0 ] && { echo "self-test: all checks pass"; exit 0; }
  echo "self-test: $fails check(s) failed"; exit 1
fi

say() { printf '  %s\n' "$*"; }
running() { [ -z "${HERDR_NO_WINDOW:-}" ] && [ -x "$HERDR" ] && "$HERDR" status >/dev/null 2>&1; }
app_path() { for a in "$HOME/Applications/Herdr.app" /Applications/Herdr.app; do [ -d "$a" ] && { echo "$a"; return; }; done; }
aside() {
  local rel="$1"
  [ -e "$HOME_DIR/$rel" ] || return 0
  mkdir -p "$BACKUP/$(dirname "$rel")"
  mv "$HOME_DIR/$rel" "$BACKUP/$rel"
}
# Write a file only when its content changes, so a second run changes nothing.
put() { local f="$1" body="$2"; [ -f "$f" ] && [ "$(cat "$f")" = "$body" ] && return 1; mkdir -p "$(dirname "$f")"; printf '%s\n' "$body" > "$f"; }

# ── pull: developers copy the live mods back here after editing them in Herdr ────
if [ "$MODE" = pull ]; then
  for m in "${MODS[@]}"; do
    rsync -a --delete --exclude gpui-kit.d.ts --exclude jsconfig.json --exclude '.*' \
      --exclude brand.json --exclude source.json --exclude icons.json --exclude start.json \
      "$HOME_DIR/mods/$m/" "$HERE/mods/$m/"
  done
  cp "$HOME_DIR/layouts/$LAYOUT.json" "$HERE/layouts/$LAYOUT.json"
  echo "pulled ${MODS[*]} + layouts/$LAYOUT.json from $HOME_DIR"
  exit 0
fi

if [ "$REMOVE" = 1 ]; then
  running && "$HERDR" do layout.switch '{"name":"main"}' >/dev/null
  for m in "${MODS[@]}"; do aside "mods/$m"; done
  aside "layouts/$LAYOUT.json"
  echo "Removed. Herdr is back on its main layout; your spaces stay. The removed files are in $BACKUP"
  exit 0
fi

# The profile: the flag, else the one this copy was made for (`profile`), else ONE.
[ -z "$PROFILE" ] && PROFILE="$(cat "$HERE/profile" 2>/dev/null || echo one)"
PJSON="$HERE/profiles/$PROFILE.json"
[ -f "$PJSON" ] || { echo "no profile '$PROFILE' (profiles/: $(ls "$HERE/profiles" | sed 's/\.json//' | tr '\n' ' '))"; exit 2; }
# The repo the spaces and the updates come from: the main checkout, even when this runs from a worktree.
if [ -z "$REPO" ]; then
  common="$(git -C "$HERE" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
  REPO="${common:+$(dirname "$common")}"
  REPO="${REPO:-$(cd "$HERE/.." && pwd)}"
fi
REPO="$(cd "$REPO" && pwd -P)" || { echo "no repo at $REPO"; exit 2; }
# Where this folder sits in the repo (herdr, packages/herdr). An update runs from a temp
# copy outside the repo, so then it keeps the answer the last install wrote.
# git's own prefix first: a worktree inside the main checkout would otherwise read as
# .claude/worktrees/<x>/packages/herdr.
DIR="$(git -C "$HERE" rev-parse --show-prefix 2>/dev/null)"; DIR="${DIR%/}"
[ -z "$DIR" ] && DIR="$(cd "$HERE" && pwd -P)"
case "$DIR" in
  [!/]*) ;;
  "$REPO"/*) DIR="${DIR#"$REPO"/}" ;;
  *) DIR="$(node -e 'try{process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1])).dir||"")}catch{}' "$HOME_DIR/mods/one-brand/source.json")"
     DIR="${DIR:-herdr}" ;;
esac
command -v node >/dev/null 2>&1 || { echo "This needs node for a moment (brew install node), then run it again."; exit 2; }

# 1. The app ---------------------------------------------------------------------
echo "1/4 Herdr"
if [ -n "${HERDR_NO_APP:-}" ]; then
  say "skipped (HERDR_NO_APP)"
elif [ -z "$(app_path)" ]; then
  [ "$(uname -s)" = Darwin ] || { echo "This sets up the Mac app. On Linux: curl -fsSL https://releases.herdr.dev/app/install.sh | sh, then run this again."; exit 1; }
  [ "$(uname -m)" = arm64 ] || { echo "Herdr's Mac app needs an Apple Silicon Mac (M1 or newer); this one is Intel ($(uname -m)). Nothing was changed."; exit 1; }
  say "not installed yet: installing it with Herdr's own installer (checksum-verified)"
  curl -fsSL https://releases.herdr.dev/app/install.sh | sh || { echo "Herdr's installer failed; nothing else was changed."; exit 1; }
  HERDR="${HERDR_APP_BIN:-$HOME/.local/bin/herdr-app}"
else
  say "installed at $(app_path)"
fi
if [ -z "${HERDR_NO_APP:-}" ] && ! running && [ -n "$(app_path)" ]; then
  say "opening Herdr"
  open "$(app_path)"
  for _ in $(seq 1 60); do running && break; sleep 1; done
  running || say "Herdr is taking its time to open: the layout still installs, and Herdr picks it up when it starts"
fi
mkdir -p "$HOME_DIR/mods" "$HOME_DIR/layouts" || { echo "can't write $HOME_DIR"; exit 1; }

# 2. Check every mod first, in a staging home: the person's window is only touched once
#    all of them pass, so a mod that fails on their Herdr leaves their layout as it was.
echo "2/4 Checks"
if [ -x "$HERDR" ]; then
  have_v="$("$HERDR" --version 2>/dev/null | awk '{print $NF}')"
  if [ -n "$have_v" ] && ! node -e 'const [a,b]=process.argv.slice(1).map(v=>v.split(".").map(Number));for(let i=0;i<3;i++){if((a[i]||0)!==(b[i]||0))process.exit((a[i]||0)>(b[i]||0)?0:1)}' "$have_v" "$HERDR_MIN"; then
    echo "This needs Herdr $HERDR_MIN or newer; you have $have_v. Update Herdr (it offers updates itself, or reinstall from herdr.dev), then run this again. Nothing was changed."
    exit 5
  fi
  STAGE="$(mktemp -d)"; mkdir -p "$STAGE/mods"
  failed=0
  for m in "${MODS[@]}"; do
    cp -R "$HERE/mods/$m" "$STAGE/mods/$m"
    HERDR_APP_HOME="$STAGE" "$HERDR" check "$STAGE/mods/$m" >/dev/null 2>&1 \
      || { echo "  check FAILED: mods/$m"; HERDR_APP_HOME="$STAGE" "$HERDR" check "$STAGE/mods/$m"; failed=1; }
  done
  rm -rf "$STAGE"
  [ "$failed" = 0 ] || { echo "A mod failed its check, so nothing was installed: your window is as it was. Tell whoever sent you this."; exit 4; }
  say "all ${#MODS[@]} mods pass herdr-app check${have_v:+ (Herdr $have_v)}"
else
  say "herdr-app not found, checks skipped"
fi

# 3. The layout and its mods -------------------------------------------------------
echo "3/4 The ONE layout ($PROFILE, $VERSION)"
for m in "${MODS[@]}"; do
  if [ -d "$HOME_DIR/mods/$m" ] && diff -rq "${SKIP[@]}" "$HERE/mods/$m" "$HOME_DIR/mods/$m" >/dev/null 2>&1; then
    say "mods/$m  up to date"; continue
  fi
  [ -d "$HOME_DIR/mods/$m" ] && say "mods/$m  updated (old copy kept in the backup)" || say "mods/$m  added"
  keep="$(mktemp -d)"
  for w in "${WRITTEN[@]}"; do case "$w" in "$m"/*) [ -f "$HOME_DIR/mods/$w" ] && cp "$HOME_DIR/mods/$w" "$keep/";; esac; done
  aside "mods/$m"
  cp -R "$HERE/mods/$m" "$HOME_DIR/mods/$m"
  cp "$keep"/* "$HOME_DIR/mods/$m/" 2>/dev/null; rm -rf "$keep"
done
if ! cmp -s "$HERE/layouts/$LAYOUT.json" "$HOME_DIR/layouts/$LAYOUT.json"; then
  aside "layouts/$LAYOUT.json"
  cp "$HERE/layouts/$LAYOUT.json" "$HOME_DIR/layouts/$LAYOUT.json"
  say "layouts/$LAYOUT.json  installed"
fi

# What this person gets: brand, icons, Start prompts, where updates come from. node builds
# them from the profile; each file is written only when it changes.
gen="$(node -e '
  const fs = require("fs"), path = require("path");
  const [pjson, repo, dir, version] = process.argv.slice(1);
  const p = JSON.parse(fs.readFileSync(pjson, "utf8"));
  const abs = (f) => { const a = path.resolve(repo, f); try { return fs.realpathSync(a); } catch { return null; } };
  const icons = {};
  for (const s of [...(p.spaces ?? []), ...(p.icons ?? [])]) { const a = abs(s.folder); if (a) icons[a] = { icon: s.icon, tint: s.tint === true }; }
  const brand = p.brand;
  const out = {
    brand: brand ? JSON.stringify(brand) : "",
    icons: JSON.stringify(icons, null, 2),
    start: JSON.stringify(p.start ?? [], null, 2),
    source: JSON.stringify({ repo, dir, branch: p.branch ?? "main", profile: p.name, version }, null, 2),
    spaces: (p.spaces ?? []).map((s) => [s.name, abs(s.folder) ?? ""].join("\t")).join("\n"),
  };
  process.stdout.write(JSON.stringify(out));
' "$PJSON" "$REPO" "$DIR" "$VERSION")" || { echo "couldn't read profiles/$PROFILE.json"; exit 2; }
field() { node -e 'process.stdout.write(JSON.parse(process.argv[1])[process.argv[2]])' "$gen" "$1"; }
b="$(field brand)"
if [ -n "$b" ]; then put "$HOME_DIR/mods/one-brand/brand.json" "$b" && say "brand: $(node -e 'console.log(JSON.parse(process.argv[1]).name)' "$b")"
elif [ -f "$HOME_DIR/mods/one-brand/brand.json" ]; then rm -f "$HOME_DIR/mods/one-brand/brand.json"; say "brand: ONE"; fi
put "$HOME_DIR/mods/spaces-one/icons.json" "$(field icons)" && say "space icons: $(node -e 'console.log(Object.keys(JSON.parse(process.argv[1])).length)' "$(field icons)") folders"
put "$HOME_DIR/mods/one-start/start.json" "$(field start)" && say "Start: $(node -e 'console.log(JSON.parse(process.argv[1]).length)' "$(field start)") buttons"
put "$HOME_DIR/mods/one-brand/source.json" "$(field source)" && say "updates: from $REPO ($DIR, $VERSION)"

# cmd-shift-m opens the markdown picker, unless that key is already taken.
node -e '
  const fs = require("fs"), p = process.argv[1];
  const keys = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {};
  keys.global ??= {};
  if (keys.global["cmd-shift-m"]) process.exit(0);
  keys.global["cmd-shift-m"] = "mod.open:markdown";
  fs.writeFileSync(p, JSON.stringify(keys, null, 2) + "\n");
  console.log("  keys: cmd-shift-m opens the markdown picker");
' "$HOME_DIR/keys.json"

# 4. Switch the window over and make the spaces ------------------------------------
echo "4/4 Window and spaces"
if running; then
  "$HERDR" do layout.switch "{\"name\":\"$LAYOUT\"}" >/dev/null && say "switched the window to the ONE layout"
  if [ "$SPACES_ON" = 1 ]; then
    have="$("$HERDR" ls 2>/dev/null)"
    agent=""; command -v claude >/dev/null 2>&1 && agent=',"tab":"claude","argv":["claude"]'
    while IFS="$(printf '\t')" read -r name folder; do
      [ -z "$name" ] && continue
      if [ -z "$folder" ]; then say "space $name: its folder isn't here, skipped"; continue; fi
      if grep -q "\"folder\": \"$folder\"" <<<"$have"; then say "space $name: already there"; continue; fi
      "$HERDR" do space.new "$(node -e 'const [n,f,a]=process.argv.slice(1);console.log(JSON.stringify({name:n,folder:f,...(a?{tab:"claude",argv:["claude"]}:{})}))' "$name" "$folder" "$agent")" >/dev/null \
        && say "space $name: made, in $folder${agent:+, with Claude Code}"
    done <<<"$(field spaces)"
  fi
else
  say "Herdr isn't open: open it and press ctrl-shift-l until the ONE layout shows, then run this again for the spaces"
fi
[ -d "$BACKUP" ] && say "replaced files kept in $BACKUP"
echo "Done: ONE layout $VERSION."
exit 0
