---
title: List of prompts and structure
description: 50 prompts to elevate
tags:
  - list
date: 2024-02-03
---


**1. Anatomy of a Perfect Prompt (for Elevate Ecom)**

A high-converting prompt within this system consistently includes these core components:

1.  **ROLE:** Clearly define the **expertise and perspective** the AI should adopt (e.g., "Expert Ecom Conversion Copywriter," "Data-Driven Marketing Strategist," "Empathetic Customer Success Manager specializing in SaaS onboarding"). This focuses the AI's knowledge base.
2.  **OBJECTIVE:** State the **single, specific goal** of *this particular prompt*. What tangible output or insight are you seeking? (e.g., "Generate 5 benefit-focused headlines," "Outline a 3-email nurture sequence," "Analyze customer feedback for common pain points").
3.  **CONTEXT:** This is **CRITICAL** and where the **Foundation Blueprint** is essential. Provide *all* relevant background information the AI needs:
    *   **Elevate Framework Step:** Which step (0-9) is this prompt for?
    *   **Foundation Data:** Relevant snippets about the **Company** (Brand Voice, Unique Mechanism, Offer), **Market** (Competitors, Trends), and **Customer Avatar** (Pains, Goals, Beliefs, Demographics). Be specific!
    *   **Target Audience (for the Output):** Who is the *ultimate* reader of the AI's generated content? (e.g., The Customer Avatar, Internal Team, You).
    *   **Previous Information/Constraints:** Any prior decisions, outputs from previous steps, or existing materials the AI should consider.
4.  **KEY INSTRUCTIONS / TASK DETAILS:** Provide the specific **actions, requirements, or information** the AI must incorporate or follow. Break down the task if necessary. (e.g., "Focus on these 3 benefits: [X, Y, Z]," "Incorporate this specific terminology: [...]", "Address the objection: [...]").
5.  **EXAMPLES (Optional but Powerful):** Provide 1-3 concise examples of the desired output style, format, or quality (Few-Shot Prompting). This drastically improves tone and structure alignment.
6.  **TONE & FORMAT:** Explicitly state the desired **Brand Voice** (using adjectives from your Foundation), required length, structure (e.g., bullet points, paragraphs, table, JSON), and any **negative constraints** (e.g., "Do not exceed 100 words," "Avoid overly technical jargon," "Do not mention competitors by name").

**Let's call this the R.O.C.K.E.T. Model:** **R**ole, **O**bjective, **C**ontext, **K**ey Instructions, **E**xamples, **T**one & Format.

**2. The R.O.C.K.E.T. Prompt Template**

Use this template to structure every prompt you create for the Playbook:

```markdown
### ROCKET Prompt Template

**ROLE:**
Act as [Specify AI Persona/Expertise relevant to the task. e.g., an expert Ecom email marketing strategist specializing in customer retention].

**OBJECTIVE:**
The goal of this prompt is to [Clearly state the specific, singular desired outcome. e.g., generate 3 distinct subject line options for an onboarding email focused on feature adoption].

**CONTEXT:**
*   **Framework Step:** [e.g., Step 8: EDUCATE]
*   **Company Context:** Brand Voice is [Adjective1, Adjective2, Adjective3]. Our Unique Mechanism is [Brief description]. Our core offer is [Offer Name/Type].
*   **Market Context:** [Optional: Mention relevant competitor angle or market trend if applicable to the task].
*   **Customer Avatar Context:** Target audience is [Brief Avatar Description - e.g., "established Shopify owners feeling overwhelmed by marketing tech"]. Their primary goal related to this step is [Specific Goal]. Their key pain point addressed here is [Specific Pain].
*   **Specific Situation:** [Provide any other relevant background, e.g., "This email follows the initial welcome email.", "The customer just purchased Product X.", "They clicked on Hook Y."].

**KEY INSTRUCTIONS / TASK:**
1.  [Specific instruction 1, e.g., Focus subject lines on the benefit of [Specific Benefit]].
2.  [Specific instruction 2, e.g., Incorporate a sense of curiosity or urgency].
3.  [Specific instruction 3, e.g., Ensure subject lines are under 50 characters].
4.  [Add further details, data points, or requirements].

**EXAMPLES (Optional):**
*   Example of good output 1: "[Insert concise example]"
*   Example of good output 2: "[Insert concise example]"

**TONE & FORMAT:**
*   **Tone:** Adhere strictly to the **[Adjective1, Adjective2, Adjective3]** Brand Voice.
*   **Format:** [Specify desired output structure: e.g., Numbered list, Bullet points, Paragraphs, JSON object with keys 'subject_line', 'angle'].
*   **Constraints:** [Specify negative constraints: e.g., Do not use emojis. Avoid overly salesy language. Do not mention price].
```

