---
title: Getting started — provisioning and plugin wiring
description: How this workspace was provisioned and how its connected-tier plugins are wired end to end.
order: 1
---

This site is running on the `template` workspace, provisioned with `one init --name template --write-env`. The API key lives in `.dev.vars` (local) and is read at runtime by the connected-tier plugins on the `/plugins` page.
