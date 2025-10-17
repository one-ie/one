Here is the complete, universal ontology specification for e-commerce stores, designed to serve as a blueprint for any modern retail business.

---

## Universal E-commerce Ontology Specification

**Version:** 1.0.0 (Intelligent Commerce Engine)
**Status:** Complete & Generic
**Design Principle:** This ontology models any e-commerce business in six dimensions, transforming a simple online store into a proactive, intelligent commerce engine. It is the single source of truth for all business operations, from inventory management to AI-driven marketing.

### The Philosophy: Your Store is an Engine, Not a Shelf

A traditional e-commerce site is a digital shelf—a passive display of products. An intelligent commerce engine is a sentient system that understands its products, knows its customers, anticipates market trends, and automates its own growth.

This ontology provides the universal structure for that engine. Every command, feature, and piece of data is mapped to these six fundamental dimensions.

---

## 1\. GROUP: The Business Entity

This is the top-level container that defines your entire store as a single, cohesive unit.

### Group Structure

```typescript
{
  _id: Id<'groups'>,
  slug: 'your-store-name', // e.g., 'acme-widgets'
  name: 'Your Store Name',
  type: 'business',
  metadata: {
    domain: 'yourstore.com',
    defaultCurrency: 'USD',
    defaultCountry: 'USA'
  },
  status: 'active'
}
```

---

## 2\. PEOPLE: The Actors

This dimension defines every person who interacts with your store and their specific role.

### Person Roles

1.  **`owner`**: The business owner with full administrative privileges.
2.  **`staff`**: Employees with specific permissions (e.g., order fulfillment, customer support).
3.  **`customer`**: Any individual who browses or buys from the store, from anonymous visitor to loyal patron.

### Person Structure

```typescript
{
  _id: Id<'people'>,
  email: string,
  role: 'owner' | 'staff' | 'customer',
  displayName?: string,
  defaultShippingAddress?: { /* ... */ },
  createdAt: number
}
```

---

## 3\. THINGS: The Nouns of Your Business 🛍️

This is the comprehensive catalog of every object, both physical and digital, that exists in your store.

### Thing Types (`ThingType`)

- **Catalog & Inventory (6 types):**
  - `product`: The core sellable item.
  - `product_variant`: A specific version of a product (e.g., size, color).
  - `category`: A classification for products (e.g., "T-Shirts," "Electronics").
  - `brand`: The manufacturer or label of a product.
  - `collection`: A curated group of products (e.g., "Summer Collection," "Holiday Gift Guide").
  - `inventory_item`: Tracks the stock level for a specific product or variant at a location.
- **Commerce & Orders (5 types):**
  - `order`: The official record of a customer's completed purchase.
  - `shopping_cart`: A temporary container for items a customer intends to buy.
  - `payment`: A record of a financial transaction.
  - `discount_code`: A promotional code for a discount.
  - `subscription`: A recurring order for a product or service.
- **Content & Engagement (4 types):**
  - `guide`: A blog post, buying guide, or informational article.
  - `customer_review`: A customer's rating and feedback.
  - `faq`: A frequently asked question and its answer.
  - `landing_page`: A custom page for a specific campaign or purpose.
- **Marketing & Analytics (3 types):**
  - `insight`: An AI-generated observation about business performance.
  - `customer_segment`: A dynamic group of customers defined by specific rules.
  - `ad_campaign`: A record of a marketing campaign.
- **System & Integration (1 type):**
  - `external_agent`: Represents a connection to an external platform like ChatGPT, Google Shopping, or a social media channel.

---

## 4\. CONNECTIONS: The Relationships

This dimension maps the relationships between all your `Things` and `People`, forming a powerful knowledge graph of your business.

### Connection Types (`ConnectionType`)

- **Catalog Structure (3):** `part_of` (product → category), `belongs_to` (product → collection), `manufactured_by` (product → brand).
- **Commerce (5):** `places` (customer → order), `contains` (order → product), `uses` (order → discount_code), `purchased` (customer → product), `subscribed_to` (customer → subscription).
- **Engagement (3):** `writes` (customer → review), `is_about` (review → product), `viewed` (customer → guide).

---

## 5\. EVENTS: The Actions

This is the unchangeable, time-stamped log of every action that happens in your store. It's the fuel for analytics, automation, and understanding customer behavior.

### Event Types (`EventType`)

- **Discovery Events:** `session_started`, `product_viewed`, `search_performed`, `filter_applied`.
- **Commerce Events:** `product_added_to_cart`, `cart_abandoned`, `checkout_started`, `order_placed`, `payment_processed`.
- **Post-Purchase Events:** `order_shipped`, `order_delivered`, `review_submitted`, `return_requested`.
- **System Events:** `insight_generated`, `stock_level_low`, `customer_segment_updated`.

---

## 6\. KNOWLEDGE: The Intelligence Layer

This is the "brain" of your store. It’s a system of labels that add context and meaning to your data, powering smart search, personalization, and AI agents.

### Key Knowledge Labels

- **Product Attributes:** `category:apparel`, `color:blue`, `size:large`, `material:cotton`, `feature:waterproof`.
- **Customer Segments:** `archetype:whale`, `status:lapsed`, `ltv_tier:gold`, `interest:outdoors`.
- **Operational Statuses:** `order_status:shipped`, `stock_status:in_stock`, `payment_status:paid`.
- **Content Goals:** `goal:conversion`, `topic:how_to`, `audience:beginner`.

---

## 7\. The Control Layer: Your Business Playbook (Plain English DSL)

This is the revolutionary part. The ontology provides the structure; this playbook gives you control. It's a simple, English-based language that allows you, the business owner, to write "Plays"—automated strategies that your store will run for you.

### Your Command Reference

- `CREATE`: Add a new product, discount, or blog post.
- `GET`: Find customers, products, or orders based on rules.
- `CONNECT`: Link a review to a product or a product to a collection.
- `RECORD`: Log an important business event, like a customer support call.
- `CHECK`: Make decisions based on data (e.g., `CHECK IF a customer's total spending is OVER $1000`).
- `NOTIFY`: Send an email, SMS, or push notification.
- `WAIT`: Pause for a specific time to act at the perfect moment.

### Your Automated Strategies, In Action

#### **Play 1: The "High-Value Cart Recovery" Play**

**Goal:** Prevent your most valuable customers from abandoning their carts.

**FEATURE:** High-Value Cart Recovery

**WHEN** a customer abandons a cart

**FLOW:**

**GET** the total value of the abandoned cart
**SAVE AS** cart value

**CHECK** IF cart value is **OVER** $200
**THEN** **WAIT** 30 minutes // Act quickly for high-value carts
**CREATE** a unique discount code **FOR** free shipping
**NOTIFY** the customer **VIA** email **WITH** a personal message and the free shipping code.
**ELSE** **WAIT** 2 hours
**NOTIFY** the customer **VIA** email **WITH** a standard cart reminder.

#### **Play 2: The "Customer Win-Back" Play**

**Goal:** Automatically re-engage customers who haven't purchased in a while.

**FEATURE:** Customer Win-Back Campaign

**WHEN** the system runs its daily check

**FLOW:**

**GET** all customers **WHOSE** last order was between 90 and 100 days ago
**SAVE AS** lapsed customers

**FOR EACH** customer **IN** lapsed customers
**DO** **CREATE** a unique discount code **FOR** 20% off
**NOTIFY** the customer **VIA** email
**WITH** the subject "We've Missed You\!"
**WITH** a personal message and their unique 20% off code.
**RECORD** a "win_back_offer_sent" event **FOR** that customer.
