# ONE Platform Legal Documentation

**Last Updated:** October 16, 2025
**Status:** Initial Release

This directory contains all legal documentation for ONE Platform.

## Available Documents

### 1. Privacy Policy
**File:** `privacy-policy.md`
**Length:** ~15,000 words
**Last Updated:** 2025-10-16
**Version:** 1.0.0

Comprehensive privacy policy covering:
- 6-dimension ontology data flows (Groups, People, Things, Connections, Events, Knowledge)
- Third-party processor disclosures (Convex, OpenAI, ElevenLabs, Stripe, Cloudflare, Resend)
- GDPR, CCPA, and PIPEDA compliance
- User rights (access, delete, export, opt-out)
- AI transparency and limitations
- Biometric data processing (voice cloning)
- Cookie disclosure and consent mechanism
- International data transfers (SCCs, adequacy decisions)
- Data retention periods (30-90-365 days tiered, 7 years financial)

**Status:** ✅ Complete, ready for legal review and deployment

### 2. Terms of Service
**File:** `terms-of-service.md`
**Length:** ~14,000 words
**Last Updated:** 2025-10-16
**Version:** 1.0.0

Comprehensive terms of service covering:
- Eligibility and account registration
- Four role types (platform owner, group owner, group user, customer)
- Subscription plans (Starter free, Pro $29/month, Enterprise custom)
- License grant and intellectual property (ONE License 1.0 compatibility)
- AI features and disclaimers (no warranty, limitation of liability)
- Group management and multi-tenancy
- Acceptable use policy
- DMCA takedown procedures
- Third-party integrations
- Dispute resolution (arbitration, Irish law)
- Limitation of liability and indemnification
- SLA commitments (99.5% Pro, 99.9% Enterprise)

**Status:** ✅ Complete, ready for legal review and deployment

### 3. Legal Assessment Report
**File:** `../events/legal-assessment-2025-10-16.md`
**Length:** ~50,000 words (comprehensive)
**Date:** 2025-10-16
**Conducted By:** Legal Agent (Claude AI)

Comprehensive legal compliance assessment covering:
- Assessment methodology (GDPR, CCPA, PIPEDA, ePrivacy Directive)
- Findings by ontology dimension (Groups, People, Things, Connections, Events, Knowledge)
- Third-party service compliance review
- Critical issues (4 identified, requiring immediate action 0-7 days)
- High priority issues (5 identified, requiring action 7-30 days)
- Medium priority issues (5 identified, requiring action 30-90 days)
- Low priority issues (3 identified, ongoing improvements)
- Compliance checklists (GDPR 45%, CCPA 60%, PIPEDA 40%, ePrivacy 40%)
- Remediation roadmap (4 phases: 0-7 days, 7-30 days, 30-90 days, ongoing)
- Recommendations and next steps

**Status:** ✅ Complete, ready for review by platform owner and legal counsel

## Quick Links

**For Deployment:**
- Privacy Policy route: `/web/src/pages/legal/privacy-policy.astro`
- Terms of Service route: `/web/src/pages/legal/terms-of-service.astro`

**For Compliance:**
- Assessment report: `/one/events/legal-assessment-2025-10-16.md`

## Critical Issues Requiring Immediate Action

### Issue #1: Missing TOS/Privacy Acceptance at Signup (CRITICAL)
**Timeline:** 0-3 days
**Files:** `/web/src/pages/account/signup.astro`, `/web/src/components/auth/SignUpPage.tsx`
**Action:** Add checkbox: "I have read and accept the [Privacy Policy] and [Terms of Service]"

### Issue #2: No Cookie Consent Banner (CRITICAL)
**Timeline:** 0-7 days
**Files:** All pages
**Action:** Implement cookie consent banner component before setting any non-essential cookies

### Issue #3: No Biometric Consent for Voice Cloning (CRITICAL)
**Timeline:** 0-3 days
**Files:** AI clone creation flow
**Action:** Add explicit consent screen for biometric data processing per GDPR Article 9

### Issue #4: No DPAs with AI Processors (CRITICAL)
**Timeline:** 0-14 days
**Processors:** Convex, OpenAI, ElevenLabs, Resend
**Action:** Obtain signed Data Processing Agreements from all processors

## Deployment Checklist

Before deploying to production:

**Step 1: Legal Review (0-3 days)**
- [ ] Engage Irish privacy lawyer to review all documents
- [ ] Review placeholders (company address, VAT number, phone)
- [ ] Verify all contact emails are set up (privacy@, legal@, dpo@, etc.)

**Step 2: Deploy Documents (Day 3-4)**
- [ ] Create `/web/src/pages/legal/privacy-policy.astro`
- [ ] Create `/web/src/pages/legal/terms-of-service.astro`
- [ ] Verify documents render correctly at /legal/privacy-policy and /legal/terms-of-service

**Step 3: Update Signup Flow (Day 4-5)**
- [ ] Add TOS/Privacy acceptance checkbox to signup form
- [ ] Log acceptance events in backend
- [ ] Test signup flow end-to-end

**Step 4: Cookie Consent (Day 5-6)**
- [ ] Implement cookie consent banner component
- [ ] Add to Layout.astro
- [ ] Create cookie settings page
- [ ] Test consent flow on all browsers

**Step 5: Biometric Consent (Day 6-7)**
- [ ] Add biometric consent screen to AI clone creation
- [ ] Log biometric consent events
- [ ] Add "Delete Voice Data" button
- [ ] Test voice cloning flow

**Step 6: Footer Links (Day 7)**
- [ ] Add footer to Layout.astro with legal links
- [ ] Verify footer on all pages
- [ ] Add "Legal" section to navigation menu

**Step 7: DPAs (Days 7-14)**
- [ ] Contact Convex for DPA
- [ ] Contact OpenAI for DPA
- [ ] Contact ElevenLabs for DPA
- [ ] Contact Resend for DPA
- [ ] Review and sign all DPAs

**Step 8: Verification (Day 14)**
- [ ] End-to-end compliance testing
- [ ] Verify all critical issues resolved
- [ ] Document completion in compliance log

## Contact Information

**For Legal Questions:**
- Email: legal@one.ie
- Privacy inquiries: privacy@one.ie
- Security concerns: security@one.ie

**For Assessment Questions:**
- Contact: Legal Agent (this AI assessment)
- Follow-up: Engage human legal counsel for production review

## Regulatory Compliance Status

**GDPR (EU/EEA/UK):**
- Current: 45% compliant (5/11 requirements met)
- After remediation: 95%+ compliant (all requirements met)

**CCPA (California):**
- Current: 60% compliant (3/5 requirements met)
- After remediation: 100% compliant

**PIPEDA (Canada):**
- Current: 40% compliant (4/10 principles met)
- After remediation: 90%+ compliant

**ePrivacy Directive (Cookie Law):**
- Current: 40% compliant (2/5 requirements met)
- After remediation: 100% compliant

## License

These legal documents are part of ONE Platform and are subject to ONE License 1.0.

**Copyright:** © 2025 ONE Platform (Anthony O'Connell)

**Usage:** These documents are templates for ONE Platform only. Do NOT use for other projects without legal review and modification.

---

**For the latest version of this documentation, visit:**
https://github.com/one-ie/ONE/tree/main/one/things/legal
