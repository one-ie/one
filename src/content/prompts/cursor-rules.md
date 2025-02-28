---
title: Cursor Rules Documentation
description: Documentation for the Cursor AI rules used in the ONE framework
date: 2024-07-01
---

# Cursor Rules Documentation

This document provides an overview of the Cursor AI rules used in the ONE framework. These rules help maintain consistency and best practices across the codebase by providing AI-assisted guidance when working with different file types.

## Rule Files Location

All rule files are stored in the `.cursor/rules` directory in the MDC format (`.mdc`).

## Available Rules

### 1. Astro Component Guidelines
- **File**: `.cursor/rules/astro-component-guidelines.mdc`
- **Description**: Guidelines for Astro components
- **Applies to**: `src/**/*.astro`, `src/components/**/*.astro`
- **Key topics**:
  - Component structure
  - Props and typing
  - Styling with Tailwind CSS
  - Performance optimization
  - Accessibility
  - File organization

### 2. React Component Guidelines
- **File**: `.cursor/rules/react-component-guidelines.mdc`
- **Description**: Guidelines for React components
- **Applies to**: `src/components/**/*.tsx`, `src/components/**/*.jsx`
- **Key topics**:
  - Component structure
  - Props and typing
  - State management
  - Performance optimization
  - Accessibility
  - Testing

### 3. Shadcn UI Guidelines
- **File**: `.cursor/rules/shadcn-ui-guidelines.mdc`
- **Description**: Guidelines for Shadcn/UI and Tailwind CSS usage
- **Applies to**: `src/components/ui/**/*.tsx`, `src/**/*.css`
- **Key topics**:
  - Component usage
  - Customization
  - Theming
  - Accessibility
  - Integration with Astro

### 4. Content Management Guidelines
- **File**: `.cursor/rules/content-management-guidelines.mdc`
- **Description**: Guidelines for content management and MDX
- **Applies to**: `src/content/**/*`, `src/pages/**/*.md`, `src/pages/**/*.mdx`
- **Key topics**:
  - Content structure
  - Frontmatter
  - MDX components
  - Styling
  - SEO optimization

### 5. Project Guidelines
- **File**: `.cursor/rules/project-guidelines.mdc`
- **Description**: General project guidelines
- **Applies to**: `**/*`
- **Key topics**:
  - Project structure
  - Naming conventions
  - Code style
  - Documentation
  - Best practices

### 6. AI Integration Guidelines
- **File**: `.cursor/rules/ai-integration-guidelines.mdc`
- **Description**: Guidelines for AI integration and prompt engineering
- **Applies to**: `src/schema/chat.ts`, `src/pages/api/chat.ts`, `src/content/prompts/**/*`
- **Key topics**:
  - Prompt engineering
  - AI model integration
  - Response handling
  - Error handling
  - Performance optimization

### 7. Astro Client Directives
- **File**: `.cursor/rules/astro-client-directives.mdc`
- **Description**: Guidelines for using Astro client directives and interactive components
- **Applies to**: `src/**/*.astro`, `src/components/**/*.tsx`, `src/components/**/*.jsx`
- **Key topics**:
  - Client directives (`client:load`, `client:idle`, `client:visible`, etc.)
  - Working with Shadcn/UI components in Astro
  - Creating wrapper components for complex UI
  - Preventing hydration errors
  - Performance optimization
  - Common pitfalls to avoid

### 8. Content Collections
- **File**: `.cursor/rules/content-collections.mdc`
- **Description**: Guidelines for using Astro content collections and MDX
- **Applies to**: `src/content/**/*.md`, `src/content/**/*.mdx`, `src/content/config.ts`, `src/pages/**/*.md`, `src/pages/**/*.mdx`
- **Key topics**:
  - Content collections structure
  - Collection configuration with Zod
  - Frontmatter best practices
  - Chat configuration in MDX
  - Content querying and rendering
  - Documentation organization
  - Content styling
  - AI-enhanced content

### 9. Chat System Guidelines
- **File**: `.cursor/rules/chat-system-guidelines.mdc`
- **Description**: Guidelines for configuring and implementing the ONE chat system
- **Applies to**: `src/pages/**/*.astro`, `src/pages/**/*.md`, `src/pages/**/*.mdx`, `src/components/chat/**/*.tsx`, `src/schema/chat.ts`
- **Key topics**:
  - Chat configuration
  - Layout integration
  - Panel modes
  - System prompts
  - Welcome screen configuration
  - Advanced configuration
  - Page-specific AI agents
  - Chat API integration
  - Best practices
  - Common pitfalls

### 10. Layout Components Guidelines
- **File**: `.cursor/rules/layout-components-guidelines.mdc`
- **Description**: Guidelines for implementing layout panel components in the ONE framework
- **Applies to**: `src/layouts/Layout.astro`, `src/components/layout/*.astro`
- **Key topics**:
  - Panel-based layout structure
  - Left, Top, Center, Bottom, Right panels
  - CSS Grid layout implementation
  - Panel visibility controls
  - Responsive design
  - Panel resize functionality
  - Accessibility considerations
  - Performance optimization
  - State management
  - Theming

### 11. Layout Components Todos
- **File**: `.cursor/rules/layout-todos.mdc`
- **Description**: Todo items for implementing layout panel components in the ONE framework
- **Applies to**: `src/layouts/Layout.astro`, `src/components/layout/*.astro`
- **Key topics**:
  - Implementation checklist
  - Panel component tasks
  - Panel functionality tasks
  - Priority order
  - Testing scenarios
  - Performance considerations
  - Integration points
  - Accessibility requirements

## How to Use Cursor Rules

1. **AI-Assisted Coding**: When editing files that match the glob patterns, Cursor AI will use these rules to provide context-aware suggestions and guidance.

2. **Testing Rules**: You can test the rules by asking Cursor AI to help you create or modify files that match the glob patterns.

3. **Updating Rules**: To update a rule, simply edit the corresponding `.mdc` file in the `.cursor/rules` directory.

4. **Adding New Rules**: To add a new rule, create a new `.mdc` file in the `.cursor/rules` directory with the appropriate frontmatter and content.

## Rule File Structure

Each rule file follows this structure:

```md
---
description: Brief description of the rule
glob_patterns:
  - "pattern1"
  - "pattern2"
---

# Rule Title

## Section 1
Content for section 1

## Section 2
Content for section 2
```

The frontmatter includes:
- `description`: A brief description of the rule
- `glob_patterns`: An array of glob patterns that determine which files the rule applies to

## Benefits of Using Cursor Rules

- **Consistency**: Ensures consistent coding practices across the project
- **Best Practices**: Encourages adherence to established best practices
- **Onboarding**: Helps new team members understand project conventions
- **Efficiency**: Speeds up development with AI-assisted guidance
- **Quality**: Improves overall code quality and maintainability
