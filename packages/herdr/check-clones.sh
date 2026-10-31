#!/usr/bin/env bash
# Which of ONE's mods are clones of a Herdr mod that Herdr has since changed.
# Each clone carries clone.json: { from, herdr, files } where files are the hashes Herdr's
# installed.json held for the original when it was cloned. A Herdr update that changes the
# original changes those hashes, and this names the clone, so the update is merged on
# purpose instead of drifting.
#
#   bash check-clones.sh              compare with this Mac's Herdr (exit 1 when any moved)
#   bash check-clones.sh --self-test  prove it on fixtures (goes red on a moved original)
#
# Exit: 0 every clone matches its original · 1 one moved or has no recorded base · 3 no Herdr here.
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

check() { # $1 = mods dir, $2 = installed.json
  [ -f "$2" ] || { echo "no Herdr installed.json at $2"; return 3; }
  node -e '
    const fs = require("fs"), path = require("path");
    const [mods, inst] = process.argv.slice(1);
    const installed = JSON.parse(fs.readFileSync(inst, "utf8"));
    let bad = 0, n = 0;
    for (const m of fs.readdirSync(mods).sort()) {
      const f = path.join(mods, m, "clone.json");
      if (!fs.existsSync(f)) continue;
      n++;
      const c = JSON.parse(fs.readFileSync(f, "utf8"));
      const now = installed[c.from];
      if (!now) { console.log(`gone     ${m}: Herdr no longer ships ${c.from}`); bad++; continue; }
      if (!c.files) { console.log(`no base  ${m}: cloned from ${c.from} ${c.herdr} before bases were kept; review against the current ${c.from}, then record its hashes`); bad++; continue; }
      const moved = [...new Set([...Object.keys(c.files), ...Object.keys(now)])].filter((k) => c.files[k] !== now[k]);
      if (moved.length) { console.log(`moved    ${m}: Herdr changed ${c.from} since ${c.herdr} (${moved.join(", ")})`); bad++; }
      else console.log(`ok       ${m}: matches ${c.from} ${c.herdr}`);
    }
    console.log(`${n - bad} of ${n} clones match their Herdr original`);
    process.exit(bad ? 1 : 0);
  ' "$1" "$2"
}

if [ "${1:-}" = --self-test ]; then
  T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
  mkdir -p "$T/mods/a" "$T/mods/b" "$T/mods/plain"
  echo '{"from":"spaces","herdr":"0.1.10","files":{"main.js":"aa","mod.json":"bb"}}' > "$T/mods/a/clone.json"
  echo '{"from":"tabs","herdr":"0.1.10","files":{"main.js":"cc"}}' > "$T/mods/b/clone.json"
  echo '{"spaces":{"main.js":"aa","mod.json":"bb"},"tabs":{"main.js":"cc"}}' > "$T/same.json"
  echo '{"spaces":{"main.js":"aa","mod.json":"bb"},"tabs":{"main.js":"cc","win-min.svg":"dd"}}' > "$T/moved.json"
  fails=0
  check "$T/mods" "$T/same.json" >/dev/null; [ $? = 0 ] && echo "  ok    matching originals exit 0" || { echo "  FAIL  matching originals"; fails=$((fails+1)); }
  out="$(check "$T/mods" "$T/moved.json")"; rc=$?
  [ $rc = 1 ] && grep -q 'moved    b:.*win-min.svg' <<<"$out" && echo "  ok    a moved original (a new file) exits 1 and names it" || { echo "  FAIL  moved original not caught: $out"; fails=$((fails+1)); }
  echo '{"from":"tabs","herdr":"0.1.9","files":null}' > "$T/mods/b/clone.json"
  check "$T/mods" "$T/same.json" >/dev/null; [ $? = 1 ] && echo "  ok    a clone with no recorded base exits 1" || { echo "  FAIL  no-base clone passed"; fails=$((fails+1)); }
  check "$T/mods" "$T/nothing.json" >/dev/null; [ $? = 3 ] && echo "  ok    no Herdr exits 3, not 1" || { echo "  FAIL  missing Herdr not exit 3"; fails=$((fails+1)); }
  [ $fails = 0 ] && { echo "self-test: all checks pass"; exit 0; }
  echo "self-test: $fails check(s) failed"; exit 1
fi

check "$HERE/mods" "${HERDR_APP_HOME:-$HOME/.config/herdr-app}/installed.json"
