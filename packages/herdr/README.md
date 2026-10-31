# ONE's Herdr

[Herdr](https://herdr.dev) puts your terminals and Claude Code agents in one window: spaces,
tabs, agents. This folder sets it up the ONE way:

- **Start.** A panel of things you can ask your agent, in plain words. Press one and Claude
  Code opens in a new tab and starts on it. Nothing to type.
- **Documents** beside Files: only markdown, and only the folders that hold some. Click one and
  it opens in the markdown viewer beside your terminal. `cmd-shift-m` opens it as a picker.
- **Changed files are highlighted** in Files and Documents: `M` modified, `A` new, `D`/`U`
  deleted or conflict, a dot on a folder with changes inside.
- **ONE's mark** at the top of the sidebar and on the ONE space.
- **Updates come to you.** When a newer version is out, an **Update** button appears next to
  the mark. Press it; it takes a few seconds and keeps your spaces.

## Install

```sh
git clone https://github.com/one-ie/one.git
cd one
bash packages/herdr/install.sh
```

It installs Herdr if you haven't got it, opens it, adds the layout, checks every piece with
`herdr-app check`, switches the window over and makes a ONE space with Claude Code ready
(if `claude` is installed). Run it again any time: it only replaces what changed, and never
deletes anything (replaced files go to `~/.config/herdr-app/.one-pack-backup/<time>/`).

- Herdr's Mac app needs an Apple Silicon Mac (M1 or newer) and `node`.
- Back to Herdr's own layout: `ctrl-shift-l`. Take this out: `bash packages/herdr/install.sh --remove`.
- Skip making the space: `--no-spaces`.

## What runs on your machine

The mods read files and run `git` (`ls-files`, `status`) in the folder you're working in, to
list documents and spot changes. Every few hours the brand row runs `git fetch` in the repo
you installed from, to see whether a newer version exists. The Update button installs that
version from a temporary copy, so your own checkout is never touched. The markdown viewer
uses `node` when it's installed (faster on big files). Nothing else touches the network.

## What's in here

| Path | What |
|---|---|
| `install.sh` | the installer (`--help`) |
| `profiles/one.json` | the mark, the space, the Start buttons |
| `layouts/one.json` | Herdr's main layout with the ONE pieces swapped in |
| `mods/one-brand/` | the sidebar's top row: the mark and the Update button |
| `mods/spaces-one/` | Herdr's Spaces list, each space with its icon |
| `mods/one-start/` | the Start panel |
| `mods/tabs-one/` | Herdr's tab bar plus the Start and Documents buttons |
| `mods/documents/` | the Documents panel |
| `mods/files-md/` | Herdr's Files panel: markdown opens in the viewer, changes highlighted |
| `mods/markdown/` | the markdown viewer (marked 18, MIT) |
| `check-clones.sh` | names any mod cloned from Herdr whose original Herdr has since changed |
| `VERSION` | what the Update button compares |
| `RECIPE.md` | the brief to build it from scratch |

## For developers

```sh
bash packages/herdr/install.sh              # install your edits
bash packages/herdr/install.sh pull         # after editing live in ~/.config/herdr-app, copy back
bash packages/herdr/install.sh --self-test  # the installer, in a throwaway Herdr home
bash packages/herdr/check-clones.sh         # which clones Herdr has moved past
```

To ship an update: bump `VERSION` and merge to `main`. Everyone's Update button lights up
within six hours.
