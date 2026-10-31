// Is there a newer ONE layout, and the tab that installs it. Pure: no herdr imports,
// so tests import it. source.json (written by install.sh):
//   { "repo": "/Users/me/one", "dir": "packages/herdr", "branch": "main", "profile": "one", "version": "0.2.0" }

const parts = (v) => String(v ?? "").trim().split(".").map((n) => Number.parseInt(n, 10));

// true when `remote` is a higher dotted version than `local` (0.2.10 > 0.2.9).
export function newer(remote, local) {
  const a = parts(remote), b = parts(local);
  if (a.some(Number.isNaN) || b.some(Number.isNaN)) return false;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0, y = b[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

export function validSource(raw) {
  const ok = (s) => typeof s === "string" && s.length > 0;
  if (!raw || !ok(raw.repo) || !raw.repo.startsWith("/") || !ok(raw.dir) || !ok(raw.branch) || !ok(raw.version)) return null;
  if (!/^[\w./-]+$/.test(raw.dir) || raw.dir.includes("..") || !/^[\w./-]+$/.test(raw.branch)) return null;
  if (!/^(one|vespio)$/.test(raw.profile ?? "one")) return null;
  return { repo: raw.repo, dir: raw.dir, branch: raw.branch, profile: raw.profile ?? "one", version: raw.version };
}

const q = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;

// The shell line that installs origin's copy, from a git archive into a temp folder,
// so the person's own checkout (and anything they changed in it) is never touched.
export function updateCommand(src) {
  const at = `origin/${src.branch}`;
  return [
    "set -e",
    `git -C ${q(src.repo)} fetch --quiet origin ${q(src.branch)}`,
    'd="$(mktemp -d)"',
    `git -C ${q(src.repo)} archive ${q(at)} ${q(src.dir)} | tar -x -C "$d"`,
    `bash "$d"/${q(src.dir)}/install.sh --profile ${q(src.profile)} --repo ${q(src.repo)}`,
    'echo; echo "Updated. You can close this tab."',
  ].join("\n");
}

// The tab.new arguments for the Update button and the toast.
export function updateTab(src) {
  return { name: "Update ONE", folder: src.repo, argv: ["bash", "-lc", updateCommand(src)] };
}

// The two git reads the brand row makes: fetch, then the VERSION origin carries.
export function remoteVersionArgs(src) {
  return {
    fetch: ["-C", src.repo, "fetch", "--quiet", "origin", src.branch],
    show: ["-C", src.repo, "show", `origin/${src.branch}:${src.dir}/VERSION`],
  };
}
