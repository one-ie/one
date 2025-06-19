# Integrations

This document outlines the key integrations for the ONE platform, enabling our AI agent ecosystem to connect with external services and data sources.

## 🚀 Integration Platform: Nango

### Overview
**Nango** (https://www.nango.dev/) is our primary integration platform, providing:
- **300+ Pre-built API Integrations**
- **MCP Server Support** for AI agents
- **Unified API** for all external services
- **Built-in Auth Handling** (OAuth, API keys, etc.)

### Nango MCP Server
Nango provides an MCP server that enables:
- Direct integration with Claude, Cursor, Windsurf, VS Code
- 7 MCP tools for managing connections and integrations
- Simplified API access through standardized protocol

### Key Benefits
1. **Single API** - One interface for all integrations
2. **Auth Abstraction** - Handle OAuth flows automatically
3. **Rate Limiting** - Built-in rate limit management
4. **Sync Management** - Bi-directional data sync
5. **400+ APIs** pre-configured out of the box

## 🎯 Core Integrations via Nango

### 1. Recall.ai - Meeting Intelligence
**Purpose**: Capture and analyze meeting content for AI agents
- **Website**: https://www.recall.ai/
- **Use Cases**:
  - Sales calls transcription and analysis
  - Customer service interaction recording
  - Team meeting insights for project management
  - Legal compliance recording
- **Integration Points**:
  - Real-time transcription API
  - Meeting summary generation
  - Action item extraction
  - Sentiment analysis

### 2. OpenRouter - Multi-Model AI Access
**Purpose**: Access multiple AI models through a unified API
- **Models Available**:
  - Claude 3/4 (Anthropic)
  - GPT-4 (OpenAI)
  - Llama 3 (Meta)
  - Mistral Large
  - And 50+ other models
- **Benefits**:
  - Model fallback strategies
  - Cost optimization
  - A/B testing different models
  - Specialized model selection per agent role

### 3. GitHub MCP - Code Repository Integration
**Purpose**: Enable engineering agents to interact with repositories
- **Capabilities**:
  - Repository management
  - Issue tracking and creation
  - Pull request automation
  - Code review assistance
  - CI/CD pipeline monitoring
- **MCP Tools**:
  - `github.getRepository`
  - `github.createIssue`
  - `github.mergePullRequest`
  - `github.runWorkflow`

### 4. Shopify MCP - E-commerce Integration
**Purpose**: Connect sales and service agents to store data
- **Features**:
  - Product catalog access
  - Order management
  - Customer data retrieval
  - Inventory tracking
  - Analytics and reporting
- **MCP Tools**:
  - `shopify.getProducts`
  - `shopify.createOrder`
  - `shopify.updateInventory`
  - `shopify.getCustomerHistory`

### 5. Novu - Notification Infrastructure
**Purpose**: Unified notification system for all communication channels
- **Website**: https://novu.co/
- **Key Features**:
  - Multi-channel notifications (Email, SMS, Push, In-App, Chat)
  - Workflow builder for complex notification logic
  - User preference management
  - Notification center UI components
  - Real-time updates via WebSockets
- **UI Components**:
  - `<NovuProvider>` - Context provider
  - `<NotificationCenter>` - Full notification center
  - `<PopoverWrapper>` - Notification popover
  - `<NotificationBell>` - Bell icon with count
  - `<PreferencesList>` - User preferences UI
- **Use Cases**:
  - AI agent activity notifications
  - Task completion alerts
  - Team collaboration updates
  - Customer engagement notifications
  - System status updates

## 🔧 Implementation Architecture

```typescript
// Nango-Powered Integration Manager
interface IntegrationConfig {
  nango: {
    secretKey: string
    publicKey: string
    baseUrl: string
    mcp: {
      enabled: boolean
      tools: string[]
    }
  }
  // Notification Infrastructure
  novu: {
    applicationId: string
    apiKey: string
    backendUrl: string
    socketUrl: string
    environment: 'development' | 'production'
  }
  // Integrations managed through Nango
  recall: {
    connectionId: string  // Nango connection ID
    config: {
      autoTranscribe: boolean
      webhookUrl: string
    }
  }
  openRouter: {
    connectionId: string  // Nango manages the API key
    defaultModel: string
    fallbackModels: string[]
  }
  github: {
    connectionId: string  // Nango handles OAuth
    org: string
    permissions: string[]
  }
  shopify: {
    connectionId: string  // Nango manages auth
    shop: string
    apiVersion: string
  }
}

// Agent Integration Access
interface AgentIntegrations {
  marketing: ['openRouter', 'shopify']
  sales: ['recall', 'openRouter', 'shopify']
  service: ['recall', 'openRouter', 'shopify']
  design: ['openRouter', 'github']
  legal: ['recall', 'openRouter']
  engineering: ['openRouter', 'github']
}
```

## 📋 Integration Priorities

### Phase 1: Foundation (Current)
1. **OpenRouter** - Already integrated for multi-model AI
2. **Basic API connections** - Direct REST APIs

### Phase 2: MCP Integration (Next)
1. **GitHub MCP** - Engineering agent capabilities
2. **Shopify MCP** - Sales/service agent features
3. **Custom MCP servers** - For proprietary integrations

### Phase 3: Advanced Features
1. **Recall.ai** - Meeting intelligence
2. **Webhook orchestration** - Real-time events
3. **Data synchronization** - Cross-platform consistency

## 🔐 Security Considerations

### API Key Management
- Store in secure environment variables
- Rotate keys regularly
- Use least-privilege access
- Audit integration usage

### Data Privacy
- Encrypt data in transit
- Comply with GDPR/CCPA
- User consent for recordings (Recall.ai)
- Data retention policies

### Rate Limiting
- Implement circuit breakers
- Queue management for API calls
- Cost monitoring for usage-based APIs
- Fallback strategies

## 🚀 Quick Start with Nango

### 1. Nango MCP Configuration
```json
// .cursor/mcp.json
{
  "nango": {
    "command": "npx",
    "args": ["@pipedream/mcp-server-nango"],
    "env": {
      "NANGO_SECRET_KEY": "${NANGO_SECRET_KEY}",
      "NANGO_PUBLIC_KEY": "${NANGO_PUBLIC_KEY}"
    }
  }
}
```

### 2. Initialize Nango Client
```typescript
// Initialize Nango
import { Nango } from '@nangohq/node'

const nango = new Nango({
  secretKey: process.env.NANGO_SECRET_KEY,
  publicKey: process.env.NANGO_PUBLIC_KEY
})

// List available integrations
const integrations = await nango.listIntegrations()
```

### 3. Connect External Services via Nango
```typescript
// Example: Connect Shopify through Nango
const shopifyConnection = await nango.createConnection({
  providerConfigKey: 'shopify',
  connectionId: 'my-shopify-store',
  credentials: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET
  }
})

// Use the connection
const products = await nango.proxy({
  connectionId: 'my-shopify-store',
  providerConfigKey: 'shopify',
  method: 'GET',
  endpoint: '/products.json'
})
```

### 4. Nango MCP Tools
The Nango MCP server provides these tools:
- **createIntegration** - Add a new integration
- **deleteConnection** - Remove a connection
- **listConnections** - Get all active connections
- **listIntegrations** - View available integrations
- **proxy** - Make API calls through Nango
- **getConnection** - Retrieve connection details

### 5. Using Nango with AI Agents
```typescript
// Agent accesses external API via Nango
class SalesAgent {
  async getShopifyOrders() {
    // Nango handles auth, rate limits, pagination
    return await nango.proxy({
      connectionId: 'shopify-main',
      providerConfigKey: 'shopify',
      method: 'GET',
      endpoint: '/orders.json',
      params: { status: 'open' }
    })
  }
  
  async syncCRMData() {
    // Nango manages bi-directional sync
    return await nango.sync({
      connectionId: 'salesforce-prod',
      providerConfigKey: 'salesforce',
      syncName: 'contacts-sync'
    })
  }
}
```

### 6. Novu Setup for Notifications
```typescript
// Initialize Novu
import { Novu } from '@novu/node'
import { 
  NovuProvider,
  PopoverNotificationCenter,
  NotificationBell
} from '@novu/notification-center'

// Backend setup
const novu = new Novu(process.env.NOVU_API_KEY)

// Send notification when AI agent completes task
await novu.trigger('task-completed', {
  to: {
    subscriberId: userId,
    email: userEmail
  },
  payload: {
    agentName: 'Sales Agent',
    taskType: 'Lead Qualification',
    result: 'Qualified 15 new leads',
    actionUrl: '/leads/qualified'
  }
})

// Frontend UI Components (React/Astro)
export function NotificationUI() {
  return (
    <NovuProvider
      subscriberId={userId}
      applicationIdentifier={process.env.NOVU_APP_ID}
    >
      <PopoverNotificationCenter
        colorScheme="light"
        showUserPreferences={true}
        position="bottom-end"
      >
        {({ unseenCount }) => (
          <NotificationBell unseenCount={unseenCount} />
        )}
      </PopoverNotificationCenter>
    </NovuProvider>
  )
}
```

### 7. Novu Workflow for AI Agents
```typescript
// Define notification workflow
const aiAgentWorkflow = {
  name: 'ai-agent-notifications',
  steps: [
    // In-app notification
    {
      template: {
        subject: '{{agentName}} completed {{taskType}}',
        content: '{{result}}',
        cta: {
          label: 'View Details',
          url: '{{actionUrl}}'
        }
      }
    },
    // Email digest (batched)
    {
      template: {
        subject: 'AI Team Daily Summary',
        digest: {
          amount: 24,
          unit: 'hours'
        }
      }
    },
    // Critical alerts via SMS
    {
      template: {
        content: 'Critical: {{agentName}} needs attention',
        conditions: [
          { field: 'priority', operator: 'equals', value: 'high' }
        ]
      }
    }
  ]
}
```

## 📊 Integration Monitoring

### Metrics to Track
- API call volume per integration
- Response times and latency
- Error rates and types
- Cost per integration
- User engagement with integrated features

### Alerting Rules
- API quota approaching limits
- Integration failures
- Unusual usage patterns
- Cost threshold breaches

## 🔄 Future Integrations

### Under Consideration
- **Slack/Discord** - Team communication
- **Stripe** - Payment processing
- **SendGrid/Resend** - Email automation
- **Twilio** - SMS/Voice capabilities
- **Zapier** - No-code automation
- **Supabase** - Real-time database
- **Pinecone/Qdrant** - Vector search

### Integration Criteria
1. Adds clear value to AI agents
2. Has reliable API/MCP support
3. Reasonable pricing model
4. Strong security practices
5. Good documentation

---

*This document is a living guide. Update as new integrations are added or requirements change.*