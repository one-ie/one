---
title: Analytics
description: Elevate KPIs
date: 2024-02-02
tags:
  - agents
order: 1
---
**I. Teacher/Admin Analytics Dashboard (Focus: Course Effectiveness & Student Progress)**

*   **Goal:** Understand how students are engaging with the course content, where they might be struggling, and the overall effectiveness of the training in driving *student* success (indicated by their usage and potential self-reported results).
*   **Key Metrics & KPIs:**
    *   **Enrollment Rate:** (If applicable, comparing landing page views to enrollments).
    *   **Module Completion Rates:** % of students completing each module (0-9). Identifies potential drop-off points in the course itself.
    *   **Average Time Spent per Module:** Indicates engagement level or difficulty.
    *   **Playbook Prompt Usage Rate:** (If trackable within the system) % of students actively using prompts for each module. Which prompts are most/least popular?
    *   **Worksheet/Template Download Rate:** Indicates engagement with practical tools.
    *   **Community Engagement Rate (If applicable):** Activity level, questions asked per module topic.
    *   **Support Query Volume (by Module):** Where are students most frequently asking for help?
    *   **Course Completion Rate:** % of students finishing the entire course.
    *   **CSAT/NPS (Course Specific):** Student satisfaction with the course content and structure.
    *   **Self-Reported Student Results (Qualitative/Surveys):** Case studies, testimonials, reported % increase in *their own* Ecom metrics after applying the framework.
*   **Dashboard Visualizations:**
    *   **Course Funnel:** Enrollment -> Module 1 Completion -> ... -> Module 9 Completion -> Final Project/Result.
    *   **Module Progress Bars:** Visualizing average completion across all students for each module.
    *   **Prompt Usage Heatmap:** Showing which module's prompts are used most often.
    *   **Support Ticket Trends:** Line graph showing query volume per module topic over time.
    *   **Student Testimonial Showcase:** Featuring key success stories.
*   **Integration:** Data primarily comes from the Learning Management System (LMS) or course platform, potentially combined with community platform analytics and periodic student surveys.

**II. Student Analytics Dashboard (Focus: Implementing & Optimizing *Their* Elevate Framework)**

*   **Goal:** Provide the student (Ecom Owner/Marketer using the ONE system) with clear insights into how *their* implementation of the Elevate Framework is performing for *their* business, allowing them to diagnose bottlenecks and optimize effectively. **This directly mirrors the detailed framework analytics we outlined previously.**
*   **Key Metrics & KPIs (Grouped by Elevate Level):**
    *   **ATTRACT (Hook, Gift, Identify):**
        *   Hook CTRs (by channel/angle)
        *   Gift Landing Page Conversion Rate
        *   Cost Per Lead (CPL)
        *   Overall Leads Generated
        *   Flow-Through: % Leads from Hook Clicks
    *   **CONVERT (Engage, Sell, Nurture):**
        *   Sales/Product Page Conversion Rate
        *   Add-to-Cart Rate
        *   Checkout Completion Rate
        *   Nurture Email Engagement & Conversion Rates
        *   Retargeting ROAS
        *   Assisted Conversion Rate (from Engage)
        *   Cost Per Acquisition (CPA)
        *   Overall Lead-to-Customer Conversion Rate
    *   **GROW (Upsell, Educate, Share):**
        *   Upsell Take Rate & AOV Impact
        *   Repeat Purchase Rate & Churn Rate
        *   Customer Satisfaction (CSAT/NPS)
        *   Review Generation Rate & Avg. Rating
        *   Referral Conversion Rate
        *   Customer Lifetime Value (CLTV)
*   **Dashboard Visualizations:**
    *   **Primary Elevate Funnel View:** Visualizing the flow Reach -> Leads -> Customers -> Repeat Buyers -> Advocates with key conversion rates between stages.
    *   **Level-Specific Dashboards:** Drill-downs for ATTRACT, CONVERT, GROW showing the relevant step KPIs and flow-through rates within that level.
    *   **Channel Performance Comparison:** Tables/Charts showing performance (Leads, CPL, CPA, Sales) broken down by traffic source (e.g., Facebook Ads, Google Organic, Email).
    *   **Trend Lines:** Key metrics (Leads, Sales, CPA, AOV, CLTV) over time (Week/Month/Quarter).
    *   **A/B Test Tracking Area:** A section to input and monitor results of specific tests run on Hooks, Gifts, Sell Pages, Emails etc.
*   **Integration:** **Requires the student to connect their *own* data sources.** This is the major technical challenge. Potential integrations:
    *   Google Analytics 4 (Requires proper event/goal setup by student).
    *   Ecom Platform Analytics API (Shopify, WooCommerce etc.).
    *   Ad Platform APIs (Meta, Google Ads).
    *   ESP/CRM APIs (Klaviyo, Mailchimp etc.).
    *   *(The ONE system ideally provides wizards or guides for these integrations, or uses tools like Looker Studio with connectors).*

**III. End Customer Analytics (Focus: Their Journey Experience - Visualized *for the Student*)**

*   **Goal:** Help the student visualize how *individual* or *segmented groups* of their customers are moving through the implemented Elevate Framework. **This data is primarily viewed and interpreted *by the student* via the Guide Agent or Student Dashboard.**
*   **Key Metrics & KPIs (Tracked per Customer/Segment):**
    *   **Source/Hook:** Which channel/campaign brought them in?
    *   **Gift Opt-in:** Did they receive the Gift? Which one?
    *   **Lead Status:** Identified, Engaged (Chat?), In Nurture Sequence, Purchased.
    *   **Purchase History:** First Purchase Date, Items Bought, AOV, Upsell Taken (Y/N).
    *   **Onboarding Status (Educate):** Opened Welcome Emails? Clicked Tutorial Links? (Requires ESP tracking).
    *   **Advocacy Status (Share):** Left Review? Referred Others? (Requires Review/Referral Platform integration).
    *   **Time Between Stages:** How long from Identify to Sell? How long from Sell to Repeat Purchase?
    *   **Segment Performance:** Compare journey progression for different lead segments (e.g., 'Checklist Downloaders' vs. 'Webinar Attendees').
*   **Dashboard Visualizations (Within Student's ONE System, potentially via Guide Agent):**
    *   **Customer Journey Map (Visualized):** Show the typical path/timeline customers take through the 9 steps, highlighting conversion rates and time lags.
    *   **Segment Comparison:** Side-by-side funnel views for different lead source tags or customer segments.
    *   **Individual Customer Timeline (CRM View - Future State):** See a specific customer's interaction history mapped against the Elevate steps (requires deep CRM integration).
*   **Integration:** Relies heavily on data being captured correctly with consistent tagging in the ESP/CRM (from IDENTIFY onwards) and potentially advanced integration with analytics platforms to stitch sessions together.

**Summary:**

*   **Teacher:** Focuses on course engagement and student success metrics.
*   **Student:** Focuses on *their own business performance* mapped against the Elevate Framework steps, requiring integration with *their* tools.
*   **End Customer:** Their journey is tracked and visualized *for the student* to understand flow, bottlenecks, and segment performance across the framework stages.

Implementing the **Student Dashboard** requires the most technical integration effort but provides the highest direct value by showing them the real-world impact of implementing the Elevate system on *their specific business*. The **Guide Agent** acts as the interpreter of this customer journey data for the student.