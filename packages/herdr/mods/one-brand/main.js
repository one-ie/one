// The sidebar's brand row with ONE's mark in place of Herdr's: same search and
// sidebar buttons as workspace-chrome, so it swaps into the layout's "brand" block.
// brand.json beside this file picks the mark: { "name": "Mine", "logo": "brands/mine.svg", "tint": false }.
// No brand.json (or a broken one) is ONE. Saving it reloads the row.
// brands/one.svg is https://one.ie/favicon.svg.
// It also watches for a newer ONE layout: source.json (written by install.sh) names the repo
// it came from; when origin carries a higher VERSION the row shows Update and a toast, and
// either opens a tab that installs origin's copy without touching the checkout (./update.js).
import { View, div, svg, image } from "gpui-kit";
import { h_flex } from "gpui-base";
import { theme, run, window, shared, setShared, layout, appHome, readTextFile, exec, notify } from "herdr";
import { newer, remoteVersionArgs, updateTab, validSource } from "./update.js";

const EVERY = 6 * 60 * 60 * 1000;

const ONE = { name: "ONE", logo: "brands/one.svg", tint: true };

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

const narrow = () => (find(layout(), "sidebar")?.size?.px ?? Infinity) < 160;

function toggleSidebar() {
  const width = find(layout(), "sidebar")?.size?.px;
  if (!narrow()) setShared("sidebar.width", width);
  setShared("sidebar.collapsed", !narrow());
  run("layout.resize", { id: "sidebar", px: narrow() ? (shared("sidebar.width") ?? 268) : window()?.platform === "macos" ? 76 : 44 });
}

export default class OneBrand extends View {
  init(_props, cx) {
    this.brand = ONE;
    cx.spawn(async (cx) => {
      try {
        const b = JSON.parse(await readTextFile(`${appHome()}/mods/one-brand/brand.json`) ?? "null");
        // Only a logo inside this mod's own brands/ folder: brand.json never reaches elsewhere.
        if (b && typeof b.name === "string" && /^brands\/[\w.-]+\.(svg|png)$/.test(b.logo ?? "")) this.brand = { ...ONE, ...b };
      } catch {}
      cx.notify();
    });
    cx.spawn(async (cx) => {
      try { this.source = validSource(JSON.parse(await readTextFile(`${appHome()}/mods/one-brand/source.json`) ?? "null")); } catch {}
      if (this.source) await this.checkUpdate(cx);
    });
    cx.timer.every(EVERY, (cx) => cx.spawn(async (cx) => this.checkUpdate(cx)));
  }
  async checkUpdate(cx) {
    const src = this.source;
    if (!src) return;
    try {
      const reads = remoteVersionArgs(src);
      await exec("git", reads.fetch);
      const r = await exec("git", reads.show);
      const remote = r.stdout?.trim();
      if (r.code !== 0 || !newer(remote, src.version)) return;
      this.update = remote;
      if (localStorage.getItem("told") !== remote) {
        localStorage.setItem("told", remote);
        notify({ title: `ONE layout ${remote} is ready`, body: `You have ${src.version}. Click to update: it takes a few seconds and keeps your spaces.`, level: "info", timeout: 30000, action: { name: "tab.new", args: updateTab(src) } });
      }
      cx.notify();
    } catch {}
  }
  button(id, label, action) {
    const t = theme();
    return div().id(id).size(26).flex_none().flex().items_center().justify_center().rounded(6).text_color(t.muted).hover(s => s.bg(t.hover).text_color(t.foreground))
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation()).on_click(action).child(label);
  }
  render() {
    const t = theme();
    const collapsed = narrow();
    // A tinted mark (ONE's is fill="currentColor") takes the theme's text colour; tint: false keeps its own colours.
    const b = this.brand ?? ONE, logo = `mods/one-brand/${b.logo}`;
    return h_flex().size_full().bg(t.chrome).pl(collapsed ? 6 : 14).pr(10).gap(4).items_center().text_size(13.5)
      .when(window()?.platform === "macos" && !collapsed, el => el.pl(76))
      .when(!collapsed, el => el.child(h_flex().flex_1().gap(8).items_center()
        .child(b.tint ? svg(logo).size(22).text_color(t.foreground) : image(logo).size(22))
        .child(div().font_semibold().text_color(t.foreground).child(b.name))))
      .when(!collapsed && Boolean(this.update), el => el.child(h_flex().id("update").h(22).px(8).gap(5).flex_none().items_center().rounded(11)
        .bg(t.accent).text_color(t.accent_foreground).text_size(11.5).font_semibold().hover(s => s.opacity(0.85))
        .on_mouse_down("left", (_e, cx) => cx.stop_propagation()).on_click(() => run("tab.new", updateTab(this.source)))
        .child(div().size(6).rounded(3).bg(t.accent_foreground)).child("Update")))
      .when(!collapsed, el => el.child(this.button("search", svg("mods/one-brand/search.svg").size(15), () => run("mod.open", { name: "picker" }))))
      .when(!(collapsed && window()?.platform === "macos"), el => el.child(this.button("sidebar-toggle", svg("mods/one-brand/sidebar.svg").size(15), toggleSidebar)));
  }
}
