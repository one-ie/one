---
title: "ONE AU"
description: "Lets upgrade our system to use content collectionsn"
tags: ["ai", "prompts", "configuration", "customization", "system-design"]
date: 2024-02-03
---

# AI 



## Hierarchy

The system follows a cascading inheritance pattern where configurations and prompts flow from base to specific implementations:

### 1. Core System Level (`src/contennt/prompts/system.md`)
- Here you will find the core system prompt to build the system
- Establishes fundamental AI behavior patterns
- Contains base feature explanations and agent characteristics

### 2. I (`src/content/prompts/business.md`)
- Appends business-specific instructions and knowledge
- Customizes AI behavior for specific use cases
- Allows for domain-specific rules and responses


3. Chat src/components/Chat.tsx 
Assembles the prompt - creates a system message from 1.md and business.md and the values from 

### 3. Layout Level (`src/layouts/Layout.astro`)
- Provides default chat configurations that fall ba
- Sets up standard UI components and behaviors
- Establishes baseline prompt settings

### 4. Text src/layouts/Text.astro 
This allows markdown content to be sent as the prompt 

### 4. Page Level Configuration
- `page.astro`: Override layout settings when needed
- `page.md`: Custom content-specific configurations
- `Docs.astro`: Documentation-specific settings



