# ONE Platform Privacy Policy

**Effective Date:** October 16, 2025
**Last Updated:** October 16, 2025
**Version:** 1.0.0

## 1. Introduction

Welcome to ONE Platform ("we," "us," or "our"). This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our AI-native platform available at https://one.ie and through our CLI tool `npx oneie` (collectively, the "Platform").

**ONE Platform is built on a 6-dimension ontology** that models reality through Groups, People, Things, Connections, Events, and Knowledge. This privacy policy is structured to map directly to this architecture, ensuring transparency about exactly where and how your data flows through our system.

**Key Privacy Commitments:**
- **Data Sovereignty:** You own your data. Period.
- **Group Isolation:** Your group's data is completely isolated from other groups
- **Local-First Option:** Run ONE locally with 100% data ownership
- **Transparent Architecture:** Every data flow maps to our 6-dimension ontology
- **GDPR, CCPA, and PIPEDA Compliant:** Built with privacy-by-design principles

---

## 2. Ontology-Aligned Privacy Framework

### 2.1 Dimension 1: GROUPS (Multi-Tenant Isolation)

**What We Collect:**
- Group slug (URL identifier)
- Group name and type (friend_circle, business, community, dao, government, organization)
- Parent group relationships (for hierarchical structures)
- Group settings (visibility, join policy, plan level)
- Resource usage (users, storage, API calls)

**Legal Basis:**
- **Contract Performance:** Processing necessary to provide multi-tenant services
- **Legitimate Interest:** Group administration and resource management

