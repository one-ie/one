// The Start panel: what a person can ask their agent, in plain words. One press opens a
// Claude Code tab in the active space, in the folder it is in, with the request sent
// (./start.js). start.json beside this file is the list; install.sh writes it from the
// profile, and saving it reloads the panel.
import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { spaces, panes, run, theme, appHome, readTextFile } from "herdr";
import { startTab, validStart } from "./start.js";

function activeSpace() {
  const s = spaces().find((p) => p.active);
  if (!s) return null;
  const tabs = new Set((s.tabs ?? []).map((c) => c.id));
  return { id: s.id, name: s.name, place: panes().find((p) => tabs.has(p.tab) && p.cwd)?.cwd || s.folder };
}

export default class Start extends View {
  init(_props, cx) {
    this.items = [];
    cx.spawn(async (cx) => {
      try { this.items = validStart(JSON.parse(await readTextFile(`${appHome()}/mods/one-start/start.json`) ?? "null")); } catch {}
      cx.notify();
    });
  }

  render() {
    const t = theme();
    const space = activeSpace();
    const row = (item, i) => v_flex().id(`start-${i}`).px(12).py(10).gap(3).rounded(8)
      .border(1).border_color(t.border).bg(t.surface).hover((s) => s.bg(t.hover))
      .on_click(() => run("tab.new", startTab(item, space)))
      .child(div().font_semibold().text_color(t.foreground).child(item.label))
      .child(div().text_size(12).text_color(t.muted).child(item.prompt.length > 110 ? `${item.prompt.slice(0, 108).trimEnd()}…` : item.prompt));
    return v_flex().size_full().min_h(0).bg(t.chrome).text_size(13)
      .child(h_flex().h(46).px(16).gap(8).items_center().flex_none()
        .child(svg("mods/one-start/play.svg").size(15).text_color(t.accent))
        .child(div().font_semibold().text_color(t.foreground).child("Start"))
        .when(Boolean(space), (el) => el.child(div().text_color(t.dim).truncate().child(`in ${space.name}`))))
      .child(div().px(16).pb(10).text_size(12).text_color(t.muted)
        .child("Press one: your agent opens in a new tab and starts on it. Nothing to type."))
      .child(v_flex().flex_1().min_h(0).px(10).pb(14).gap(8).overflow_y_scrollbar()
        .when(this.items.length === 0, (el) => el.child(div().px(6).text_color(t.dim).child("Nothing here yet: run install.sh again.")))
        .children(this.items.map(row)));
  }
}
