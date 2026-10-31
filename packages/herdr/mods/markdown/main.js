// Markdown viewer. Same engine as one.ie's pages: marked 18 (gfm + breaks), frontmatter split
// the way one.ie/web/src/lib/markdown.ts does it. Two ways in:
//   - overlay (cmd-shift-m): pick a .md under the focused terminal's folder; it opens as a
//     pane beside the shell.
//   - pane: pane.split {direction: "right", mod: "markdown", props: {file: "/abs/path.md"}}.
// The pane reloads when the file changes. Links: http(s) open in the browser, relative .md
// links open in place (Back returns), the rest is ignored.

import { View, div } from "gpui-kit";
import { v_flex, h_flex, InputState, Input, TextView, Editor, EditorState } from "gpui-base";
import { props, run, exec, readTextFile, watchFolder, theme, focused, panes, spaces, closeOverlay, home, settings, appHome } from "herdr";
import { render } from "./render.mjs";

const dirname = (p) => p.slice(0, Math.max(0, p.lastIndexOf("/"))) || "/";
const basename = (p) => p.slice(p.lastIndexOf("/") + 1);
const LANG = { ts: "js", tsx: "js", typescript: "js", javascript: "js", mts: "js", jsx: "js", sh: "bash", shell: "bash", zsh: "bash", toml: "yaml", jsonc: "json", svelte: "html", astro: "html", tql: "txt", typeql: "txt" };
function location() {
  const space = spaces().find((s) => s.active), f = focused();
  const all = panes();
  const here = f?.pane ? all.find((p) => p.pane === f.pane) : null;
  // a mod pane has no folder: borrow the first terminal in its tab
  const sibling = here && !here.cwd ? all.find((p) => p.tab === here.tab && p.cwd) : null;
  return { cwd: here?.cwd || sibling?.cwd || f?.cwd || space?.folder, on: space?.machine ?? null };
}

export default class Markdown extends View {
  init(p, cx) {
    this.file = props()?.file ?? null;
    this.overlay = props()?.overlay ?? null;
    this.back = [];
    this.text = null;
    this.error = null;
    this.entries = [];
    this.filter = "";
    this.at = 0;
    this.handle = cx.focus_handle();
    this.input = InputState.new({ placeholder: "Find a markdown file…" });
    this.input.on("change", (_e, cx) => { this.filter = this.input.value().toLowerCase(); this.at = 0; cx.notify(); });
    this.input.on("submit", () => this.pick(this.matches()[this.at]));
    if (this.file) this.open(this.file, cx); else this.list(cx);
    if (!this.file) { this.input.focus(); cx.timer.after(600, () => this.input.focus()); }
  }

  // ---- picker
  list(cx) {
    const { cwd, on } = location();
    this.root = cwd;
    if (!cwd || cwd === home()) { this.error = "Open a terminal in a project folder first."; return; }
    cx.spawn(async (cx) => {
      try {
        const script = 'find "$1" -maxdepth 4 \\( -name node_modules -o -name .git -o -name .astro -o -name dist -o -name .release -o -name worktrees -o -name .do-worktrees \\) -prune -o -type f \\( -name "*.md" -o -name "*.markdown" -o -name "*.mdx" \\) -exec stat -f "%m %N" {} + 2>/dev/null | sort -rn | head -400';
        const r = await exec("sh", ["-c", script, "md", cwd], { on });
        this.entries = r.stdout.split("\n").filter(Boolean).map((l) => l.slice(l.indexOf(" ") + 1));
      } catch (e) { this.error = String(e?.message ?? e); }
      cx.notify();
    });
  }

  matches() {
    const f = this.filter;
    return (f ? this.entries.filter((p) => p.toLowerCase().includes(f)) : this.entries).slice(0, 100);
  }

  pick(path) {
    if (!path) return;
    if (this.overlay) {
      closeOverlay(this.overlay);
      run("pane.split", { direction: "right", mod: "markdown", props: { file: path } });
    } else {
      this.open(path, this.cx);
    }
  }

  // ---- viewer
  open(path, cx) {
    this.cx = cx;
    this.file = path;
    this.text = null;
    this.error = null;
    cx.spawn(async (cx) => {
      await this.load(cx, path);
      const dir = dirname(path);
      try {
        while (this.file && dirname(this.file) === dir) {
          await watchFolder(dir);
          if (this.file) await this.load(cx, this.file);
        }
      } catch {}
    });
    cx.notify();
  }

  // marked is far too slow inside Herdr's own JS engine (a large file stalls it, leaving a blank pane),
  // so render under Node (cli.mjs) and keep the in-engine render only as a fallback.
  async viaNode(path) {
    const cli = `${appHome()}/mods/markdown/cli.mjs`;
    for (const [cmd, args] of [["node", [cli, path]], ["zsh", ["-lc", 'node "$1" "$2"', "x", cli, path]]]) {
      try { const r = await exec(cmd, args); if (r.code === 0) return JSON.parse(r.stdout); } catch {}
    }
    return null;
  }

  async load(cx, path) {
    try {
      const on = location().on;
      const text = await readTextFile(path, { on });
      if (path !== this.file) return;
      if (text === null) this.error = "File not found.";
      else {
        const data = (!on && (await this.viaNode(path))) || render(text, path);
        if (path !== this.file) return;
        this.apply(data);
        this.text = text;
        this.error = null;
      }
    } catch (e) { this.error = String(e?.message ?? e); }
    cx.notify();
  }

