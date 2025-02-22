---
title: "AI"
description: ""
tags: ["ai", "astro", "react", "shadcn-ui", "responsive", "performance"]
date: 2024-02-03
---
AI is fully integrated into the site very simply.
src/1/1.md The system prompt explaining the features of the agents
src/1/I.md This will be appended to the system prompt and it is a detailed description that is customised by the business. 
/src/layouts/Layout.md contains instructions that can be added onto the prompt 
/src/pages/page.astro falls back to the settings in layout if they are not overwritten. 
/src/pages/page.md falls back to the values in Layout.astro if any entries are not present
/src/layouts/Docs.astro falls back to Layout.astro if any information is not present. 

