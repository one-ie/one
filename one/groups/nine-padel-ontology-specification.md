Here is the complete and well-described ontology specification for Nine Padel, designed to transform it from a standard e-commerce store into an intelligent, automated commerce engine.

## Nine Padel - Ontology Specification

Version: 1.0.0 (Commerce Engine Architecture)

Status: Complete

Design Principle: This ontology models the entire customer journey and business operations in six dimensions. It serves as the single source of truth for the website, marketing automation, and external integrations like conversational AI agents.

### The Philosophy: From Store to Engine

A standard e-commerce site is a passive collection of products. An **intelligent commerce engine** is a sentient system that understands its customers, anticipates their needs, and proactively guides them on their journey. This ontology provides the structure for that intelligence.

Everything at Nine Padel—every product, every customer, every click, every purchase—is modeled within these six fundamental dimensions.

```
┌──────────────────────────────────────────────────────────────┐
│                         1. GROUP                              │
│  The business entity: "Nine Padel Store"                      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                         2. PEOPLE                             │
│  The actors: The store owners, staff, and customers           │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                         3. THINGS                             │
│  The objects: Rackets, bags, orders, guides, reviews          │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                      4. CONNECTIONS                           │
│  The relationships: Customer "places" order, Racket           │
│  "manufactured_by" brand                                      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                         5. EVENTS                             │
│  The actions: Product "viewed", Order "placed", Review        │
│  "submitted"                                                  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                       6. KNOWLEDGE                            │
│  The meaning: Labels for skill level, playing style,          │
│  customer value, and order status                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. GROUP: The Business Boundary

This dimension provides the top-level container for all of Nine Padel's data, ensuring it is treated as a single, cohesive business unit.

### Group Structure

TypeScript

```
{
  _id: Id<'groups'>,
  slug: 'nine-padel-store',
  name: 'Nine Padel Store',
  type: 'business',
  metadata: {
    domain: 'ninepadel.com',
    currency: 'GBP',
    country: 'UK'
  },
  status: 'active',
  createdAt: number
}
```

---

## 2. PEOPLE: The Actors

This dimension defines who is interacting with the store and what their role is.

### Person Roles

1. **`store_owner`**: Has full administrative access to manage products, view analytics, and configure the system.
    
2. **`staff`**: Can manage orders, respond to customer inquiries, and update content.
    
3. **`customer`**: A user who browses, buys, and interacts with the store's content.
    

### Person Structure

TypeScript

```
{
  _id: Id<'people'>,
  email: string,
  role: 'store_owner' | 'staff' | 'customer',
  displayName?: string,
  shippingAddress?: { /* ... */ },
  billingAddress?: { /* ... */ },
  createdAt: number
}
```

---

## 3. THINGS: The Nouns of the Business 🎾

This is the largest dimension, representing every tangible and conceptual object in the Nine Padel ecosystem.

### Thing Types (`ThingType`)

- **Catalog & Inventory (6 types):**
    
    - `product_racket`: A padel racket with detailed specifications.
        
    - `product_bag`: A padel bag or backpack.
        
    - `product_shoe`: Specialized padel footwear.
        
    - `product_apparel`: Shirts, shorts, wristbands, etc.
        
    - `product_accessory`: Balls, grips, protectors, etc.
        
    - `brand`: The manufacturer of a product (e.g., Head, Babolat, Nox).
        
- **Commerce & Orders (4 types):**
    
    - `order`: A record of a completed customer purchase.
        
    - `shopping_cart`: A temporary container for a user's session.
        
    - `payment`: A record of a financial transaction.
        
    - `discount_code`: A promotional code for a discount.
        
- **Content & Engagement (4 types):**
    
    - `guide`: An informational article or buying guide.
        
    - `customer_review`: A customer's rating and feedback on a product.
        
    - `quiz`: The Racket Finder Quiz itself.
        
    - `quiz_result`: A personalized racket recommendation for a specific user.
        
- **Marketing & Analytics (3 types):**
    
    - `insight`: An AI-generated observation about business performance.
        
    - `customer_segment`: A dynamic group of customers (e.g., "High-Value Whales").
        
    - `ad_campaign`: A record of a marketing campaign.
        
- **System & Integration (1 type):**
    
    - `external_agent`: Represents a connection to an external platform like ChatGPT or Gemini.
        

### Properties by Key Thing Type

- **`product_racket` Properties:**
    
    TypeScript
    
    ```
    {
      sku: string,
      brandId: Id<'things'>, // Connection to the 'brand' Thing
      price: number,
      weight: number, // In grams
      shape: 'round' | 'teardrop' | 'diamond',
      balance: 'head-light' | 'even' | 'head-heavy',
      coreMaterial: 'soft_eva' | 'medium_eva' | 'hard_eva',
      surfaceMaterial: 'fiberglass' | 'carbon_fiber_3k' | 'carbon_fiber_12k',
      stockQuantity: number,
      // ... other properties like images, description
    }
    ```
    
- **`order` Properties:**
    
    TypeScript
    
    ```
    {
      orderNumber: string,
      customerId: Id<'people'>,
      items: [{ productId: Id<'things'>, quantity: number, price: number }],
      subtotal: number,
      shippingCost: number,
      totalAmount: number,
      shippingAddress: { /* ... */ },
      orderDate: number,
    }
    ```
    
- **`customer_segment` Properties:**
    
    TypeScript
    
    ```
    {
      segmentName: 'Whales' | 'Loyalists' | 'Evangelists',
      description: 'Customers with LTV > £1000',
      criteria: { /* JSON defining the rules for this segment */ },
      memberCount: number,
    }
    ```
    

---

## 4. CONNECTIONS: The Relationships

This dimension describes how `Things` and `People` relate to each other, forming the business's knowledge graph.

### Connection Types (`ConnectionType`)

- **Ownership & Creation (2):** `created_by`, `manufactured_by`
    
- **Commerce (4):** `places` (customer → order), `contains` (order → product), `uses` (order → discount_code), `purchased` (customer → product)
    
- **Engagement (5):** `writes` (customer → review), `is_about` (review → product), `receives` (customer → quiz_result), `viewed` (customer → guide), `targets` (campaign → segment)
    
- **System (1):** `communicates_with` (sales_agent → external_agent)
    

### Common Connection Patterns

- **A Customer Makes a Purchase:**
    
    - `customer` → `places` → `order`
        
    - `order` → `contains` → `product_racket`
        
- **A Brand Makes a Product:**
    
    - `product_racket` → `manufactured_by` → `brand`
        
- **A Customer Leaves Feedback:**
    
    - `customer` → `writes` → `customer_review`
        
    - `customer_review` → `is_about` → `product_racket`
        

---

## 5. EVENTS: The Actions

This dimension is the immutable log of every action that has ever happened, providing a perfect audit trail for analytics and automation.

### Event Types (`EventType`)

- **Discovery Events:** `session_started`, `product_viewed`, `guide_viewed`, `quiz_completed`
    
- **Commerce Events:** `product_added_to_cart`, `cart_abandoned`, `order_placed`, `payment_processed`
    
- **Post-Purchase Events:** `order_shipped`, `order_delivered`, `review_submitted`
    
- **System & AI Events:** `insight_generated`, `customer_segment_updated`, `stock_level_low`
    

### Event Patterns

- **`order_placed` Event:**
    
    TypeScript
    
    ```
    {
      type: 'order_placed',
      actorId: customerId, // The person who acted
      targetId: orderId,   // The thing that was acted upon
      timestamp: Date.now(),
      metadata: {
        totalAmount: 150.00,
        currency: 'GBP',
        itemCount: 2,
        shippingMethod: 'standard_delivery',
        protocol: 'website' // Or 'acp' if from ChatGPT
      }
    }
    ```
    

---

## 6. KNOWLEDGE: The Meaning and Intelligence

This is the "brain." It provides the labels, tags, and semantic context that power search, personalization, and AI agents.

### Knowledge Types

- `label`: A simple, categorical tag.
    
- `chunk`: A piece of text with a vector embedding for semantic search (e.g., a paragraph from a `guide` or a `customer_review`).
    

### Key Knowledge Labels

- **Product Attributes:** `skill_level:beginner`, `racket_style:control`, `player_trait:elbow_sensitive`.
    
- **Customer Segments:** `customer_archetype:whale`, `customer_archetype:loyalist`, `playing_style:aggressive_baseliner`.
    
- **Operational Statuses:** `order_status:shipped`, `stock_status:in_stock`, `review_status:approved`.
    
- **Content Topics:** `topic:technique`, `topic:equipment_care`, `goal:improve_control`.
    

---

## How Features Map to the Ontology

### Feature: The Racket Finder Quiz

1. **Things:** A `quiz` `Thing` (the questions) and a `quiz_result` `Thing` (the recommendation).
    
2. **Connections:** The `customer` **receives** the `quiz_result`.
    
3. **Events:** `quiz_completed` is logged when the user submits their answers.
    
4. **Knowledge:** The quiz maps user answers to **Knowledge** labels (`player_trait:elbow_sensitive`, `playing_style:defensive`) to find the perfectly matching `product_racket`.
    

### Feature: Purchase in ChatGPT

1. **Things:** An `external_agent` `Thing` represents the connection. A new `customer` and `order` `Thing` are created.
    
2. **Connections:** `sales_agent` **communicates_with** `external_agent`.
    
3. **Events:** An `order_placed` `Event` is logged with `metadata.protocol: 'acp'`.
    
4. **Knowledge:** The user's chat query ("racket for elbow pain") is used to filter products with the `player_trait:elbow_sensitive` label.
    

---

## Summary Statistics

- **Dimensions:** 6
    
- **Thing Types:** 18
    
- **Connection Types:** 12
    
- **Event Types:** 13
    
- **Key Knowledge Vocabularies:** 4 (Product, Customer, Operations, Content)
    

### For Implementers

This ontology is your blueprint. Every new feature, marketing campaign, or analytics dashboard should start with the question: "How does this map to our six dimensions?" By adhering to this structure, you ensure that every piece of data you collect makes the entire system smarter, more automated, and more valuable to the customer.