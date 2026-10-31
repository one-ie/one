// Documents: the focused pane's folder, markdown only. Folders appear only when
// they hold markdown somewhere below; a click opens the file in the markdown viewer.
import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { spaces, panes, focused, exec, theme, run, nextCommand } from "herdr";

function location() {
  const space = spaces().find(s => s.active), f = focused();
  const pane = f?.pane ? panes().find(p => p.pane === f.pane) : null;
  const on = f?.pane === null ? (f.terminal?.includes("/") ? f.terminal.split("/")[0] : null) : space?.machine ?? null;
  return { cwd: pane?.cwd || f?.cwd || space?.folder, on, space: space?.id };
}
const key = () => JSON.stringify(location());
const TOTAL = 20000;
const SKIP = ["node_modules", ".git", "dist", "build", ".astro", ".wrangler", ".next", ".turbo", ".cache", "vendor"];

// Every markdown path under root, relative: git's view when it is a repo (ignored files stay out), else find.
// fsmonitor off: a repo's own config could name a program for git to run.
async function markdown(root, on) {
  const git = await exec("git", ["--no-optional-locks", "-c", "core.fsmonitor=false", "-c", "core.untrackedCache=false", "ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "*.md", "*.markdown", "*.mdx"], { cwd: root, on }).catch(() => null);
  if (git?.code === 0) return git.stdout.split("\0").filter(Boolean);
  const prune = SKIP.flatMap((n, i) => (i ? ["-o"] : []).concat(["-name", n]));
  const r = await exec("find", [".", "-maxdepth", "12", "(", ...prune, ")", "-prune", "-o", "-type", "f", "(", "-iname", "*.md", "-o", "-iname", "*.markdown", "-o", "-iname", "*.mdx", ")", "-print0"], { cwd: root, on });
  if (r.code !== 0 && !r.stdout) throw new Error(r.stderr || "Cannot list this folder");
  return r.stdout.split("\0").filter(Boolean).map(p => p.replace(/^\.\//, ""));
}

// status can run a clean filter, and a repo's own .git/config (an unpacked archive, a shared
// folder) can name one. Read-only check first: a repo that names one gets no marks, not a run.
// Filters from global/system config (git-lfs) are the user's own and stay.
async function safe(root, on) {
  const r = await exec("git", ["config", "--show-scope", "--includes", "--get-regexp", "^filter\\."], { cwd: root, on }).catch(() => null);
  if (!r || r.code > 1) return false;
  return !r.stdout.split("\n").some(l => /^(local|worktree)\s/.test(l));
}

// Changed markdown under root, relative to it: path → "M" | "A" | "D" | "U".
async function changes(root, on) {
  const prefix = await exec("git", ["rev-parse", "--show-prefix"], { cwd: root, on }).catch(() => null);
  if (prefix?.code !== 0 || !(await safe(root, on))) return {};
  // Writes nothing under .git (index lock, fsmonitor cookie); submodules would bring their own config.
  const r = await exec("git", ["--no-optional-locks", "-c", "core.fsmonitor=false", "status", "--porcelain=v1", "-z", "--no-renames", "--untracked-files=all", "--ignore-submodules=all", "--", "*.md", "*.markdown", "*.mdx"], { cwd: root, on }).catch(() => null);
  if (r?.code !== 0) return {};
  const strip = prefix.stdout.trim(), out = {};
  for (const entry of r.stdout.split("\0").filter(Boolean)) {
    const xy = entry.slice(0, 2), path = entry.slice(3);
    if (!path.startsWith(strip)) continue;
    out[path.slice(strip.length)] = xy === "??" || xy.includes("A") ? "A" : xy.includes("U") ? "U" : xy.includes("D") ? "D" : "M";
  }
  return out;
}
const tint = (t, mark) => mark === "A" ? t.ansi2 : mark === "D" || mark === "U" ? t.ansi1 : t.blocked;

// "" → { dirs: Set<name>, files: [name] }, one entry per folder that holds markdown.
function tree(paths) {
  const folders = new Map([["", { dirs: new Set(), files: [] }]]);
  const at = (path) => { let f = folders.get(path); if (!f) folders.set(path, f = { dirs: new Set(), files: [] }); return f; };
  for (const p of paths) {
    const parts = p.split("/"), name = parts.pop();
    let prefix = "";
    for (const part of parts) { at(prefix).dirs.add(part); prefix = prefix ? `${prefix}/${part}` : part; }
    at(prefix).files.push(name);
  }
  return folders;
}

export default class Documents extends View {
  init(_props, cx) {
    this.saved = new Map();
    this.folders = new Map(); this.open = new Set(); this.marks = {}; this.dirty = new Set();
    this.refresh(cx);
    // `herdr-app do documents.open:<relative path>` opens a document as if clicked
    cx.spawn(async (cx) => { for (;;) { const c = await nextCommand(); if (c.startsWith("open:")) this.pick(c.slice(5)); } });
    cx.timer.every(10000, cx => this.refresh(cx));
  }

  // A space switch resets at once, even mid-load (the old load drops its answer), and
  // each space keeps the folders it had open, as Files does.
  refresh(cx) {
    const { cwd, on } = location(), context = key();
    if (context !== this.context) {
      if (this.context) this.saved.set(this.context, this.open);
      this.context = context; this.root = cwd; this.on = on; this.folders = new Map(); this.open = new Set(this.saved.get(context)); this.error = null; this.count = 0; this.marks = {}; this.dirty = new Set(); this.limited = false; this.loading = null;
    }
    if (!cwd || this.loading === context) return;
    this.loading = context;
    cx.spawn(async cx => {
      try {
        const [paths, marks] = await Promise.all([markdown(cwd, on), changes(cwd, on)]);
        if (key() !== context || this.context !== context) return;
        // A folder is dirty when any changed document sits somewhere below it.
        const dirty = new Set();
        for (const p of Object.keys(marks)) for (let i = p.indexOf("/"); i > 0; i = p.indexOf("/", i + 1)) dirty.add(p.slice(0, i));
        this.marks = marks; this.dirty = dirty;
        this.limited = paths.length > TOTAL;
        this.count = Math.min(paths.length, TOTAL);
        this.folders = tree(paths.slice(0, TOTAL));
        this.error = null;
      } catch (e) { if (this.context === context) this.error = String(e); }
      finally { if (this.loading === context) this.loading = null; cx.notify(); }
    });
  }

  toggle(path, cx) {
    if (this.open.has(path)) { for (const p of [...this.open]) if (p === path || p.startsWith(path + "/")) this.open.delete(p); }
    else this.open.add(path);
    cx.notify();
  }

  // Into the markdown viewer, beside the tab's terminal (one viewer per tab).
  pick(path) {
    if (!this.root) return;
    const f = focused(), inTab = panes().filter((p) => p.tab === f?.tab);
    const target = inTab.find((p) => p.pane === f?.pane && p.terminal) ?? inTab.find((p) => p.terminal) ?? inTab[0];
    if (!target) return;
    for (const v of inTab.filter((p) => p.mod === "markdown")) run("pane.close", { pane: v.pane });
    run("pane.split", { pane: target.pane, direction: "right", mod: "markdown", props: { file: `${this.root}/${path}` } });
  }

  rows(prefix, depth, out, t) {
    const folder = this.folders.get(prefix);
    if (!folder || depth > 40) return out;
    const join = (name) => prefix ? `${prefix}/${name}` : name;
    for (const name of [...folder.dirs].sort((a, b) => a.localeCompare(b))) {
      const path = join(name), open = this.open.has(path), dirty = this.dirty.has(path);
      out.push(h_flex().id(`doc-dir-${path}`).h(28).flex_none().pl(8 + depth * 18).pr(8).gap(7).items_center().rounded(7).cursor_pointer().hover(s => s.bg(t.hover))
        .on_click((_e, cx) => this.toggle(path, cx))
        .child(svg(`mods/documents/chevron-${open ? "down" : "right"}.svg`).size(12).flex_none().text_color(t.dim))
        .child(svg("mods/documents/folder.svg").size(14).flex_none().text_color(dirty ? t.blocked : t.muted))
        .child(div().flex_1().min_w(0).truncate().when(dirty, el => el.text_color(t.blocked)).child(name))
        .when(dirty, el => el.child(div().size(6).flex_none().rounded_full().bg(t.blocked))));
      if (open) this.rows(path, depth + 1, out, t);
    }
    for (const name of [...folder.files].sort((a, b) => a.localeCompare(b))) {
      const path = join(name), mark = this.marks[path];
      out.push(h_flex().id(`doc-${path}`).h(28).flex_none().pl(8 + depth * 18).pr(8).gap(7).items_center().rounded(7).cursor_pointer().hover(s => s.bg(t.hover))
        .on_click(() => this.pick(path))
        .child(div().w(12).flex_none())
        .child(svg("mods/documents/file-text.svg").size(14).flex_none().text_color(mark ? tint(t, mark) : t.muted))
        .child(div().flex_1().min_w(0).truncate().when(Boolean(mark), el => el.text_color(tint(t, mark)).font_medium()).child(name.replace(/\.(md|markdown|mdx)$/i, "")))
        .when(Boolean(mark), el => el.child(div().text_size(11).text_color(tint(t, mark)).child(mark))));
    }
    return out;
  }

  render(cx) {
    if (key() !== this.context) this.refresh(cx);
    const t = theme(), empty = !this.folders.get("")?.dirs.size && !this.folders.get("")?.files.length;
    return v_flex().id("documents").size_full().min_h(0).rounded(10).overflow_hidden().bg(t.background).border_1().border_color(t.border).text_color(t.foreground).text_size(13)
      .child(h_flex().h(42).flex_none().px(14).gap(8).items_center().border_b(1).border_color(t.border)
        .child(div().font_semibold().child("Documents"))
        .child(div().flex_1().min_w(0).truncate().text_right().text_size(12).text_color(t.dim)
          .child(this.count ? `${this.count.toLocaleString()} · ${this.root?.split(/[\\/]/).pop() ?? ""}` : this.root?.split(/[\\/]/).pop() ?? ""))
        .when(Object.keys(this.marks).length > 0, el => el.child(div().px(6).py(0.5).rounded(5).bg(t.hover).text_size(11).text_color(t.blocked).child(`${Object.keys(this.marks).length} changed`))))
      .child(v_flex().id("documents-tree").flex_1().min_h(0).overflow_y_scrollbar().p(6).children(this.rows("", 0, [], t))
        .when(Boolean(this.error) || empty, el => el.child(div().p(8).text_size(12).text_color(t.dim).child(this.error || (this.loading ? "Finding documents…" : this.root ? "No markdown here" : "No folder"))))
        .when(this.limited, el => el.child(div().p(8).text_size(11).text_color(t.dim).child(`Showing the first ${TOTAL.toLocaleString()} documents`))));
  }
}
