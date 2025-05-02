---
title: Customer Analysis
description: ""
tags:
  - foundation
  - customer
date: 2025-03-08
---
Okay, let's create the specific ROCKET prompt for **Agent: Foundation Analyst** focusing on the **Customer Avatar Synthesis**. This assumes the user has conducted research (interviews, surveys, analyzing reviews, observing 'watering holes') and provides that data for the AI to structure and synthesize according to the Customer Avatar Grid components.

---

**Prompt FC3: Synthesize Customer Avatar Profile from Provided Research**

**(Instructions for User:** First, gather your research about your ideal customer. This might include interview summaries, survey results, key quotes from reviews or forums, observations about behavior in online groups ('watering holes'), and demographic notes. Structure and paste this information clearly into the `[--- USER RESEARCH INPUT START ---]` section below before running this prompt.)*

```markdown
### ROCKET Prompt: FC3 - Customer Avatar Synthesis

**ROLE:**
Act as an expert Customer Insights Analyst and Qualitative Researcher.

**OBJECTIVE:**
To analyze the user-provided research findings about their ideal customer and synthesize them into a structured **Customer Avatar Profile**, aligning with the Elevate Ecommerce Framework's FOUNDATION stage (Pillar 3: Customer Deep Dive).

**CONTEXT:**
*   **Framework Step:** Step 0: FOUNDATION - Pillar 3: Customer Deep Dive
*   **Target Audience (for this Output):** The User (me), for finalizing the Foundation Blueprint and guiding all subsequent marketing/AI prompt context.
*   **Source Data:** The analysis MUST be based *solely* on the information provided by the user in the 'USER RESEARCH INPUT' section below. Do not use external knowledge or make broad generalizations not supported by the provided data.
*   **Prior Context Link:** Consider insights gathered previously about the Company and Market (if available in session/user input) when interpreting customer pains/goals.
*   **Goal:** To extract and organize key insights about the customer's observable reality, underlying motivations, and future aspirations, mapping them to the Customer Avatar Grid structure.

**KEY INSTRUCTIONS / TASK:**
Based *only* on the provided user research input regarding the ideal customer:

1.  **Summarize Observable Reality (Grid Row A Elements):**
    *   **Demographics & Role:** Extract key demographics (age range, location etc.) and their typical role (e.g., Ecom Owner, Marketing Mgr).
    *   **Environment & Info Sources:** List platforms/tools they use, common info sources mentioned (blogs, experts). Note awareness of market/competition if indicated in research.
    *   **Stated Pains & Challenges:** List the *explicitly mentioned* frustrations, problems, or obstacles they face (use their language where possible).
    *   **Stated Goals & Desired Efficiencies:** List the *explicitly stated* goals and desires for improvement (e.g., "increase sales," "find a simpler system," "save time").

2.  **Analyze Underlying Drives (Grid Row B Elements):**
    *   **Self-Perception & Values:** Infer how they see themselves and what values (e.g., efficiency, growth, quality, authenticity) seem important based on their language and priorities.
    *   **Core Beliefs:** Identify potential underlying beliefs (positive or negative) about the market, solutions, technology (like AI), or their capabilities suggested by the research.
    *   **Core Emotions & Underlying Fears:** Infer the dominant emotions associated with their pains (Frustration? Anxiety? Confusion?) and hypothesize the deeper FEARS driving these (Failure? Irrelevance? Wasted Investment?).
    *   **Core Needs & Desired Feelings:** Identify the primary human needs they seem to be seeking (Certainty? Control? Significance? Growth?) and the desired *feeling* state (Confidence? Peace of Mind? Empowerment?).

3.  **Project Future State (Grid Row C Elements):**
    *   **"Watering Holes" & Specific Behaviors:** List the *specific online communities, groups, forums, or influencers* mentioned or observed in the research. Describe *how* they typically behave there (Asking Qs? Sharing wins? Complaining?).
    *   **Cost of Inaction / Negative Future:** Synthesize the likely negative long-term outcome *if their pains aren't solved*, based on the research provided.
    *   **Vision of Success / Ultimate Dreams:** Synthesize their ideal future state (transformed business/life) and ultimate aspirations (Freedom? Legacy? Exit?) hinted at or stated in the research.

**EXAMPLES (Optional):**
*   N/A for this synthesis task unless the user wants the *output format* (e.g., specific phrasing for needs/fears) to follow an example.

**TONE & FORMAT:**
*   **Tone:** Empathetic yet analytical. Objective synthesis of the provided data. Use customer language quotes where impactful (indicate if direct quote).
*   **Format:** Use clear Markdown headings mirroring the 3 Rows of the Customer Avatar Grid (Observable Reality, Underlying Drives, Future State) and sub-headings for each specific element (e.g., Demographics & Role, Stated Pains...). Use bullet points for listing findings within each element. State clearly if information for a specific point was not present or clear in the provided user input.

**Constraint:** **Do not** make assumptions beyond the user's input. Your role is to structure and interpret the *provided* research data, not to invent avatar details.

**[--- USER RESEARCH INPUT START ---]**

*   **(Demographic Notes):** `[User pastes notes/survey summaries]`
*   **(Role & Environment Info):** `[User pastes notes on typical job titles, platforms used]`
*   **(Stated Pains & Challenges - Quotes/Summaries):** `[User pastes direct quotes or summaries from interviews/reviews/forums]`
*   **(Stated Goals & Desired Efficiencies - Quotes/Summaries):** `[User pastes direct quotes or summaries]`
*   **(Observed Values & Self-Perception Notes):** `[User pastes analysis from interviews/language]`
*   **(Potential Beliefs Observed):** `[User pastes notes on recurring assumptions/comments]`
*   **(Observed Emotions & Potential Fears):** `[User notes emotional language used, interprets underlying fears]`
*   **(Inferred Needs & Desired Feelings):** `[User interprets core drivers based on goals/pains]`
*   **(Specific "Watering Holes" Mentioned/Observed):** `[User lists specific groups, forums, influencers, blogs]`
*   **(Observed Behavior in Watering Holes):** `[User describes typical interactions seen]`
*   **(Notes on Cost of Inaction/Ultimate Dreams):** `[User pastes relevant quotes or interpretations]`
*   **(Other Relevant Customer Research Data):** `[User pastes any other key findings]`

**[--- USER RESEARCH INPUT END ---]**

Please proceed with the analysis and provide the structured Customer Avatar Synthesis based SOLELY on the input provided.
```

---

**How this prompt works:**

1.  **Clear Role & Objective:** AI acts as a Customer Insights Analyst to synthesize user research into the Avatar structure.
2.  **Strict Data Constraint:** Emphasizes relying *only* on the provided user research, crucial for grounding the avatar in reality.
3.  **Structured Tasks:** Explicitly asks the AI to populate elements corresponding directly to the Customer Avatar Grid rows and cells.
4.  **Integration of FIND:** Explicitly asks for specific Watering Holes and behaviors within those channels (tying back to the user's FIND strategy research).
5.  **Deep Dive Encouraged:** Prompts the AI to analyze not just stated facts but also infer underlying emotions, needs, fears, and beliefs *based on the provided data*.
6.  **User Input Section:** Clearly guides the user on the types of research data to input.
7.  **Output Format:** Ensures a well-organized report mirroring the grid structure.

This prompt empowers the user to transform their raw customer research into a structured, strategically valuable Customer Avatar Profile, ready to inform the rest of the Elevate Framework implementation.