**Data Controller:**
- **Platform-level groups:** ONE Platform (Anthony O'Connell) is the data controller
- **Customer groups:** Group owner is the data controller; ONE Platform is the data processor

**Isolation Guarantee:**
All data within a group (things, connections, events, knowledge) is isolated from other groups. Group owners control access to their group's data.

**Hierarchical Access:**
Parent groups CAN access child group data (configurable). This must be disclosed in your group settings if enabled.

### 2.2 Dimension 2: PEOPLE (Authorization & User Identity)

**What We Collect:**
- **Account Information:** Email address, username, display name
- **Authentication Data:** Password hash (bcrypt), session tokens, OAuth tokens (encrypted)
- **Role Information:** platform_owner, group_owner, group_user, customer
- **Profile Data:** Bio, avatar URL, preferences
- **Authorization Records:** Group memberships, permissions

**Legal Basis:**
- **Contract Performance:** Account creation and authentication
- **Consent:** Profile information and preferences
- **Legal Obligation:** Identity verification (where required by law)

**Four Role Types & Privacy Implications:**

1. **Platform Owner:**
   - Can access all groups for support/debugging (with audit logging)
   - Subject to confidentiality agreements and data protection obligations

2. **Group Owner:**
   - Data controller for their group
   - Responsible for compliance within their group
   - Must provide privacy notice to group users

3. **Group User:**
   - Data shared within group per group owner's policies
   - Can request data export/deletion from group owner

4. **Customer:**
   - External user; data processed per this policy
   - Limited to transactional and engagement data

**Authentication Methods & Data Collection:**

| Method | Data Collected | Retention |
|--------|----------------|-----------|
| Email/Password | Email, password hash, verification status | Account lifetime |
| OAuth (GitHub, Google) | Provider account ID, access tokens (encrypted), profile data | Account lifetime |
| Magic Links | Email, one-time token | 15 minutes (auto-expires) |
| Password Reset | Email, reset token | 30 minutes (auto-expires) |
| 2FA (TOTP) | Secret key (encrypted), backup codes | Until disabled |

### 2.3 Dimension 3: THINGS (Entities)

**66 Entity Types We Process:**

**Core Entities:**
- `creator`: Creator profiles (email, username, niche, expertise, brand colors, audience metrics)
- `ai_clone`: AI clones (voice ID, appearance ID, system prompts, knowledge base, interaction metrics)
- `audience_member`: Customer profiles (engagement data, purchase history)
- `organization`: Organization entities linked to groups

**Business Agent Entities (10 types):**
- All agent types (strategy, research, marketing, sales, service, design, engineering, finance, legal, intelligence)
- Data: Agent configurations, execution logs, performance metrics

**Content Entities:**
- `blog_post`, `video`, `podcast`, `social_post`, `email`, `course`, `lesson`
- Data: Content body, metadata, engagement metrics

**Product Entities:**
- `digital_product`, `membership`, `consultation`, `nft`
- Data: Product details, pricing, inventory

**Token Entities:**
- `token`, `token_contract`
- Data: Contract address, blockchain network, balances, transaction history

**Knowledge Entities:**
- `knowledge_item`, `embedding`
- Data: Text content, vector embeddings, semantic metadata

**External Integration Entities:**
- `external_agent`, `external_workflow`, `external_connection`
- Data: API endpoints, credentials (encrypted), webhook URLs

**Legal Basis:**
- **Contract Performance:** Creating and managing entities per user instructions
- **Legitimate Interest:** Platform functionality and AI agent operation
- **Consent:** AI clones and automated content generation

**Data Minimization:**
We only collect entity properties necessary for the requested functionality. All entity data inherits the group's access controls.

### 2.4 Dimension 4: CONNECTIONS (Relationships)

**25 Relationship Types We Track:**

**Ownership & Authorship:**
- `owns`, `created_by`, `authored`
- Purpose: Establish intellectual property and access rights

**AI Relationships:**
- `clone_of`, `trained_on`, `powers`
- Purpose: Track AI clone training data and operational relationships

**Social Relationships:**
- `member_of`, `following`, `moderates`, `participated_in`
- Purpose: Community features and engagement tracking

**Financial Relationships:**
- `holds_tokens`, `purchased`, `enrolled_in`, `transacted`
- Purpose: Token balances, purchase records, revenue tracking

**Consolidated Relationships (with metadata):**
- `communicated`, `delegated`, `approved`, `fulfilled`, `notified`, `referred`
- Purpose: Cross-protocol integrations and workflow automation

**Legal Basis:**
- **Contract Performance:** Relationship tracking for platform functionality
- **Legitimate Interest:** Analytics, recommendations, and fraud prevention

**Data Retention:**
Relationships are retained as long as both entities exist and the relationship is active. Historical relationships may be archived (soft-deleted) but not physically deleted for audit purposes.

### 2.5 Dimension 5: EVENTS (Audit Trail)

**67 Event Types We Log:**

**Authentication Events (6 types):**
- password_reset_requested, password_reset_completed, email_verification_sent, email_verified, two_factor_enabled, two_factor_disabled
- Purpose: Security audit trail, fraud prevention
- Retention: 90 days (security events), 1 year (compliance events)

**User Activity Events (9 types):**
- user_registered, user_login, user_logout, profile_updated, dashboard_viewed, settings_updated, theme_changed
- Purpose: User experience, security monitoring
- Retention: 30 days (activity logs), indefinite (registration events)

**Group Events (5 types):**
- group_created, group_updated, user_invited_to_group, user_joined_group, user_removed_from_group
- Purpose: Group administration audit trail
- Retention: 7 years (compliance requirement)

**Financial Events (7 types):**
- tokens_purchased, tokens_transferred, payment_processed, subscription_updated
- Purpose: Financial records, tax compliance, fraud prevention
- Retention: 7 years (legal requirement)

**Content Events:**
- content_created, content_updated, content_deleted, content_viewed, content_shared
- Purpose: Content management, analytics, copyright enforcement
- Retention: 1 year (analytics), indefinite (creation/deletion records)

**AI & Agent Events:**
- clone_created, agent_executed, inference_request, inference_completed
- Purpose: AI operation monitoring, usage billing, debugging
- Retention: 30 days (execution logs), 1 year (creation records)

**Blockchain Events (5 types):**
- nft_minted, nft_transferred, tokens_bridged, contract_deployed, treasury_withdrawal
- Purpose: On-chain activity reconciliation
- Retention: Indefinite (permanent blockchain record)

**Legal Basis:**
- **Legal Obligation:** Financial and authentication events (tax, anti-fraud)
- **Legitimate Interest:** Security monitoring, debugging, analytics
- **Contract Performance:** Usage tracking for billing

**Event Metadata:**
Events include:
- Actor ID (who performed the action)
- Target ID (what was affected)
- Timestamp (when it occurred)
- Metadata (action-specific details)
- IP address (for security events)
- User agent (for session events)

**Event Retention Policy:**
- **Hot storage (30-90 days):** Fast query access, full indexing
- **Warm storage (90-365 days):** Restricted queries, compliance retention
- **Cold archive (>365 days):** Data warehouse, batch query only
- **Permanent retention:** Financial transactions, blockchain events, account creation/deletion

### 2.6 Dimension 6: KNOWLEDGE (RAG & Semantic Search)

**Knowledge Types:**
- **Labels:** Categorization tags (industry, skill, topic, format, audience)
- **Documents:** Full-text content (blog posts, course transcripts, product descriptions)
- **Chunks:** Text segments with embeddings (800-token windows, 200-token overlap)
- **Vectors:** Semantic embeddings (text-embedding-3-large or equivalent)

**What We Collect:**
- **Text Content:** Extracted from your entities for RAG indexing
- **Vector Embeddings:** Numerical representations for semantic search
- **Source Metadata:** Link to source entity, field name, chunk index
- **Labels:** User-defined or AI-suggested categorization tags

**Embedding Models:**
- Default: OpenAI `text-embedding-3-large` (3072 dimensions)
- Configurable per group (stored in metadata)
- No training data is sent to embedding providers beyond the text being embedded

**Privacy-Preserving Modes:**
- **Standard mode:** Text + embeddings stored
- **Vector-only mode:** Embeddings only, no text (for sensitive content)
- **Local mode:** Self-hosted embeddings, no external API calls

**Legal Basis:**
- **Consent:** AI-powered search and recommendations
- **Legitimate Interest:** Platform functionality and user experience

**Data Retention:**
- Knowledge items are retained while the source entity exists
- Orphaned knowledge (source entity deleted) is garbage collected after 30 days
- Embeddings can be regenerated from source text (versioned by hash)

**User Rights:**
- Request deletion of all knowledge items linked to your entities
- Opt out of AI-powered features (disables embedding generation)
- Export all knowledge data in machine-readable format (JSON)

---

## 3. Third-Party Service Providers

We use the following service providers to operate the Platform:

### 3.1 Infrastructure Providers

**Convex (Database & Real-Time Backend)**
- Service: Real-time database, serverless functions
- Data Shared: All platform data (6-dimension ontology)
- Location: United States (AWS us-east-1)
- Purpose: Core platform infrastructure
- Privacy Policy: https://www.convex.dev/privacy
- Safeguards: SOC 2 Type II, encryption at rest and in transit, GDPR-compliant

**Cloudflare (Hosting & CDN)**
- Service: Web hosting, edge computing, DDoS protection
- Data Shared: Web traffic data, session cookies, IP addresses
- Location: Global edge network (150+ countries)
- Purpose: Website hosting and performance optimization
- Privacy Policy: https://www.cloudflare.com/privacypolicy/
- Safeguards: EU-US Data Privacy Framework, ISO 27001, GDPR-compliant

### 3.2 AI Service Providers

**OpenAI (AI Inference)**
- Service: GPT models for AI agents and content generation
- Data Shared: User prompts, entity data for AI processing
- Location: United States
- Purpose: AI clone conversations, content generation, AI agents
- Privacy Policy: https://openai.com/privacy
- Safeguards: Zero data retention (API mode), no training on customer data
- **Important:** We use OpenAI API with zero data retention. Your data is NOT used to train OpenAI models.

**ElevenLabs (Voice Cloning)**
- Service: Voice synthesis and cloning
- Data Shared: Audio files for voice cloning (when requested)
- Location: United States
- Purpose: AI clone voice generation
- Privacy Policy: https://elevenlabs.io/privacy
- **User Control:** Voice cloning is opt-in only. You explicitly upload audio files.

### 3.3 Authentication Providers

**Better Auth (Authentication Service)**
- Service: Multi-method authentication (email/password, OAuth, magic links, 2FA)
- Data Shared: Email addresses, password hashes, OAuth tokens, session data
- Location: Convex infrastructure (US)
- Purpose: User authentication and session management
- **Safeguards:** bcrypt password hashing, encrypted token storage, rate limiting

**OAuth Providers (GitHub, Google)**
- Service: Third-party authentication
- Data Shared: OAuth tokens, profile data (name, email, avatar)
- Purpose: Simplified sign-in
- Privacy Policies:
  - GitHub: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement
  - Google: https://policies.google.com/privacy
- **User Control:** OAuth is optional. You can use email/password authentication instead.

### 3.4 Payment Processing

**Stripe (Payment Gateway)**
- Service: Credit card processing, subscription billing
- Data Shared: Email, payment method, billing address, purchase amounts
- Location: United States (GDPR-compliant)
- Purpose: Payment processing for tokens, courses, subscriptions
- Privacy Policy: https://stripe.com/privacy
- Safeguards: PCI DSS Level 1 certified, tokenized payment storage
- **Important:** We do NOT store credit card numbers. Stripe handles all payment data.

**Blockchain Networks (Cryptocurrency Payments)**
- Networks: Base, Ethereum, Polygon (via X402 protocol)
- Data Shared: Wallet addresses, transaction hashes (public blockchain data)
- Purpose: Cryptocurrency payments, token minting, NFT sales
- **Important:** Blockchain transactions are public and permanent. Wallet addresses are pseudonymous but not anonymous.

### 3.5 Email Service

**Resend (Transactional Email)**
- Service: Email delivery (password resets, verifications, notifications)
- Data Shared: Email addresses, email content
- Location: United States
- Purpose: Transactional emails (no marketing)
- Privacy Policy: https://resend.com/legal/privacy-policy
- Safeguards: Encrypted in transit (TLS), no email tracking by default

### 3.6 External Integrations (Optional)

**ElizaOS, n8n, Zapier, Make (Workflow Automation)**
- Service: External agent and workflow integrations
- Data Shared: API endpoints, authentication tokens, workflow data (per user configuration)
- Purpose: Agent-to-agent communication (A2A protocol), workflow automation
- **User Control:** These integrations are opt-in only. You choose which external services to connect.
- **Encryption:** API keys and tokens are encrypted at rest using AES-256

**Note on Data Processors:**
All third-party service providers are contractually required to:
- Process data only per our instructions
- Implement appropriate security measures
- Not use data for their own purposes
- Comply with GDPR, CCPA, and PIPEDA requirements
- Notify us immediately of any data breaches

---

## 4. Data Collection Methods

### 4.1 Direct User Input
- **Account Registration:** Email, username, password, role selection
- **Profile Creation:** Display name, bio, avatar, niche/expertise (for creators)
- **Content Creation:** Blog posts, videos, courses, social posts, products
- **AI Clone Training:** Audio files for voice cloning, personality prompts, knowledge base
- **Settings & Preferences:** Theme, language, notification settings, dashboard layout

### 4.2 Automated Collection
- **Session Data:** Login timestamps, IP addresses, user agents, session duration
- **Usage Analytics:** Page views, feature usage, API call counts, error logs
- **Performance Monitoring:** Response times, error rates, resource usage
- **Security Logs:** Failed login attempts, suspicious activity, rate limit violations

### 4.3 Cookies & Tracking Technologies

**Essential Cookies:**
| Cookie Name | Purpose | Duration | Type |
|-------------|---------|----------|------|
| `better_auth_session` | Session authentication | Session | HTTP-only, Secure, SameSite=Lax |
| `theme` | Dark/light mode preference | 1 year | Persistent |
| `convex_client_id` | Real-time connection | Session | Secure |

**No Tracking Cookies:**
We do NOT use:
- Google Analytics
- Facebook Pixel
- Third-party advertising trackers
- Cross-site tracking cookies

**Local Storage:**
We store the following in browser local storage:
- UI preferences (sidebar state, view mode)
- Draft content (auto-save)
- Theme settings

**User Control:**
You can clear all cookies and local storage through your browser settings. This will log you out and reset preferences.

---

## 5. How We Use Your Data

### 5.1 Core Platform Functions
- **Authentication:** Verify your identity and maintain secure sessions
- **Authorization:** Enforce role-based access controls (4 roles)
- **Multi-Tenancy:** Isolate your group's data from other groups
- **Content Management:** Store and serve your created content
- **AI Agents:** Power AI clones, business agents, and automation workflows
- **Token Economy:** Track token balances, purchases, and transfers
- **Course Platform:** Manage enrollments, track progress, issue certificates

### 5.2 AI-Powered Features
- **AI Clones:** Generate personalized responses using your training data
- **Content Generation:** Create blog posts, social media content, courses
- **Semantic Search:** Find relevant content using vector embeddings (RAG)
- **Business Agents:** Execute automated tasks (marketing, sales, support, etc.)
- **Recommendations:** Suggest content, connections, and opportunities

**AI Training Disclaimer:**
- We use OpenAI API in zero data retention mode
- Your data is NOT used to train OpenAI models
- AI clones are trained ONLY on data you explicitly provide
- You can delete AI clone training data at any time

### 5.3 Analytics & Insights
- **Usage Analytics:** Understand platform usage to improve features
- **Performance Monitoring:** Identify and fix bugs, optimize speed
- **Business Intelligence:** Generate insights for group owners (revenue, engagement, growth)
- **Fraud Prevention:** Detect and prevent abuse, spam, and fraud

### 5.4 Communication
- **Transactional Emails:** Password resets, email verifications, purchase confirmations
- **Notifications:** In-app alerts for mentions, replies, purchases, agent actions
- **Product Updates:** Major feature announcements (opt-in only)
- **Support:** Respond to customer inquiries and provide technical assistance

**Marketing Communications:**
- We do NOT send unsolicited marketing emails
- Product update emails are opt-in only
- You can unsubscribe from all non-essential emails

### 5.5 Legal & Compliance
- **Legal Obligations:** Comply with GDPR, CCPA, PIPEDA, tax laws, anti-fraud regulations
- **Dispute Resolution:** Investigate and resolve disputes between users
- **Law Enforcement:** Respond to valid legal requests (with notice to you, unless prohibited)
- **Safety & Security:** Prevent illegal activity, protect user safety

---

## 6. Data Sharing & Disclosure

### 6.1 Within Your Group
- **Group Owners** can access all data within their group
- **Group Users** can access data per permissions granted by group owner
- **Platform Owner** can access group data for support/debugging (with audit logging)

### 6.2 Public Information
The following information is PUBLIC by default (visible to all users):
- Public groups (name, description, member count)
- Published content (blog posts, courses, if set to public)
- Public creator profiles (username, display name, bio, avatar)
- Token contracts (blockchain addresses, supply, prices)

**Privacy Controls:**
- Groups can be set to private (invite-only, hidden from search)
- Content can be set to private (group-only, draft, or unlisted)
- Profiles can be made private (hidden from public search)

### 6.3 Third-Party Service Providers
As detailed in Section 3, we share data with:
- Infrastructure providers (Convex, Cloudflare)
- AI providers (OpenAI, ElevenLabs) - zero retention mode
- Payment processors (Stripe, blockchain networks)
- Email service (Resend)
- Optional integrations (ElizaOS, n8n, etc.)

**Data Processing Agreements:**
All service providers are bound by data processing agreements that comply with GDPR Article 28.

### 6.4 Legal Requirements
We may disclose your data if required by law:
- **Valid legal process:** Court orders, subpoenas, search warrants
- **Emergency situations:** Imminent threats to safety or security
- **Regulatory compliance:** Tax authorities, financial regulators

**Notice Requirement:**
Unless legally prohibited, we will:
- Notify you of legal requests for your data
- Give you 14 days to contest the request (if legally permissible)
- Disclose only the minimum data necessary

### 6.5 Business Transfers
In the event of a merger, acquisition, or sale of assets:
- We will notify you via email and in-app notification
- Your data will remain subject to this privacy policy (or equivalent protections)
- You will have the option to delete your account before the transfer

### 6.6 We DO NOT Sell Your Data
- We do NOT sell personal data to third parties
- We do NOT share data with advertisers
- We do NOT use your data for targeted advertising
- We do NOT create "shadow profiles" or cross-site tracking

---

## 7. Data Security

### 7.1 Technical Safeguards

**Encryption:**
- **In Transit:** TLS 1.3 for all data transmission
- **At Rest:** AES-256 encryption for database storage
- **Credentials:** bcrypt for passwords, AES-256 for OAuth tokens and API keys

**Access Controls:**
- Role-based access control (RBAC) per 6-dimension ontology
- Multi-factor authentication (TOTP) available for all accounts
- Session expiry (14 days max, configurable)
- Rate limiting (brute force protection)

**Infrastructure Security:**
- SOC 2 Type II certified infrastructure (Convex)
- ISO 27001 certified hosting (Cloudflare)
- DDoS protection and web application firewall (Cloudflare)
- Automated security patching and updates

**Code Security:**
- TypeScript strict mode (compile-time type safety)
- Input validation and sanitization (all user inputs)
- Content Security Policy (CSP) headers
- Subresource Integrity (SRI) for external scripts

### 7.2 Organizational Safeguards

**Access Restrictions:**
- Platform owner access is logged and auditable
- Support access requires explicit user consent (when possible)
- Minimum necessary access principle for all staff
- Background checks for employees with data access

**Security Training:**
- Annual security awareness training for all staff
- Secure coding practices and code review
- Incident response drills

**Audit & Monitoring:**
- Automated anomaly detection
- Security audit logs retained for 1 year
- Regular penetration testing (annual)
- Vulnerability disclosure program

### 7.3 Data Breach Response

**Notification Timeline:**
- **Internal detection:** Automated alerts + manual monitoring
- **Investigation:** Within 24 hours of detection
- **User notification:** Within 72 hours (GDPR requirement)
- **Regulatory notification:** As required by law

**Breach Notification Will Include:**
- Nature of the breach (what data was affected)
- Likely consequences and risks
- Measures taken to mitigate harm
- Contact information for questions

**User Actions:**
If a breach affects your account, we will:
- Force password reset (if credentials compromised)
- Invalidate all sessions
- Offer identity theft protection (if financial data compromised)
- Provide credit monitoring (if applicable)

---

## 8. Data Retention

### 8.1 Active Account Data
Data is retained while your account is active and for the periods specified below:

| Data Type | Retention Period | Legal Basis |
|-----------|------------------|-------------|
| **Account Data** | Account lifetime | Contract performance |
| **Profile Data** | Account lifetime + 30 days | Contract performance |
| **Authentication Logs** | 90 days | Security monitoring |
| **Session Data** | 14 days after session end | Security monitoring |
| **Content (entities)** | Account lifetime or until deleted | Contract performance |
| **Financial Transactions** | 7 years after transaction | Legal obligation (tax) |
| **Event Logs (general)** | 30-365 days (tiered) | Legitimate interest |
| **Event Logs (compliance)** | 7 years | Legal obligation |
| **Blockchain Transactions** | Permanent (immutable) | Technical necessity |
| **Knowledge/Embeddings** | Until source entity deleted + 30 days | Contract performance |
| **OAuth Tokens** | Until revoked or 90 days inactive | Security monitoring |
| **Password Reset Tokens** | 30 minutes | Security monitoring |
| **Email Verification Tokens** | 24 hours | Security monitoring |
| **Magic Link Tokens** | 15 minutes | Security monitoring |

### 8.2 Account Deletion
When you delete your account:
- **Immediate deletion:** Profile data, session data, preferences
- **30-day grace period:** Content (entities, connections, events) - recoverable
- **Permanent deletion (after 30 days):** All account data (except legal holds)
- **Retained indefinitely:** Anonymized analytics, financial transaction records (legal requirement)

**Cascading Deletion:**
Deleting your account triggers:
1. All entities you own are deleted
2. Connections involving your entities are removed
3. Events where you are the actor remain (actor anonymized)
4. Knowledge items linked to your entities are garbage collected
5. Group memberships are removed

**Group Owner Deletion:**
If you are a group owner, you must:
- Transfer group ownership to another user, OR
- Delete all group data and close the group

### 8.3 Backup Retention
- **Backup frequency:** Daily incremental, weekly full
- **Backup retention:** 30 days for incremental, 1 year for full
- **Backup security:** Encrypted with separate keys, geographically distributed
- **Backup deletion:** Your data is removed from backups after retention period

---

## 9. Your Privacy Rights

### 9.1 GDPR Rights (EU/EEA/UK Residents)

**Right to Access (Article 15):**
- Request a copy of all personal data we hold about you
- Receive data in machine-readable format (JSON export)
- Timeline: Within 30 days of request

**Right to Rectification (Article 16):**
- Correct inaccurate or incomplete personal data
- Update profile, settings, preferences at any time
- Timeline: Immediate (self-service) or within 30 days (upon request)

**Right to Erasure / "Right to be Forgotten" (Article 17):**
- Delete your account and all associated data
- Exceptions: Legal obligations (financial records), legitimate interests (fraud prevention)
- Timeline: 30 days grace period, then permanent deletion

**Right to Restriction of Processing (Article 18):**
- Temporarily restrict processing while disputing accuracy or legality
- Account suspension (processing halted except storage)
- Timeline: Within 72 hours of request

**Right to Data Portability (Article 20):**
- Export all your data in JSON format
- Includes: Account data, entities, connections, events, knowledge
- Transfer directly to another service (if technically feasible)
- Timeline: Within 30 days of request

**Right to Object (Article 21):**
- Object to processing based on legitimate interests
- Object to automated decision-making (AI agents)
- Absolute right to object to direct marketing
- Timeline: Processing stops immediately upon objection (unless compelling legal grounds)

**Right to Withdraw Consent (Article 7):**
- Withdraw consent for AI features, email communications, optional integrations
- Does not affect lawfulness of processing before withdrawal
- Timeline: Immediate

**Right to Lodge a Complaint (Article 77):**
- You have the right to complain to your local Data Protection Authority
- Ireland (ONE Platform HQ): Data Protection Commission (https://www.dataprotection.ie)
- EU/EEA: https://edpb.europa.eu/about-edpb/board/members_en

**How to Exercise GDPR Rights:**
- Email: privacy@one.ie
- In-app: Settings → Privacy → Data Rights
- Required info: Account email, specific request, identity verification

### 9.2 CCPA Rights (California Residents)

**Right to Know (§1798.100):**
- Categories of personal information collected
- Sources of personal information
- Business purposes for collection
- Third parties with whom we share data
- Specific pieces of personal information collected
- Timeline: Within 45 days of verifiable request

**Right to Delete (§1798.105):**
- Delete personal information we collected from you
- Exceptions: Legal obligations, security, fraud prevention
- Timeline: 30 days grace period, then permanent deletion

**Right to Opt-Out of Sale (§1798.120):**
- **We do NOT sell personal information** (as defined by CCPA)
- We do NOT share data for cross-context behavioral advertising
- No opt-out required (we don't engage in these practices)

**Right to Non-Discrimination (§1798.125):**
- We will NOT discriminate against you for exercising CCPA rights
- No denial of goods/services, different prices, or degraded experience

**California Shine the Light Law (§1798.83):**
- We do NOT share personal information with third parties for direct marketing

**How to Exercise CCPA Rights:**
- Email: ccpa@one.ie
- Phone: +1 (555) ONE-PRIV [placeholder - update when available]
- In-app: Settings → Privacy → California Privacy Rights
- Required info: Name, email, residency verification, specific request

**Authorized Agent:**
You may designate an authorized agent to make requests on your behalf. We require:
- Signed permission from you
- Identity verification for both you and the agent

### 9.3 PIPEDA Rights (Canadian Residents)

**Right to Access:**
- Request access to all personal information we hold about you
- Receive explanation of how information is used
- Timeline: Within 30 days of request

**Right to Correct:**
- Correct inaccurate or outdated personal information
- Append a statement if correction is refused
- Timeline: Within 30 days of request

**Right to Withdraw Consent:**
- Withdraw consent for optional processing (AI features, marketing)
- Inform you of implications of withdrawal
- Timeline: Immediate

**Right to Challenge Compliance:**
- Challenge our compliance with PIPEDA
- File complaint with Privacy Commissioner of Canada
- Contact: https://www.priv.gc.ca/en/

**How to Exercise PIPEDA Rights:**
- Email: privacy@one.ie
- In-app: Settings → Privacy → Canadian Privacy Rights
- Required info: Account email, specific request, identity verification

### 9.4 Other Jurisdictions

**Australian Residents (Privacy Act 1988):**
- Rights similar to GDPR (access, correction, erasure)
- Complaint to Office of the Australian Information Commissioner (OAIC)

**Brazilian Residents (LGPD):**
- Rights similar to GDPR
- Complaint to Autoridade Nacional de Proteção de Dados (ANPD)

**How to Exercise Rights:**
Email privacy@one.ie with your location and specific request.

---

## 10. Children's Privacy

**Age Requirement:**
ONE Platform is NOT directed at children under 13 (or 16 in the EU/EEA).

**Parental Consent:**
If you are under 18, you must have parental consent to use the Platform.

**Special Protections:**
- We do NOT knowingly collect data from children under 13 (US) or 16 (EU)
- We do NOT target advertising to children
- We do NOT create AI clones of children's voices or images

**If We Learn of Child Data Collection:**
- We will delete the account immediately
- We will notify parents/guardians (if identifiable)
- We will not retain any data from the account

**Reporting:**
If you believe we have collected data from a child, contact: privacy@one.ie with subject line "Child Privacy Concern".

---

## 11. International Data Transfers

**Data Location:**
- Primary infrastructure: United States (Convex - AWS us-east-1, Cloudflare global edge)
- Backup infrastructure: Geographically distributed (EU and US regions)
- Local deployment option: Self-host on your own infrastructure (100% data sovereignty)

**Transfer Mechanisms:**
- **EU-US Data Privacy Framework:** Convex and Cloudflare participate
- **Standard Contractual Clauses (SCCs):** EU Commission-approved SCCs for all EU data transfers
- **UK International Data Transfer Agreement (IDTA):** For UK data transfers
- **Binding Corporate Rules (BCRs):** For intra-company transfers (when applicable)

**Adequacy Decisions:**
We rely on EU Commission adequacy decisions for transfers to:
- United Kingdom
- Switzerland
- Canada (commercial organizations)

**Supplementary Measures:**
For transfers without adequacy decisions, we implement:
- Encryption in transit and at rest
- Access controls and authentication
- Regular security audits
- Data minimization
- Pseudonymization where possible

**User Control:**
- **Local mode:** Self-host ONE Platform on your own servers (no international transfers)
- **EU-only mode:** Request EU-only data processing (available for Enterprise plan)

---

## 12. Automated Decision-Making & AI

**Automated Processing:**
ONE Platform uses AI for:
- Content generation (blog posts, social media, courses)
- AI clone responses (conversational AI)
- Business agent actions (automated workflows)
- Recommendation systems (content, connections, products)
- Fraud detection (transaction monitoring)

**No Solely Automated Legal Decisions:**
We do NOT make solely automated decisions that produce legal effects or similarly significantly affect you. Examples of what we DON'T do:
- Automated loan approvals
- Automated employment decisions
- Automated credit scoring
- Automated legal determinations

**AI Transparency:**
- All AI-generated content is labeled as such
- AI clone responses identify themselves as AI
- Business agent actions are logged and auditable
- Recommendation explanations available on request

**Human Oversight:**
- Group owners can override AI agent actions
- Platform owner monitors AI systems for bias and errors
- Users can dispute AI decisions (contact: ai-dispute@one.ie)

**Your Rights:**
- **Right to object:** Opt out of AI-powered features (Settings → Privacy → AI Features)
- **Right to explanation:** Request explanation of AI decisions
- **Right to human review:** Request human review of AI actions
- **Right to deletion:** Delete all AI training data

**AI Ethics Commitments:**
- No bias discrimination based on protected characteristics
- Transparent AI operations (no "black box" decisions)
- User control over AI features (opt-in for sensitive AI uses)
- Regular bias audits of AI systems

---

## 13. Group Owner Responsibilities (Data Controller Obligations)

If you are a **group owner**, you are the **data controller** for your group's data. You have the following responsibilities:

### 13.1 Provide Privacy Notice to Group Users
- Inform group users how their data will be used within your group
- Explain what data is shared within the group
- Disclose any third-party integrations (external agents, workflows)

### 13.2 Obtain Consent
- Obtain explicit consent for AI features (AI clones, content generation)
- Obtain consent for external integrations (ElizaOS, n8n, etc.)
- Obtain consent for data sharing with parent groups (if hierarchical)

### 13.3 Respond to Data Subject Requests
- Handle access, rectification, erasure requests from group users
- Coordinate with ONE Platform for technical implementation
- Document all requests and responses

### 13.4 Implement Security Measures
- Enforce strong password policies
- Enable 2FA for sensitive roles
- Review access logs regularly
- Report security incidents to ONE Platform

### 13.5 Data Processing Agreement
By creating a group, you agree to:
- Process group user data only for legitimate business purposes
- Implement appropriate security measures
- Not share group data outside the group without consent
- Comply with GDPR, CCPA, PIPEDA (as applicable)

**Platform Support:**
ONE Platform provides:
- Technical infrastructure for data protection
- Self-service tools for data subject requests
- Audit logs and compliance reports
- Security best practices documentation

**Contact for Group Owner Support:**
Email: group-owners@one.ie

---

## 14. Changes to This Privacy Policy

**Notification:**
We will notify you of material changes to this privacy policy by:
- Email notification to all registered users (14 days before changes take effect)
- In-app notification banner
- Update to "Last Updated" date at top of this policy
- Changelog at bottom of this policy (for transparency)

**Material Changes Include:**
- New data collection categories
- New third-party service providers
- Changes to data sharing practices
- Changes to retention periods
- Changes to international data transfers

**Non-Material Changes:**
- Clarifications or formatting improvements
- Updated contact information
- New regulatory references
- Administrative updates

**Your Options:**
- **Accept changes:** Continue using the Platform
- **Reject changes:** Delete your account within 30 days of notification (before changes take effect)
- **Request clarification:** Contact privacy@one.ie with questions

**Version History:**
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-16 | Initial privacy policy |

---

## 15. Contact Information

### 15.1 Privacy Inquiries

**General Privacy Questions:**
- Email: privacy@one.ie
- Response time: Within 3 business days

**Data Subject Access Requests (GDPR, CCPA, PIPEDA):**
- Email: privacy@one.ie with subject line "Data Request"
- Required info: Account email, specific request, identity verification
- Response time: Within 30 days (GDPR/PIPEDA) or 45 days (CCPA)

**Security Concerns:**
- Email: security@one.ie
- PGP key: [To be added]
- For urgent security issues, include "URGENT" in subject line

**AI Disputes:**
- Email: ai-dispute@one.ie
- For disputes related to AI decisions or content generation

**Group Owner Support:**
- Email: group-owners@one.ie
- For data controller obligations and compliance assistance

### 15.2 Data Controller Information

**ONE Platform:**
- Legal Entity: [To be confirmed - likely Anthony O'Connell trading as ONE Platform]
- Address: [To be added - Irish address required for GDPR]
- Email: agent@one.ie
- Website: https://one.ie

**EU Representative (GDPR Article 27):**
[To be appointed if no EU establishment]

**UK Representative (UK GDPR Article 27):**
[To be appointed if no UK establishment]

### 15.3 Supervisory Authorities

**Ireland (ONE Platform HQ):**
- Data Protection Commission
- Website: https://www.dataprotection.ie
- Email: info@dataprotection.ie
- Phone: +353 (0)761 104 800

**EU/EEA:**
- Find your local DPA: https://edpb.europa.eu/about-edpb/board/members_en

**United States (California):**
- California Attorney General - Privacy Section
- Website: https://oag.ca.gov/privacy
- Email: privacy@doj.ca.gov

**Canada:**
- Office of the Privacy Commissioner of Canada
- Website: https://www.priv.gc.ca/en/
- Toll-free: 1-800-282-1376

---

## 16. Glossary (Ontology-Aligned)

**6-Dimension Ontology:** The data architecture of ONE Platform consisting of Groups, People, Things, Connections, Events, and Knowledge.

**Group:** Multi-tenant isolation boundary with hierarchical nesting support. Types: friend_circle, business, community, dao, government, organization.

**People:** Users with roles: platform_owner, group_owner, group_user, customer.

**Things (Entities):** All nouns in the system (66 types): users, agents, content, tokens, courses, products, etc.

**Connections (Relationships):** Links between entities (25 types): owns, authored, enrolled_in, holds_tokens, etc.

**Events:** Time-stamped actions (67 types): user_registered, content_created, tokens_purchased, etc.

**Knowledge:** Labels, documents, chunks, and vector embeddings for RAG (Retrieval-Augmented Generation).

**Platform Owner:** The individual/entity that owns and operates ONE Platform (currently Anthony O'Connell).

**Group Owner:** Data controller for a group. Responsible for compliance within their group.

**Data Controller:** Entity that determines the purposes and means of processing personal data (GDPR term).

**Data Processor:** Entity that processes data on behalf of a data controller (GDPR term). ONE Platform is a processor for customer groups.

**RAG (Retrieval-Augmented Generation):** AI technique that uses vector embeddings to find relevant context before generating responses.

**Zero Data Retention:** OpenAI API mode where prompts are not stored or used for training.

---

## 17. Changelog

### Version 1.0.0 (2025-10-16)
- Initial privacy policy release
- Comprehensive coverage of 6-dimension ontology data flows
- GDPR, CCPA, and PIPEDA compliance
- Detailed third-party service provider disclosures
- Group owner (data controller) responsibilities
- AI transparency and automated decision-making disclosures

---

**END OF PRIVACY POLICY**

---

**Summary for Quick Reference:**

**What we collect:** Account data, content, usage logs, AI training data (opt-in)
**Why we collect it:** Platform functionality, AI features, analytics, security
**Who we share with:** Service providers (Convex, Cloudflare, OpenAI, Stripe), NOT advertisers
**Your rights:** Access, delete, export, opt-out (GDPR, CCPA, PIPEDA)
**Contact:** privacy@one.ie

**Key commitments:**
✅ You own your data
✅ No data selling
✅ No ad tracking
✅ OpenAI zero retention
✅ Local hosting option
✅ Group data isolation
✅ Transparent AI operations
