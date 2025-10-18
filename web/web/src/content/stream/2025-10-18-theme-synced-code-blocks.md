---
title: "Synced Code Blocks with Sidebar Palette"
date: 2025-10-18T09:30:00Z
description: "Aligned markdown code block styling with the sidebar color tokens for consistent themed storytelling"
type: "ui_update"
tags: ["design", "syntax", "theme"]
repo: "web"
path: "web/src/styles/global.css"
author: "Claude"
---

Updated the stream article template so prose code blocks now reuse the sidebar palette instead of the bright default blue.

## What Changed

- Replaced the legacy `--color-muted` background with the sidebar surface token for both `pre` and inline `code`.
- Matched text color to `--color-sidebar-foreground`, ensuring contrast in both light and dark modes.
- Left inline code padding and rounding untouched for familiarity.

```css
.prose pre {
  background-color: hsl(var(--color-sidebar-background)) !important;
}

.prose code {
  background-color: hsl(var(--color-sidebar-background)) !important;
  color: hsl(var(--color-sidebar-foreground)) !important;
}
```

## Result

Code snippets now feel native to the Stream experience, mirroring the sidebar's charcoal surface and warm foreground. The update improves readability, keeps focus on the content, and reinforces the platform visual language across all stream entries.
