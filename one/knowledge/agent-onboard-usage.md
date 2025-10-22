# Agent-Onboard Usage Guide

**Version:** 1.0.0
**Status:** Production Ready
**Purpose:** How to use the agent-onboard system

---

## Quick Start

### From CLI (Recommended)

```bash
npx oneie init
```

The CLI will:
1. Prompt for user details
2. Call the onboarding mutation
3. Display analysis results
4. Write files to installation folder
5. Present feature recommendations
6. Hand off to Claude Code

### From Convex Console (Testing)

```javascript
// backend/convex/mutations/onboarding.ts
await ctx.runMutation(api.mutations.onboarding.analyzeWebsite, {
  name: "Tom O'Connor",
  organizationName: "ONE Platform",
  websiteUrl: "https://one.ie",
  email: "tom@one.ie"
});
```

---

## API Reference

### analyzeWebsite Mutation

**Purpose:** Main entry point for onboarding analysis

**Input:**
```typescript
{
  name: string;                    // User's full name
  organizationName: string;        // Organization name
  websiteUrl: string;              // Website to analyze
  email: string;                   // User's email
  installationSlug?: string;       // Optional custom slug
}
```

**Output (Success):**
```typescript
{
  success: true;
  data: {
    installationSlug: string;      // Generated slug
    analysis: {
      url: string;
      brand: BrandIdentity;
      features: DetectedFeatures;
      businessModel: string;
      analyzedAt: number;
    };
    ontology: {
      document: OntologyDocument;
      markdown: string;
    };
    brandGuide: {
      guide: BrandGuide;
      markdown: string;
    };
    recommendations: FeatureRecommendation[];
  };
}
```

**Output (Error):**
```typescript
{
  success: false;
  error: string;                   // Error message
}
```

### createOnboardingGroup Mutation

**Purpose:** Create initial group for new organization

**Input:**
```typescript
{
  name: string;                    // Group name
  slug: string;                    // URL slug
  ownerEmail: string;              // Owner email
  plan?: 'starter' | 'pro' | 'enterprise';
}
```

**Output:**
```typescript
{
  success: boolean;
  groupId?: Id<"groups">;          // If successful
  error?: string;                  // If failed
}
```

### checkSlugAvailability Query

**Purpose:** Check if installation slug is available

**Input:**
```typescript
{
  slug: string;                    // Desired slug
}
```

**Output:**
```typescript
{
  available: boolean;
  slug: string;
}
```

---

## Service Layer API

### Website Analyzer

```typescript
import { runWebsiteAnalysis } from '../services/websiteAnalyzer';

const analysis = await runWebsiteAnalysis('https://example.com');

// Returns:
{
  url: string;
  brand: {
    colors: { primary, secondary, accent? };
    logo: { url, format };
    fonts: { heading, body };
    voice: { tone, audience };
  };
  features: {
    contentTypes: string[];
    monetization: string[];
    community: string[];
    techStack: { frontend?, backend?, hosting? };
  };
  businessModel: string;
  analyzedAt: number;
}
```

### Ontology Generator

```typescript
import { runOntologyGeneration } from '../services/ontologyGenerator';

const { document, markdown } = await runOntologyGeneration(
  analysis,
  'Organization Name'
);

// document: OntologyDocument with 6 dimensions
// markdown: Ready-to-write string
```

### Brand Guide Generator

```typescript
import { runBrandGuideGeneration } from '../services/brandGuideGenerator';

const { guide, markdown } = await runBrandGuideGeneration(
  analysis.brand,
  'Organization Name',
  'https://example.com'
);

// guide: BrandGuide object
// markdown: Ready-to-write string
```

### Feature Recommender

```typescript
import { runFeatureRecommendation } from '../services/featureRecommender';

const recommendations = await runFeatureRecommendation(
  analysis.features
);

// Returns: FeatureRecommendation[]
// Each with: feature, reason, priority
```

---

## Common Workflows

### Workflow 1: Complete Onboarding

