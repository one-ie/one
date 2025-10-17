## The Six-Dimension Data Structure for Nine Padel

This is the blueprint for all your data, from static content files in your Astro project to dynamic data handled by Cloudflare.

### 1. The `Group`: Your Business Core

This is the root of everything. It's a single, foundational object that defines the entire application's context.

- **The Thing:** A single `group` `Thing` named **"Nine Padel Store"**.
    
- **Implementation:** This can be a simple JSON object in your project's configuration (`src/config.ts`) that holds site-wide metadata like the store name, currency (GBP), and domain.
    

### 2. The `People`: Your Users

This dimension defines the actors interacting with your site.

- **The Things:**
    
    - `customer`: Represents any visitor. They start as an **anonymous user** (identified by a session ID) and become a **known customer** upon login or purchase.
        
    - `staff`: Represents an administrator who can manage content.
        
- **Implementation:**
    
    - **Customers:** Stored in persistent storage. A user's session ID and authentication state are managed via Cloudflare Workers and browser cookies.
        
    - **Staff:** Can be a simple list of users in your config for a basic setup, or a table in the database for a multi-user admin panel.
        

### 3. The `Things`: Your Content and Commerce Objects

These are the "nouns" of your website. In Astro, most of these will live in your `src/content/` directory as content collections.

- **The Things:**
    
    - `product`: Rackets, bags, shoes, etc. **This is your core collection.**
        
    - `guide`: Buying guides, blog posts, and technique articles.
        
    - `brand`: Brand-specific pages with their story and associated products.
        
    - `review`: User-submitted reviews.
        
    - `shopping_cart`: A temporary object holding the items a user intends to buy.
        
    - `order`: A permanent record of a completed purchase.
        
- **Implementation:**
    
    - **Static Content (`src/content/`):**
        
        - `/products/*.md`: Each file is a `product` `Thing`.
            
        - `/guides/*.md`: Each file is a `guide` `Thing`.
            
        - `/brands/*.md`: Each file is a `brand` `Thing`.
            
    - **Dynamic Data (handled by Cloudflare):**
        
        - **`shopping_cart`:** A JSON object stored in **Cloudflare KV**, keyed by the user's session ID. It's fast, cheap, and perfect for transient data.
            
        - **`order` & `review`:** Records created via API calls to a **Cloudflare Worker**, which then saves them to a **Cloudflare D1** database.
            

### 4. The `Connections`: How Everything Relates

These relationships bring your content to life, allowing you to build a rich, interconnected site.

- **The Relationships:**
    
    - `product` **`manufactured_by`** `brand`.
        
    - `review` **`is_about`** `product`.
        
    - `customer` **`places`** `order`.
        
    - `order` **`contains`** `product`.
        
- **Implementation:**
    
    - These connections are defined directly within your content files using Astro's content relationships. For example, in a `product`'s frontmatter, you'd have a `brand: 'bullpadel'` slug that links to the corresponding `brand` file.
        

### 5. The `Events`: The Story of User Interaction

This is the real-time stream of every action taken on your site. It's the fuel for all your analytics and automation.

- **The Actions:**
    
    - `page_viewed`, `product_viewed`, `filter_applied`, `add_to_cart`, `order_placed`.
        
- **Implementation:**
    
    - A lightweight JavaScript snippet on your Astro pages sends these events to a dedicated **Cloudflare Worker endpoint** (e.g., `/api/log-event`).
        
    - This worker validates the event and writes it to a table in your **Cloudflare D1** database. This process is incredibly fast and doesn't slow down the user experience.
        

### 6. The `Knowledge`: Your Site's Brain (The Frontmatter)

This is the metadata that makes your site intelligent and dynamic. In Astro, this is almost entirely handled by the **frontmatter** of your markdown files.

- **The Labels:**
    
    - For a `product`: `skill_level`, `racket_style`, `player_trait`, `shape`.
        
    - For a `guide`: `topic`, `relates_to_skill`.
        
- **Implementation:**
    
    - Inside `src/content/products/bullpadel-vertex.md`:
        
        YAML
        
        ```
        ---
        name: "Bullpadel Vertex 04"
        price: 250
        brand: 'bullpadel' # This creates the Connection
        knowledge:
          skill_level: 'advanced'
          racket_style: 'power'
          shape: 'diamond'
          player_trait: null # Not specifically for elbow pain
        ---
        Product description goes here...
        ```
        

---

## The Loops: How Your Website Gets Smarter

This is how you turn your static site into a dynamic, self-improving engine.

### The Attract Loop: From Search to Session 🔎

1. **Action:** You create a new `guide` file: `src/content/guides/choosing-a-beginner-racket.md`.
    
2. **Knowledge:** You fill its frontmatter: `topic: 'equipment_selection'`, `relates_to_skill: 'beginner'`.
    
3. **Connection:** In the guide, you link to three specific `product` `Things` that have the `skill_level: 'beginner'` `Knowledge` label.
    
4. **Result:** Astro builds a perfectly optimized static HTML page. A user searching Google finds this expert content. They click the link, landing on your site and logging a `page_viewed` `Event`. The loop completes when they click on a recommended racket, logging a `product_viewed` `Event` and starting their conversion journey.
    

### The Convert Loop: From Browser to Buyer 🛒

1. **Action:** A visitor is on your product gallery page. They use the UI to filter by `skill_level: 'intermediate'`.
    
2. **Event:** A `filter_applied` `Event` is logged to your D1 database.
    
3. **Knowledge:** Astro's front-end JavaScript instantly filters the displayed products by reading the `knowledge.skill_level` frontmatter from all `product` `Things`.
    
4. **Result:** The user sees a perfectly curated list, finds the right racket, adds it to their cart (`add_to_cart` event), and completes the checkout via a Cloudflare Worker that creates a permanent `order` `Thing`. The loop completes as their anonymous session is now connected to a `customer` `Thing` with a purchase history.
    

### The Grow Loop: From Buyer to Loyalist 👑

1. **Action:** A scheduled Cloudflare Worker runs once a day to analyze the `events` table in your D1 database.
    
2. **Intelligence:** The worker discovers an **insight**: "75% of customers who buy a `product` with `skill_level: 'advanced'` also view a `guide` with `topic: 'technique'`."
    
3. **Automation:** The system now has a new rule. When a new `order_placed` `Event` occurs for an advanced racket, it triggers a 7-day countdown. After 7 days, another worker sends a personalized email: "Ready to master your new racket? Here are 3 advanced technique guides our pros recommend."
    
4. **Result:** The customer is re-engaged with valuable content, pulling them back to the site. This builds immense loyalty and creates opportunities for follow-up purchases of accessories. The loop completes when they return and start a new session.