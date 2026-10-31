# Recipe: the ONE layout

Start from Herdr's `main` layout (cloned, version 0.1.9) and change four things.

1. **Brand.** The sidebar's `brand` block draws a new mod, `one-brand`: the same row as
   `workspace-chrome` (search button, sidebar toggle, narrow-rail behaviour) with ONE's mark
   (`one.svg`, `fill="currentColor"`, drawn with `svg()` so it takes the theme's foreground)
   and the word "ONE" in place of Herdr's image and name. `brand.json` beside it picks another
   mark from `brands/` (`{name, logo, tint}`); the mark is one.ie's favicon (one.ie/favicon.svg).
2. **Documents panel.** A mod, `documents`, added to the `panel-body` stack between `files`
   and `changes`. It lists the focused pane's folder, markdown only (`.md`, `.markdown`,
   `.mdx`): `git ls-files --cached --others --exclude-standard` in a repo, `find` with
   node_modules/.git/dist/build pruned outside one. Folders show only when they hold markdown
   below them. Clicking a file closes any markdown pane in the tab and splits the tab's
   terminal right with `{mod: "markdown", props: {file}}`. Refreshes every 10 s.
3. **Tab bar.** `tabs-one`, a clone of `tabs` with a Documents panel button after Files. On
   start it adds `"documents"` to the shared `workspace.panels` list after `"files"`.
4. **Changes highlighted.** In `documents` and `files-md` (a `files` clone whose markdown opens
   in the viewer), `git status --porcelain=v1 -z` marks each changed path `M`/`A`/`D`/`U`;
   the row's icon and name take the mark's colour (`A` ansi2, `D`/`U` ansi1, else `blocked`)
   and the letter shows at the right. Every ancestor folder of a changed path is tinted with
   a dot. Documents' header shows "N changed".

The markdown viewer (`markdown`) renders with marked 18 (gfm, breaks), under `node cli.mjs`
when available, in Herdr's engine otherwise; `cmd-shift-m` opens it as a picker.

`install.sh` also installs Herdr when it's missing (`releases.herdr.dev/app/install.sh`), opens
it, and makes the ONE space with `space.new {name, folder, tab, argv}`,
skipping any folder `herdr-app ls` already shows.

## 0.2: Start, website icons, updates

5. **Start panel.** A mod, `one-start`, first in the `panel-body` stack (the layout opens on
   it). `start.json` beside it is a list of `{label, prompt}` (the profile's `start`); each is
   a card, and a press runs `tab.new {space, folder, name: label, argv: ["claude"], task: prompt}`
   in the active space's live folder. `tabs-one` gets a Start button (star icon) first.
6. **Website icons.** `spaces-one`, a clone of Herdr 0.1.10's `spaces` (base hashes in
   `clone.json`), draws a space's 18 px tile from `icons.json` (`{"/abs/folder": {icon, tint}}`)
   when the longest folder there holds the space's first terminal's cwd, else the shipped
   letter tile. A tinted mark is `svg()` in the foreground colour; others are `image()`.
7. **Updates.** `one-brand` reads `source.json` (`{repo, dir, branch, profile, version}`), runs
   `git fetch` then `git show origin/<branch>:<dir>/VERSION` at start and every 6 h, and when
   that is higher shows an accent **Update** pill and one toast per version. Both open
   `tab.new` running `bash -lc` with: fetch, `git archive origin/<branch> <dir>` into a temp
   folder, and that copy's `install.sh --profile <p> --repo <repo>`.

`install.sh` writes the four per-person files from `profiles/<name>.json`, each only when it
changes, so a second run reports every mod "up to date"; `--self-test` proves it in a
throwaway `HERDR_APP_HOME`.
