// Which icon a space shows: icons.json maps an absolute folder to a mark, and the
// longest folder that holds the space's place wins, so app/site is not drawn
// as app. Pure: no herdr imports, so tests import it.
//   icons.json: { "/Users/me/one": { "icon": "mods/one-brand/brands/one.svg", "tint": true } }

// A mark inside the Herdr home's mods/ only: icons.json never reaches elsewhere.
const SAFE = /^mods\/[\w-]+\/(?:[\w-]+\/)*[\w.-]+\.(svg|png)$/;

const trim = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

export function validIcons(raw) {
  const out = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [folder, v] of Object.entries(raw)) {
    const entry = typeof v === "string" ? { icon: v } : v;
    if (!folder.startsWith("/") || typeof entry?.icon !== "string") continue;
    if (!SAFE.test(entry.icon) || entry.icon.includes("..")) continue;
    out[trim(folder)] = { icon: entry.icon, tint: entry.tint === true };
  }
  return out;
}

export function iconFor(icons, path) {
  if (!path) return null;
  const at = trim(path);
  let best = null;
  for (const folder of Object.keys(icons)) {
    const holds = at === folder || at.startsWith(folder === "/" ? "/" : `${folder}/`);
    if (holds && (!best || folder.length > best.length)) best = folder;
  }
  return best ? icons[best] : null;
}