```typescript
// 1. Analyze website
const result = await ctx.runMutation(
  api.mutations.onboarding.analyzeWebsite,
  {
    name: "Jane Doe",
    organizationName: "Acme Corp",
    websiteUrl: "https://acme.com",
    email: "jane@acme.com"
  }
);

if (!result.success) {
  console.error(result.error);
  return;
}

// 2. Write files to installation folder
const { installationSlug, ontology, brandGuide } = result.data;

await writeFile(
  `/${installationSlug}/knowledge/ontology.md`,
  ontology.markdown
);

await writeFile(
  `/${installationSlug}/knowledge/brand-guide.md`,
  brandGuide.markdown
);

// 3. Create group
await ctx.runMutation(
  api.mutations.onboarding.createOnboardingGroup,
  {
    name: "Acme Corp",
    slug: installationSlug,
    ownerEmail: "jane@acme.com",
    plan: "pro"
  }
);

// 4. Update .onboarding.json
await writeFile('.onboarding.json', JSON.stringify({
  status: "features_presented",
  ...result.data
}, null, 2));
```

### Workflow 2: Check Availability First

```typescript
// 1. Generate slug from org name
const slug = organizationName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-');

// 2. Check if available
const { available } = await ctx.runQuery(
  api.queries.onboarding.checkSlugAvailability,
  { slug }
);

if (!available) {
  // Prompt for alternative slug
  // Or append number: 'acme-corp-2'
}

// 3. Proceed with analysis
```

### Workflow 3: Re-analyze Existing Installation

```typescript
// 1. Get current analysis from .onboarding.json
const current = JSON.parse(
  await readFile('.onboarding.json', 'utf8')
);

// 2. Re-analyze (e.g., after website update)
const updated = await ctx.runMutation(
  api.mutations.onboarding.analyzeWebsite,
  {
    ...current.user,
    ...current.organization,
    installationSlug: current.organization.slug
  }
);

// 3. Compare changes
const changes = compareAnalysis(current.analysis, updated.data.analysis);

// 4. Optionally regenerate files
if (changes.brand.colorsChanged) {
  await writeFile(
    `/${current.organization.slug}/knowledge/brand-guide.md`,
    updated.data.brandGuide.markdown
  );
}
```

---

## Error Handling

### Website Not Accessible

```typescript
try {
  const result = await analyzeWebsite({...});
} catch (error) {
  if (error._tag === 'WebsiteNotAccessible') {
    console.error(`Cannot access ${error.url}: ${error.reason}`);
    // Offer manual input option
  }
}
```

### Invalid URL

```typescript
if (result.success === false && result.error.includes('invalid')) {
  console.error('Invalid website URL. Please check and try again.');
  // Prompt for corrected URL
}
```

### Slug Already Exists

```typescript
const groupResult = await createOnboardingGroup({...});

if (!groupResult.success) {
  if (groupResult.error.includes('already exists')) {
    // Generate alternative: 'acme-corp-2'
    // Or prompt user for custom slug
  }
}
```

---

## File Structure After Onboarding

```
/
├── .onboarding.json              # Onboarding state
├── {installation-slug}/
│   ├── knowledge/
│   │   ├── ontology.md          # Generated ontology
│   │   └── brand-guide.md        # Brand identity
│   ├── groups/
│   │   └── {org-slug}/
│   │       └── README.md         # Organization overview
│   └── things/
│       └── vision.md             # Optional custom vision
└── .env.local                    # Updated with brand colors
```

---

## Environment Variables

### Generated in .env.local

```bash
# Organization
INSTALLATION_NAME="{installation-slug}"
ORG_NAME="{Organization Name}"
ORG_SLUG="{installation-slug}"
ORG_OWNER_EMAIL="{email}"
ORG_OWNER_NAME="{name}"

# Branding (from analysis)
BRAND_PRIMARY_COLOR="{primary-color}"
BRAND_SECONDARY_COLOR="{secondary-color}"
BRAND_LOGO_URL="{logo-url}"

# Website
ORIGINAL_WEBSITE="{analyzed-website}"
```

---

## Testing

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { analyzeWebsite } from './websiteAnalyzer';