**3. Workflow for Creating the 100 Prompts**

1.  **Map Elevate Steps to Tasks:** Go through each module (Foundation 0 + Steps 1-9). For each step, brainstorm specific tasks where AI can assist with:
    *   **Strategy:** (e.g., Brainstorming angles, Outlining sequences, Identifying targeting parameters)
    *   **Knowledge:** (e.g., Summarizing customer feedback themes, Analyzing competitor messaging snippets provided by user, Researching potential "watering holes" - *use with caution, AI doesn't browse live web accurately*)
    *   **Content:** (e.g., Drafting headlines, emails, descriptions, social posts, scripts, FAQs)
2.  **Prioritize & Select Top 100:** Review the brainstormed list. Select the ~100 most impactful and frequently needed tasks that align with the course goals. Aim for a good distribution across all 10 modules.
3.  **Apply ROCKET Template:** For each selected task, meticulously craft a prompt using the ROCKET template.
4.  **Inject Placeholders:** Critically, ensure prompts include clear `[Placeholders]` for the user to insert their specific Foundation context (Company, Market, Customer details relevant to *that specific task*).
5.  **Refine & Categorize:** Review each prompt for clarity, specificity, and alignment with the ROCKET principles. Categorize them clearly by Elevate Framework step within the Playbook.
6.  **Add Usage Guidance:** Briefly explain the purpose of each prompt and *what specific Foundation context* the user needs to provide for optimal results.

**4. The "Prompt Rewriter" Prompt**

This is a meta-prompt designed to improve *existing* text (either AI-generated or human-written) based on specific criteria.

```markdown
### Prompt Rewriter Template

**ROLE:**
Act as an expert copy editor and marketing strategist, specializing in refining e-commerce content to align perfectly with the **[Your Brand Name]** Brand Voice and the principles of the **Elevate Ecommerce Framework**.

**OBJECTIVE:**
To revise the provided [Type of Text, e.g., email draft, ad copy, product description] to significantly improve its [Choose primary goals: e.g., clarity, conciseness, persuasiveness, alignment with Brand Voice, focus on customer benefit].

**CONTEXT:**
*   **Framework Step Context:** This text relates to Elevate Framework Step [Number]: [Step Name], aiming to achieve [Step Objective].
*   **Target Audience:** [Brief Avatar Description]. Their primary goal/pain related to this text is [Goal/Pain].
*   **Brand Voice:** Our brand voice is defined by these adjectives: **[Adjective1, Adjective2, Adjective3]**.
*   **Original Text:**
    ```
    [Paste the original text here]
    ```

**KEY INSTRUCTIONS / TASK:**
Rewrite the 'Original Text' based on the following specific instructions:
1.  Make the language more **[Specific instruction, e.g., concise and direct]**.
2.  Strengthen the focus on the primary customer benefit of **[Specific Benefit]**.
3.  Ensure the tone strictly reflects our Brand Voice: **[Adjective1, Adjective2, Adjective3]**.
4.  [Add other specific instructions, e.g., "Improve the call-to-action clarity," "Remove jargon," "Enhance the emotional connection to [Customer Feeling]"].
5.  Identify any parts that seem misaligned with the objective of Step [Number].

**EXAMPLES (Optional):**
*   Optional: Provide a "Before/After" example of text you've previously refined to match the Brand Voice.

**TONE & FORMAT:**
*   **Tone:** Maintain the core message but elevate the style and impact according to instructions.
*   **Format:** Provide the fully rewritten, revised text. Optionally, you can ask for brief comments explaining key changes made: "Provide the revised text below, followed by a short bulleted list explaining the 2-3 most significant changes you made and why."
*   **Constraints:** Do not introduce new information not present or implied in the original context. Adhere to any length constraints if mentioned for the original text type.
```

**5. List of Prompts (Sample Structure & Examples - Not Exhaustive 100)**

Here's how you'd structure the list within the Playbook, showing *examples* using the ROCKET framework implicitly (Titles are concise for the user):

---

**AI Prompt Playbook - Sample Entries**

**Module 0: Foundation Assistance Prompts**

*   `Prompt F1: Define Unique Mechanism Options`
    *   *(Objective: Draft descriptions of core differentiator. Context: Company info. Task: Generate options. Format: List)*
*   `Prompt F2: Brainstorm Brand Voice Adjectives`
    *   *(Objective: Suggest relevant voice words. Context: Values, desired feel. Task: Brainstorm list. Format: List)*
*   `Prompt F3: Draft Value Proposition Statements`
    *   *(Objective: Create clear value statements. Context: Offer, DO, Pain, Mechanism. Task: Draft variations. Format: List)*
*   `Prompt F4: Outline Customer Avatar Pains/Goals`
    *   *(Objective: Expand on initial customer insights. Context: Basic avatar info. Task: Brainstorm related pains/goals. Format: Bullet points)*
*   `Prompt F5: Identify Competitor Messaging Themes`
    *   *(Objective: Analyze user-provided competitor text. Context: Competitor copy. Task: Summarize themes/weaknesses. Format: Report)*
*   `Prompt F6: Brainstorm Potential "Watering Holes"`
    *   *(Objective: Suggest relevant online locations. Context: Niche, initial avatar ideas. Task: List platforms/groups. Format: List)* *(Requires User Verification)*

**Module 1: HOOK (Step 1) Prompts**

*   `Prompt H1: Pain-Focused Ad Headlines`
    *   *(Objective: Generate headlines targeting pain. Context: Foundation (Pain, Avatar, Voice, Channel). Task: Draft headlines. Format: Numbered List)*
*   `Prompt H2: Benefit-Focused Content Titles (SEO)`
    *   *(Objective: Create SEO-friendly titles focused on goals. Context: Foundation (Goal, Avatar, Keywords), Topic. Task: Draft titles. Format: List)*
*   `Prompt H3: Intrigue-Based Social Media Openers`
    *   *(Objective: Draft curiosity-driven opening lines for social. Context: Foundation (Beliefs, Mechanism, Voice), Platform. Task: Generate openers. Format: List)*
*   `Prompt H4: Video Script Hook Ideas (First 5 Secs)`
    *   *(Objective: Outline visual/verbal hooks for video. Context: Chosen Angle, Foundation Data. Task: Provide 3 concepts. Format: Bullet points)*

**Module 2: GIFT (Step 2) Prompts**

*   `Prompt G1: Gift Idea Brainstorming (Based on Pain)`
*   `Prompt G2: Checklist Content Point Drafts`
*   `Prompt G3: Gift Landing Page Headline & Bullets`
*   `Prompt G4: Ad Body Copy (Act 2 - Introducing Gift)`
*   `Prompt G5: Gift Delivery Email Copy`

**(Continue this structure for Modules 3-9, creating ~10 diverse prompts per module covering Strategy, Knowledge, and Content needs for that specific step...)**

---

This detailed approach provides the anatomy, template, workflow, and rewriter needed, setting a clear path for generating the full list of 100 high-quality prompts tailored to the Elevate Ecommerce Framework.