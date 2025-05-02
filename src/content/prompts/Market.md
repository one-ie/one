---
title: Market Awareness
description: "Agent: Foundation Analyst** to perform the **Market Awareness Synthesis** task."
date: 2025-05-01
order: 2
tags:
  - foundation
  - market
---

**Prompt FM1: Synthesize Market Awareness from Provided Research**

**(Instructions for User:** First, conduct research on 1-3 key competitors (their websites, main message), relevant market trends (news articles, reports), and the channels your target audience uses (forums, social groups). Gather key findings, summaries, or direct quotes. Then, paste this information into the `[--- USER RESEARCH INPUT START ---]` section below before running this prompt.)*

```markdown
### ROCKET Prompt: FM1 - Market Awareness Synthesis

**ROLE:**
Act as an expert Market Analyst and Competitive Intelligence Specialist.

**OBJECTIVE:**
To analyze user-provided research findings about market competitors, relevant trends, and communication channels, synthesizing them into a structured summary corresponding to the **Market Awareness** pillar of the Elevate Ecommerce Framework's FOUNDATION stage.

**CONTEXT:**
*   **Framework Step:** Step 0: FOUNDATION - Pillar 2: Market Awareness
*   **Target Audience (for this Output):** The User (me), for building the Foundation Blueprint and informing strategic positioning.
*   **Source Data:** The analysis MUST be based *solely* on the information provided by the user in the 'USER RESEARCH INPUT' section below. Do not use external knowledge.
*   **Company Context Link:** The user's previously defined Company Context (especially Unique Mechanism and Positioning goals) should be considered when analyzing differentiation opportunities.
*   **Goal:** To extract strategic insights about the competitive landscape, market forces, and channel effectiveness to inform positioning and outreach strategies.

**KEY INSTRUCTIONS / TASK:**
Based *only* on the provided user research input regarding the market and competitors:
1.  Summarize the **Competitive Landscape:** For each competitor mentioned by the user:
    *   Identify their apparent **Primary Offering Focus & Stated Value Proposition**.
    *   List any **Perceived Weaknesses or Market Gaps** identified *by the user* or inferred directly from customer complaints/reviews *provided by the user*.
2.  Define Potential **Points of Differentiation:** Based *only* on the comparison between the user's described Unique Mechanism/Value Prop (from their input or prior context if available in session) and the identified competitor weaknesses/offerings, suggest 2-3 potential angles for strategic differentiation. Explicitly state *why* this is a point of difference.
3.  Identify **Key Market Trends & Pains:** Summarize the relevant market trends mentioned by the user and infer the potential broader **Market Pains or Unmet Needs** these trends might be creating or highlighting.
4.  Outline **Channel & Communication Context:**
    *   List the key channels identified by the user where competitors and/or customers are active.
    *   Summarize the user's observations about the **General Tone/Noise Level** on these channels.
    *   Note any potential **Underutilized Channels or Communication Styles** hinted at in the user's research.
5.  Suggest **Strategic Responses (Positioning & Channel):** Based on the synthesis above:
    *   Suggest how the user might leverage their Differentiation (Point 2) against market trends/pains (Point 3).
    *   Recommend initial thoughts on **Prioritized Channels** for outreach (**HOOK** step) based on perceived effectiveness and noise levels.
    *   Suggest potential **Brand Voice Adaptations** needed to stand out on those priority channels.

**EXAMPLES (Optional):**
*   N/A for this synthesis task unless the user wants a specific output structure demonstrated.

**TONE & FORMAT:**
*   **Tone:** Strategic, analytical, objective, insightful.
*   **Format:** Use clear Markdown headings for each of the 5 points listed in KEY INSTRUCTIONS. Use bullet points extensively for clarity (e.g., listing competitors, weaknesses, differentiation angles, trends, channel observations, strategic suggestions). State clearly if information for a specific point was not found in the provided user input.

**Constraint:** **Do not** access external websites or use pre-existing knowledge. Base the entire analysis strictly on the user's input below.

**[--- USER RESEARCH INPUT START ---]**

*   **(Competitor Information - Repeat for 1-3 competitors):**
    *   **Competitor Name:** `[User inserts Name]`
    *   **Website URL:** `[User inserts URL]`
    *   **Primary Offering Focus (User Observation):** `[User describes]`
    *   **Stated Value Proposition (User Observation/Quote):** `[User describes or pastes]`
    *   **Observed Weaknesses/Customer Complaints (User Research):** `[User lists]`
*   **(Market Trends & Pains):**
    *   **Relevant Trend 1:** `[User describes trend]`
    *   **Relevant Trend 2:** `[User describes trend]`
    *   **Observed Market Pains/Unmet Needs (User Research/Analysis):** `[User lists]`
*   **(Channel & Communication Context):**
    *   **Key Channels (Where Customers/Competitors Are):** `[User lists channels, e.g., Specific Facebook Groups, LinkedIn, Google Search, Industry Blogs]`
    *   **Observed Channel Tone/Noise Level:** `[User describes, e.g., "Instagram very noisy/visual," "LinkedIn more professional/text-heavy," "Reddit forums very cynical"]`
    *   **Potential Underserved Channels/Styles (User Observation):** `[User notes any ideas]`
*   **(Your Company Context Reminder - Optional but Helpful):**
    *   **Your Unique Mechanism:** `[User briefly reminds AI]`
    *   **Your Intended Positioning:** `[User reminds AI - e.g., Premium]`

**[--- USER RESEARCH INPUT END ---]**

Please proceed with the analysis and provide the structured Market Awareness Synthesis.
```

---

**How this prompt works:**

1.  **Clear Role & Objective:** Defines the AI as a Market Analyst focused on synthesizing user research for the Market Awareness foundation pillar.
2.  **Explicit Constraint:** Reiterates that the AI *must* rely solely on the user-provided input.
3.  **Structured Tasks:** Breaks down the analysis into logical components mirroring the Market Awareness Grid (Competitors, Trends, Channels) and adds strategic synthesis (Differentiation, Response).
4.  **User Input Section:** Clearly prompts the user for the specific types of research findings needed (Competitor info, Trends, Channel observations).
5.  **Strategic Output:** Guides the AI to not just list findings but also suggest potential differentiation angles and strategic responses based on the analysis.
6.  **Format Specified:** Ensures a clear, organized report using Markdown.

This prompt enables the user to leverage the AI's analytical power to structure and interpret their market research effectively within the Elevate Framework's foundational context.