describe('Website Analyzer', () => {
  it('should extract brand colors', async () => {
    const result = await runWebsiteAnalysis('https://example.com');

    expect(result.brand.colors.primary).toMatch(/^#[0-9A-F]{6}$/i);
    expect(result.brand.colors.secondary).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should detect content types', async () => {
    const result = await runWebsiteAnalysis('https://blog-site.com');

    expect(result.features.contentTypes).toContain('blog');
  });
});
```

### Integration Test Example

```typescript
import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import schema from '../schema';

describe('Onboarding Flow', () => {
  it('should complete full onboarding', async () => {
    const t = convexTest(schema);

    // 1. Analyze website
    const result = await t.mutation(api.mutations.onboarding.analyzeWebsite, {
      name: 'Test User',
      organizationName: 'Test Org',
      websiteUrl: 'https://test.com',
      email: 'test@test.com'
    });

    expect(result.success).toBe(true);
    expect(result.data.installationSlug).toBe('test-org');

    // 2. Verify ontology generated
    expect(result.data.ontology.document.ontology.groups).toBeDefined();
    expect(result.data.ontology.document.ontology.things.length).toBeGreaterThan(0);

    // 3. Create group
    const groupResult = await t.mutation(
      api.mutations.onboarding.createOnboardingGroup,
      {
        name: 'Test Org',
        slug: result.data.installationSlug,
        ownerEmail: 'test@test.com'
      }
    );

    expect(groupResult.success).toBe(true);
  });
});
```

---

## Performance Tips

### 1. Parallel Extraction

The website analyzer already runs extraction in parallel:

```typescript
const [colors, logo, fonts, voice, ...] = yield* _(Effect.all([
  extractColors(html),
  extractLogo(html),
  extractFonts(html),
  // ... all run concurrently
]));
```

### 2. Caching

For repeated analyses of the same website:

```typescript
// Cache analysis results
const cacheKey = `analysis:${websiteUrl}`;
const cached = await redis.get(cacheKey);

if (cached && !forceRefresh) {
  return JSON.parse(cached);
}

const analysis = await runWebsiteAnalysis(websiteUrl);
await redis.setex(cacheKey, 3600, JSON.stringify(analysis));
```

### 3. Batching

For multiple organizations:

```typescript
const analyses = await Promise.all(
  organizations.map(org =>
    runWebsiteAnalysis(org.websiteUrl)
  )
);
```

---

## Customization

### Custom Business Model Detection

```typescript
// In ontologyGenerator.ts
const generateBusinessDescription = (analysis: WebsiteAnalysis): string => {
  // Add custom logic
  if (analysis.features.contentTypes.includes('courses') &&
      analysis.features.monetization.includes('subscriptions')) {
    return 'Educational SaaS platform';
  }

  // ... existing logic
};
```

### Custom Feature Recommendations

```typescript
// In featureRecommender.ts
if (detected.contentTypes.includes('podcast')) {
  recommendations.push({
    feature: FEATURES['podcast-platform'],
    reason: 'Detected podcast content',
    priority: 'high'
  });
}
```

### Custom Ontology Mapping

```typescript
// In ontologyGenerator.ts
const mapContentToThings = (contentTypes: string[]): string[] => {
  const thingMapping: Record<string, string[]> = {
    // Add custom mappings
    'courses': ['course', 'lesson', 'certificate', 'quiz'],
    'webinars': ['livestream', 'recording', 'replay'],
    // ... existing mappings
  };
};
```

---

## Troubleshooting

### Issue: Analysis Returns Mock Data

**Cause:** WebFetch integration not complete

**Solution:** The services are structured to accept real data. Integrate WebFetch tool:

```typescript
const fetchWebsite = (url: URL): Effect.Effect<string, WebsiteNotAccessible> =>
  Effect.tryPromise({
    try: () => webFetch.fetch(url.toString()),
    catch: (error) => new WebsiteNotAccessible(url.toString(), String(error))
  });
```

### Issue: Slug Generation Conflicts

**Cause:** Multiple orgs with similar names

**Solution:** Always check availability and append counter:

```typescript
let slug = baseSlug;
let counter = 2;

while (!(await checkSlugAvailability(slug)).available) {
  slug = `${baseSlug}-${counter}`;
  counter++;
}
```

### Issue: Brand Colors Not Detected

**Cause:** Website uses inline styles or complex CSS

**Solution:** Enhance color extraction:

```typescript
const extractColors = (html: string): Effect.Effect<BrandIdentity['colors'], never> => {
  // Parse <style> tags
  // Parse inline styles
  // Parse CSS files
  // Use OpenAI Vision on screenshots
};
```

---

## See Also

- **Agent Definition:** `/.claude/agents/agent-onboard.md`
- **Example Output:** `/.claude/agents/agent-onboard-example-output.md`
- **Implementation Summary:** `/one/events/agent-onboard-implementation-summary.md`
- **Ontology Spec:** `/one/knowledge/ontology.md`
- **Installation Folders:** `/one/knowledge/installation-folders.md`

---

**Ready to onboard users intelligently!** 🚀
