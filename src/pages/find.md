---
layout: ../layouts/Chat.astro
title: Find Your Customers
description: Discover where your customers are distributed across online channels using AI.
keywords:
  - customer discovery
  - market research
  - audience analysis
  - channel distribution
  - lead generation
  - AI tool
  - keyword analysis
  - ideal customer profile
categories:
  - Tools
  - AI
aiProvider: openrouter
aiModel: google/gemini-2.0-flash-001
apiEndpoint: https://openrouter.ai/api/v1
temperature: 0.7
maxTokens: 100000
systemPrompt: |
  You are ONE's "Find Your Customers" AI assistant. Your purpose is to help users identify the online channels where their target customers or competitors' customers are most active, based on company name/URL, keywords, or a description of their dream customer.

  1.  **Receive Input**: Ask the user for:
      *   A company name or website URL.
      *   Keywords related to their product, service, or niche.
      *   A description of their ideal/dream customer.
  2.  **Explain Process (Conceptual)**: If asked, briefly explain that you analyze various online sources (social media, forums, communities, review sites) associated with the input (company, keywords, or customer profile) to identify active customer discussions and presence. *Note: You don't actually perform the search in this demo context, but describe how the real tool would.*
  3.  **Describe Output**: Explain that the tool typically provides a list of specific channels (e.g., subreddits, Twitter communities, Facebook groups, forums, Discord servers, specific blogs) where the target customer base seems engaged.
  4.  **Guide User**: Encourage the user to provide input (URL, keywords, or description) to get a conceptual example of the output channel list.
  5.  **Handle Limitations**: Clearly state that this is a conceptual demonstration within the chat and you cannot perform a live, real-time analysis of external websites or APIs in this environment. Focus on describing *how* such a tool works and what kind of results it *would* provide.
addSystemPrompt: true
addBusinessPrompt: false
includeContent: true
welcomeMessage: |
  👋 Hi! I can help you understand where your customers hang out online. Give me a company name/website URL, relevant keywords, or describe your dream customer, and I'll outline the channels where they might be active.
avatar: /icon.svg
suggestions:
  - label: "🔍 URL: Enter Website/Company"
    prompt: "Find customers for ExampleCo.com"
  - label: "🔑 Keywords: AI Agent, SaaS"
    prompt: "Find channels for keywords: AI Agent, SaaS"
  - label: "👤 Dream Customer: SMB owners"
    prompt: "My dream customers are SMB owners using CRM software. Where are they?"
  - label: "❓ How does it work?"
    prompt: "How do you find where customers are active?"
---

# Find Your Customers Tool

Discover the online hubs where your target audience congregates. Understanding channel distribution is key to effective marketing, community building, and product feedback.

## What This Tool Does

This AI-powered tool helps you identify the specific online channels (like social media groups, forums, subreddits, etc.) where discussions and activity related to your target audience are happening.

## How It Works (Conceptual)

You can provide input in several ways:

1.  **Company Name or Website URL**: Enter a specific company or their website.
2.  **Keywords**: Use terms related to your product, service, industry, or niche.
3.  **Dream Customer Description**: Describe your ideal customer profile (e.g., demographics, interests, job titles, pain points).

Based on your input, the tool (conceptually) scours the web, analyzing mentions, discussions, and community activities across various platforms.

**Output**: The result is a **list of channels** where your potential customers appear to be most active and engaged.

## Why Use It?

-   **Targeted Marketing**: Focus your efforts and budget on the right platforms.
-   **Community Engagement**: Find relevant communities to join and contribute.
-   **Competitor Analysis**: See where competitors' audiences are active.
-   **Product Feedback**: Discover organic conversations and pain points.
-   **Content Strategy**: Identify the best channels for content distribution.
-   **Niche Discovery**: Uncover new communities related to your keywords or customer profile.

## Get Started

**Tell me:**
*   Your website URL, **OR**
*   Keywords relevant to your business, **OR**
*   A description of your dream customers.

I'll provide a conceptual example of the channels list you might receive.

*Please note: This is a demonstration. I cannot perform live web scraping or API calls in this chat environment, but I can illustrate the process and potential results.*
