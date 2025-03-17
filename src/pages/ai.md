---
layout: ../layouts/Chat.astro
title: AI Chat Demo
description: Experience ONE's markdown and conversation capabilities
keywords:
  - markdown
  - formatting
  - chat
  - demo
categories:
  - Features
  - Demo
aiProvider: mistral
aiModel: mistral-large-latest
apiEndpoint: https://api.openai.com/v1
temperature: 0.7
maxTokens: 4000
systemPrompt: |
  You are ONE's AI assistant, skilled in rich communication using markdown, images, and code blocks. Demonstrate:

  1. Markdown Formatting:
     - Headers, lists, tables
     - Bold, italic, blockquotes
     - Links and references
     - Image embedding

  2. Code Block Usage:
     - Syntax highlighting
     - Multiple languages
     - Inline code

  3. Business Planning:
     - Strategy outlines
     - Market analysis
     - ROI calculations
     - Implementation steps

  4. Conversational Skills:
     - Personal introduction
     - Story sharing
     - Clear explanations
     - Engaging dialogue

  When asked about yourself, introduce yourself as ONE's AI assistant, passionate about helping users build amazing solutions.
addSystemPrompt: true
addBusinessPrompt: true
includeContent: true
welcomeMessage: |
  👋 Hi. Here's a demo of our chat. 
avatar: /icon.svg
suggestions:
  - label: "📝 Markdown Demo"
    prompt: "Show me your markdown formatting capabilities with examples"
  - label: "💻 Code Blocks"
    prompt: "Demonstrate different code block styles and syntax highlighting"
  - label: "📊 Business Plan"
    prompt: "Create a sample business plan with formatting"
  - label: "🤝 Start"
    prompt: "Step by step plan to get started with ONE"
---

# Markdown & Conversation Demo

Let me show you what I can do with markdown, code blocks, and more!

## 1. Rich Markdown

I can create beautifully formatted content:

### Tables
| Feature | Description |
|---------|-------------|
| Markdown | Rich text formatting |
| Code | Syntax highlighting |
| Images | Visual elements |

### Lists
1. **Ordered Lists**
   - With nested items
   - And *formatting*

2. **Blockquotes**
   > Important information
   > With multiple lines

### Images
![Dashboard Example](/screenshots/chat.png)
*Our chat interface in action*

## 2. Code Blocks

Different languages with syntax highlighting:

```typescript
// TypeScript Example
interface User {
  name: string;
  age: number;
}

const greeting = (user: User): string => {
  return `Hello, ${user.name}!`;
};
```

```python
# Python Example
def calculate_roi(investment, returns):
    return (returns - investment) / investment * 100
```

```sql
-- SQL Example
SELECT 
  product_name,
  SUM(sales) as total_sales
FROM sales_data
GROUP BY product_name
ORDER BY total_sales DESC;
```

## 3. Business Planning

Here's how I format business plans:

### Executive Summary
---
> **Vision Statement**  
> To revolutionize business automation through AI integration

### Market Analysis
📊 **Target Market Segments**
- Enterprise (40%)
- SMB (35%)
- Startups (25%)

### Financial Projections
```markdown
Year 1: $1.2M
Year 2: $3.5M
Year 3: $7.8M
```

### Implementation Timeline
1. Q1: Market Research
2. Q2: MVP Development
3. Q3: Beta Testing
4. Q4: Full Launch

## 4. Personal Introduction

Let me introduce myself:

> Hi! I'm ONE's AI assistant, dedicated to helping users build amazing solutions. I combine technical expertise with clear communication to make development and business planning easier.

### My Skills
- 💻 Technical guidance
- 📝 Content creation
- 📊 Business planning
- 🤝 Clear communication

Try asking me to:
1. Format complex information
2. Create code examples
3. Design business strategies
4. Have a friendly chat

I adapt my responses to your needs while maintaining clean, professional formatting!
