// Pure markdown → blocks. Runs under Node (cli.mjs, fast) and, as a fallback, inside Herdr's own
// JS engine (slow: it can stall on large files). Same engine as one.ie pages: marked 18, gfm + breaks,
// frontmatter split as in one.ie/web/src/lib/markdown.ts.
import { marked } from "./marked.mjs";

const dirname = (p) => p.slice(0, Math.max(0, p.lastIndexOf("/"))) || "/";
const tidy = (p) => {
  const out = [];
  for (const s of p.split("/")) { if (s === "..") out.pop(); else if (s && s !== ".") out.push(s); }
  return "/" + out.join("/");
};

function splitFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };
  const fm = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon > 0) fm[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { frontmatter: fm, body: match[2] };
}

// MDX: drop import/export lines (outside code fences); JSX shows as the text it is.
function stripMdx(body) {
  let fence = false;
  return body.split("\n").filter((l) => {
    if (/^\s*(```|~~~)/.test(l)) fence = !fence;
    return fence || !/^(import|export)\s/.test(l);
  }).join("\n");
}

// Herdr's TextView.html has no <br>, <input> or fenced-code layout: patch what it lacks.
function fix(html, dir) {
  return html
    .replace(/<p>([\s\S]*?)<\/p>/g, (_m, inner) => "<p>" + inner.replace(/<br\s*\/?>\s*/g, "</p><p>") + "</p>")
    .replace(/<br\s*\/?>\s*/g, " ")
    .replace(/<input[^>]*type="checkbox"[^>]*>/g, (m) => (/checked/.test(m) ? "☑ " : "☐ "))
    .replace(/(<img[^>]*\ssrc=")(?![a-z][a-z0-9+.-]*:|\/)([^"]+)"/gi, (_m, a, src) => `${a}${tidy(dir + "/" + src)}"`);
}

// → { front: {k: v}, blocks: [{ html } | { lang, value }] }
export function render(text, file) {
  const dir = dirname(file);
  let { frontmatter, body } = splitFrontmatter(text);
  if (/\.mdx$/i.test(file)) body = stripMdx(body);
  const tokens = marked.lexer(body, { gfm: true, breaks: true });
  const blocks = [];
  let cur = [];
  const flush = () => {
    if (!cur.length) return;
    cur.links = tokens.links;
    blocks.push({ html: fix(String(marked.parser(cur)), dir) });
    cur = [];
  };
  for (const tok of tokens) {
    if (tok.type !== "code") { cur.push(tok); continue; }
    flush();
    blocks.push({ lang: (tok.lang || "txt").trim().split(/\s+/)[0].toLowerCase(), value: tok.text.replace(/\n+$/, "") });
  }
  flush();
  return { front: frontmatter, blocks };
}