  // blocks → views: prose is HTML for TextView, fenced code is a native highlighted Editor
  apply(data) {
    const t = theme();
    for (const b of this.blocks ?? []) b.code?.release?.();
    this.front = data.front;
    this.blocks = data.blocks.map((b) => b.html !== undefined ? { html: b.html } : {
      lines: b.value.split("\n").length,
      code: EditorState.new({
        language: LANG[b.lang] ?? b.lang, readonly: true, value: b.value,
        font_family: settings().font_family, font_size: 12,
        syntax: { keyword: t.ansi5, string: t.ansi2, comment: t.dim, function: t.ansi4, type: t.ansi3, number: t.ansi1, constant: t.ansi6 },
      }),
    });
  }

  link(url, cx) {
    if (/^(https?:|mailto:)/i.test(url)) { exec("open", [url]).catch(() => {}); return; }
    const rel = url.split("#")[0].split("?")[0];
    if (!rel || !/\.(md|markdown|mdx)$/i.test(rel)) return;
    const target = rel.startsWith("/") ? rel : tidy(dirname(this.file) + "/" + decodeURIComponent(rel));
    this.back.push(this.file);
    this.open(target, cx);
  }

  button(t, id, label, on) {
    return div().id(id).px(8).py(3).rounded(5).text_size(11.5).text_color(t.dim)
      .hover((s) => s.bg(t.hover).text_color(t.foreground)).on_click((_e, cx) => on(cx)).child(label);
  }

  // ---- render
  render(cx) {
    this.cx = cx;
    const t = theme();
    return this.file ? this.viewer(t, cx) : this.picker(t, cx);
  }

  viewer(t, cx) {
    const head = h_flex().h(34).flex_none().px(10).gap(6).items_center().border_b(1).border_color(t.border).bg(t.background).text_size(12)
      .when(this.back.length > 0, (el) => el.child(this.button(t, "md-back", "‹ Back", (cx) => this.open(this.back.pop(), cx))))
      .child(div().font_medium().text_color(t.foreground).flex_none().child(basename(this.file)))
      .child(div().flex_1().truncate().text_color(t.dim).child(dirname(this.file).replace(/^\/Users\/[^/]+/, "~")))
      .child(this.button(t, "md-open", "Open…", () => { this.file = null; this.text = null; this.filter = ""; this.input.set_value?.(""); this.list(cx); cx.notify(); }));
    const body = this.error
      ? div().p(16).text_color(t.dim).child(this.error)
      : this.text === null
        ? div().p(16).text_color(t.dim).child("Loading…")
        : v_flex().p(20).gap(8).max_w(820).text_size(13.5).text_color(t.foreground)
            .when(Object.keys(this.front ?? {}).length > 0, (el) => el.child(
              v_flex().pl(12).py(4).gap(2).border_l(2).border_color(t.border).text_size(12)
                .children(Object.entries(this.front).map(([k, v]) => h_flex().gap(10)
                  .child(div().w(90).flex_none().truncate().text_color(t.dim).child(k))
                  .child(div().flex_1().text_color(t.foreground).child(String(v)))))))
            .children((this.blocks ?? []).map((b, i) => b.html
              ? TextView.html(`md-${i}`, b.html).selectable(true).on_link_click((url, cx) => this.link(url, cx))
              : div().h(Math.min(520, b.lines * 19 + 18)).rounded(6).border_1().border_color(t.border).overflow_hidden()
                  .child(Editor.new(b.code).size_full())));
    return v_flex().size_full().bg(t.background)
      .child(head)
      .child(div().id("md-scroll").flex_1().min_h(0).overflow_y_scrollbar().child(body));
  }

  picker(t, cx) {
    const rows = this.matches();
    const at = Math.min(this.at, Math.max(0, rows.length - 1));
    const shown = (p) => p.startsWith(this.root + "/") ? p.slice(this.root.length + 1) : p;
    return v_flex().id("md-picker").track_focus(this.handle).size_full().p(18).gap(10).bg(t.popover).text_size(13)
      .on_key_down((e, cx) => {
        if (e.key === "escape") { if (this.overlay) closeOverlay(this.overlay); return; }
        if (e.key === "down") this.at = Math.min(rows.length - 1, at + 1);
        else if (e.key === "up") this.at = Math.max(0, at - 1);
        else return;
        cx.stop_propagation(); cx.notify();
      })
      .child(h_flex().items_center().child(div().flex_1().text_size(15).font_semibold().text_color(t.foreground).child("Open markdown")).child(div().text_size(11).text_color(t.dim).child("Esc")))
      .child(h_flex().h(36).flex_none().px(10).items_center().rounded(9).border_1().border_color(t.accent).bg(t.background)
        .child(Input.new(this.input).flex_1().h_full().text_size(12.8).text_color(t.foreground)))
      .child(this.error ? div().text_color(t.dim).child(this.error)
        : v_flex().when(Boolean(this.overlay), (el) => el.h(Math.min(380, 8 + Math.max(1, rows.length) * 30))).when(!this.overlay, (el) => el.flex_1()).min_h(0).overflow_y_scrollbar().children(rows.length
          ? rows.map((p, i) => div().id(`md-row-${i}`).px(10).py(6).rounded(6).truncate().text_size(12.5)
              .text_color(i === at ? t.foreground : t.dim).when(i === at, (el) => el.bg(t.hover))
              .hover((s) => s.bg(t.hover)).on_click(() => this.pick(p)).child(shown(p)))
          : [div().px(10).py(6).text_color(t.dim).child(this.entries.length ? "No match." : "Looking…")]));
  }
}
