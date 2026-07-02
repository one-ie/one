#!/usr/bin/env bash
# sync-licenses.sh — keep every package's LICENSE in sync with the root.
#
# npm pack only includes files inside a package's own directory, so a
# per-package LICENSE has to exist physically for the registry to show it —
# but that's no reason to hand-maintain 17 independent copies of a legal
# document. Root LICENSE is canonical; this script is the mirror.
#
# Usage:
#   sync-licenses.sh            # copy root LICENSE -> every package + create/ (fixes drift)
#   sync-licenses.sh --check    # report drift only, exit 1 if any (no writes) — wire into release.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 2

SRC=LICENSE
CHECK=false
[ "${1:-}" = "--check" ] && CHECK=true

drift=0
sync_one() {  # $1 = target path
  [ -f "$1" ] && diff -q "$SRC" "$1" >/dev/null 2>&1 && return 0
  drift=1
  if $CHECK; then
    echo "  DRIFT  $1"
  else
    cp "$SRC" "$1"
    echo "  synced $1"
  fi
}

sync_one create/LICENSE
for pkg in packages/*/; do
  sync_one "${pkg}LICENSE"
done

echo ""
if $CHECK; then
  [ "$drift" -eq 0 ] && { echo "license-check: OK — every package matches root LICENSE"; exit 0; }
  echo "license-check: DRIFT — run scripts/sync-licenses.sh to fix"; exit 1
fi
[ "$drift" -eq 0 ] && echo "license sync: already in sync" || echo "license sync: complete"
