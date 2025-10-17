### The Core: A Minimal E-Commerce System

At its heart, any online store can be described with this simple structure:

1. **Group:** The store itself (`Nine Padel Store`).
    
2. **People:** The `store_owner` and the `customer`.
    
3. **Things:** The `product` being sold and the `order` to purchase it.
    
4. **Connections:** The customer `places` an order. The order `contains` a product.
    
5. **Events:** A `product_viewed` event, leading to an `order_placed` event.
    
6. **Knowledge:** The `order_status` (e.g., `pending`, `shipped`).
    

This minimal model provides the foundation. Now, we'll expand it with the specific details from ninepadel.com to create a complete and tailored ontology.

---

### Ontology for NinePadel.com 🎾

This ontology models the specific operations of the Nine Padel e-commerce store, from its product catalog to customer interactions.

#### 1. Group

The highest-level container that represents the entire business entity.

- **`Nine Padel Store`**: This group provides the multi-tenant boundary for all data, including products, customers, and orders related to the store.
    

#### 2. People

The actors who interact with and within the store.

- **`store_owner`**: The individuals who run the business. They have full access to manage products, view analytics, and oversee operations.
    
- **`staff`**: Employees responsible for customer service, fulfilling orders, and managing website content.
    
- **`customer`**: Padel players who browse the site, use the tools, and purchase equipment.
    

#### 3. Things

These are all the distinct "nouns" or entities that exist within the Nine Padel ecosystem.

- **Products & Catalog:**
    
    - `product_racket`: The core product. Properties include `brand`, `weight`, `shape`, and `balance`.
        
    - `product_bag`: Padel bags and backpacks.
        
    - `product_shoe`: Specialized footwear.
        
    - `product_apparel`: Shirts, shorts, and other clothing.
        
    - `product_accessory`: Includes balls, grips, and protective gear.
        
    - `brand`: The manufacturer of a product (e.g., Head, Babolat, Nox).
        
- **Commerce & Engagement:**
    
    - `order`: A record of a customer's purchase, containing items, shipping details, and payment status.
        
    - `shopping_cart`: A temporary container for items a customer intends to buy.
        
    - `customer_review`: Feedback and ratings provided by a customer for a specific product.
        
    - `guide`: An informational resource, like the "Racket Buying Guide."
        
    - `quiz_result`: The personalized racket recommendation generated for a customer after they complete the quiz.
        

#### 4. Connections

These are the relationships that describe how the "Things" interact with each other and with "People."

- `customer` **places** `order`.
    
- `order` **contains** `product_racket` (and other products).
    
- `product_racket` is **manufactured_by** `brand`.
    
- `customer` **writes** `customer_review`.
    
- `customer_review` **is_about** `product_racket`.
    
- `customer` **receives** `quiz_result`.
    

#### 5. Events

These are the time-stamped actions that occur within the system, providing a complete audit trail.

- **User & Discovery Events:**
    
    - `user_registered`: A customer creates an account on the site.
        
    - `product_viewed`: A user views the details of a specific item.
        
    - `quiz_completed`: A user submits their answers to the racket finder quiz.
        
- **Commerce Events:**
    
    - `product_added_to_cart`: An item is added to the shopping cart.
        
    - `order_placed`: A customer successfully completes the checkout process.
        
    - `payment_event`: The payment is successfully processed.
        
    - `order_shipped`: The order has been dispatched from the warehouse.
        
- **Post-Purchase Events:**
    
    - `review_submitted`: A customer posts a new product review.
        
    - `customer_support_request`: A customer contacts support via WhatsApp.
        

#### 6. Knowledge

This dimension provides the metadata, tags, and semantic meaning that make the data searchable, filterable, and intelligent.

- **Product Attributes:**
    
    - `skill_level`: `beginner`, `intermediate`, `advanced`.
        
    - `racket_style`: `control`, `balanced`, `power`.
        
    - `product_category`: `rackets`, `bags`, `apparel`.
        
- **Operational Statuses:**
    
    - `order_status`: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.
        
    - `stock_status`: `in_stock`, `out_of_stock`, `pre_order`.
        
- **Taxonomy:**
    
    - `brand_name`: `adidas`, `bullpadel`, `head`, `nox`.
        
    - `gender`: `men`, `women`, `junior`.