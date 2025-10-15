# Ontology UI Specification

**Frontend-complete ontology: Data model + UI model = Complete specification**

---

## Overview

The ONE ontology extends beyond data modeling to include UI rendering instructions. For each thing type, we define not just **what data it contains**, but **how it should be displayed**.

**Benefits:**
- ✅ Generic components work for all 66 thing types
- ✅ Consistent UI across entire platform
- ✅ Add new type → UI updates automatically
- ✅ Frontend is just a renderer (no hardcoded logic)
- ✅ Customizable per organization

**Implementation:**
- Built on [shadcn/ui](https://ui.shadcn.com) - Beautiful, accessible components
- Uses Radix UI primitives (WAI-ARIA compliant)
- Styled with Tailwind CSS
- Dark mode included
- You own the code (copy-paste components)

---

## UI Metadata Schema

For each thing type, add a `ui` object:

```typescript
interface ThingTypeUI {
  // Primary component type
  component: 'Card' | 'List' | 'Table' | 'Kanban' | 'Timeline' | 'Custom'

  // Layout configurations
  layouts: {
    grid?: { columns: number; gap: string; responsive?: boolean }
    list?: { orientation: 'horizontal' | 'vertical'; gap: string; compact?: boolean }
    detail?: { width: string; centered?: boolean; sidebar?: boolean }
    table?: { density: 'compact' | 'comfortable' | 'spacious'; sortable?: boolean }
  }

  // Field rendering instructions
  fields: Record<string, FieldUI>

  // Available views
  views: {
    card?: { default?: boolean; fields: string[] }
    list?: { fields: string[] }
    detail?: { fields: string[] | '*' }
    table?: { fields: string[] }
  }

  // User actions
  actions: {
    primary?: ActionConfig
    secondary?: ActionConfig[]
    context?: ActionConfig[]  // Right-click/long-press menu
  }

  // Connection display
  connections?: Record<string, ConnectionUI>

  // Empty state
  empty?: EmptyStateConfig

  // Search configuration
  search?: {
    fields: string[]  // Which fields to search
    placeholder: string
    filters?: FilterConfig[]
  }

  // Grouping/sorting
  organization?: {
    groupBy?: string[]  // Fields that can group by
    sortBy?: string[]   // Fields that can sort by
    defaultSort?: { field: string; order: 'asc' | 'desc' }
  }
}

interface FieldUI {
  component: string  // 'Heading' | 'Text' | 'Price' | 'Image' | 'Badge' | etc.
  label?: string     // Display label
  required?: boolean
  hidden?: boolean   // Hide in certain views
  // Component-specific props
  [key: string]: any
}

interface ActionConfig {
  action: string     // 'create' | 'edit' | 'delete' | 'enroll' | 'purchase' | etc.
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  confirm?: string   // Confirmation message
  permission?: string // Required permission
}

interface ConnectionUI {
  label: string      // "{count} students" or "by {name}"
  icon?: string
  display: 'badge' | 'inline' | 'avatar' | 'list'
  link?: boolean     // Make clickable
  max?: number       // Max items to show
}

interface EmptyStateConfig {
  icon: string
  title: string
  description: string
  action?: ActionConfig
}
```

---

## Thing Type Specifications

### 1. Course

```typescript
{
  type: "course",
  description: "Educational course or training program",

  properties: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    price: { type: "number", required: false },
    currency: { type: "string", default: "USD" },
    duration: { type: "string", required: false },
    level: { type: "enum", values: ["beginner", "intermediate", "advanced"] },
    category: { type: "string", required: false },
    tags: { type: "array", items: "string" },
    thumbnail: { type: "url", required: false },
    publishedAt: { type: "timestamp", required: false },
    featured: { type: "boolean", default: false },
    status: { type: "enum", values: ["draft", "published", "archived"] }
  },

  ui: {
    component: "Card",

    layouts: {
      grid: {
        columns: 3,
        gap: "lg",
        responsive: true  // 1 col mobile, 2 tablet, 3 desktop
      },
      list: {
        orientation: "horizontal",
        gap: "md",
        compact: false
      },
      detail: {
        width: "prose",
        centered: true,
        sidebar: true  // Show related content in sidebar
      }
    },

    fields: {
      title: {
        component: "Heading",
        size: "xl",
        weight: "bold",
        truncate: 2,  // Max 2 lines
        required: true
      },
      description: {
        component: "Text",
        lines: 3,     // Show 3 lines max
        size: "base",
        color: "muted",
        expandable: true  // "Read more" on click
      },
      price: {
        component: "Price",
        currency: "USD",
        format: "compact",  // $99 vs $99.00
        badge: true,        // Show as badge
        free: { label: "Free", badge: true }  // Show "Free" if price = 0
      },
      thumbnail: {
        component: "Image",
        aspect: "video",  // 16:9
        lazy: true,
        placeholder: "/defaults/course.jpg",
        fallback: "/defaults/course-fallback.jpg"
      },
      level: {
        component: "Badge",
        colors: {
          beginner: "green",
          intermediate: "yellow",
          advanced: "red"
        },
        icon: {
          beginner: "leaf",
          intermediate: "zap",
          advanced: "flame"
        }
      },
      category: {
        component: "Text",
        size: "sm",
        color: "muted",
        icon: "folder"
      },
      tags: {
        component: "TagList",
        max: 3,
        color: "blue",
        moreLabel: "+{count} more"
      },
      duration: {
        component: "Text",
        size: "sm",
        icon: "clock",
        format: (value) => `${value} hours`
      },
      publishedAt: {
        component: "Date",
        format: "relative",  // "2 days ago"
        icon: "calendar"
      },
      featured: {
        component: "Badge",
        label: "Featured",
        color: "purple",
        icon: "star",
        showOnlyIf: true  // Only show if featured = true
      },
      status: {
        component: "Badge",
        colors: {
          draft: "gray",
          published: "green",
          archived: "red"
        }
      }
    },

    views: {
      card: {
        default: true,
        fields: ["thumbnail", "title", "description", "price", "level", "duration"]
      },
      list: {
        fields: ["thumbnail", "title", "category", "duration", "price"]
      },
      detail: {
        fields: "*"  // All fields
      },
      table: {
        fields: ["title", "category", "level", "price", "publishedAt", "status"]
      }
    },

    actions: {
      primary: {
        action: "enroll",
        label: "Enroll Now",
        icon: "check",
        variant: "primary"
      },
      secondary: [
        {
          action: "preview",
          label: "Preview",
          icon: "eye",
          variant: "ghost"
        },
        {
          action: "share",
          label: "Share",
          icon: "share",
          variant: "ghost"
        },
        {
          action: "bookmark",
          label: "Save",
          icon: "bookmark",
          variant: "ghost"
        }
      ],
      context: [
        {
          action: "edit",
          label: "Edit",
          icon: "edit",
          permission: "course.edit"
        },
        {
          action: "duplicate",
          label: "Duplicate",
          icon: "copy"
        },
        {
          action: "delete",
          label: "Delete",
          icon: "trash",
          variant: "danger",
          confirm: "Are you sure you want to delete this course?"
        }
      ]
    },

    connections: {
      enrolled_in: {
        label: "{count} students enrolled",
        icon: "users",
        display: "badge",
        link: true
      },
      contains: {
        label: "{count} lessons",
        icon: "list",
        display: "inline",
        link: true
      },
      created_by: {
        label: "by {name}",
        icon: "user",
        display: "avatar",
        link: true
      },
      tagged_with: {
        label: "{name}",
        icon: "tag",
        display: "badge",
        max: 5
      }
    },

    empty: {
      icon: "book",
      title: "No courses yet",
      description: "Create your first course to get started",
      action: {
        action: "create",
        label: "Create Course",
        icon: "plus",
        variant: "primary"
      }
    },

    search: {
      fields: ["title", "description", "tags", "category"],
      placeholder: "Search courses...",
      filters: [
        {
          field: "level",
          label: "Level",
          type: "select",
          options: ["beginner", "intermediate", "advanced"]
        },
        {
          field: "category",
          label: "Category",
          type: "select"
        },
        {
          field: "price",
          label: "Price",
          type: "range",
          min: 0,
          max: 500
        }
      ]
    },

    organization: {
      groupBy: ["category", "level", "status"],
      sortBy: ["title", "price", "publishedAt", "enrollments"],
      defaultSort: { field: "publishedAt", order: "desc" }
    }
  }
}
```

---

### 2. Lesson

```typescript
{
  type: "lesson",
  description: "Individual lesson within a course",

  properties: {
    title: { type: "string", required: true },
    description: { type: "string", required: false },
    content: { type: "markdown", required: true },
    videoUrl: { type: "url", required: false },
    duration: { type: "number", required: false },  // minutes
    order: { type: "number", required: true },
    completed: { type: "boolean", default: false },
    type: { type: "enum", values: ["video", "text", "quiz", "assignment"] },
    resources: { type: "array", items: "object" }
  },

  ui: {
    component: "List",

    layouts: {
      list: {
        orientation: "vertical",
        gap: "sm",
        compact: true
      },
      detail: {
        width: "prose",
        centered: true,
        sidebar: true
      }
    },

    fields: {
      title: {
        component: "Heading",
        size: "lg",
        weight: "semibold"
      },
      description: {
        component: "Text",
        size: "sm",
        color: "muted",
        lines: 2
      },
      content: {
        component: "Markdown",
        className: "prose prose-lg"
      },
      videoUrl: {
        component: "Video",
        controls: true,
        autoplay: false,
        muted: false
      },
      duration: {
        component: "Text",
        size: "sm",
        icon: "clock",
        format: (value) => `${value} min`
      },
      order: {
        component: "Badge",
        label: "Lesson {value}",
        color: "gray",
        size: "sm"
      },
      completed: {
        component: "Checkbox",
        label: "Mark as complete",
        checkedIcon: "check-circle",
        uncheckedIcon: "circle"
      },
      type: {
        component: "Badge",
        colors: {
          video: "blue",
          text: "gray",
          quiz: "purple",
          assignment: "orange"
        },
        icons: {
          video: "play",
          text: "file-text",
          quiz: "help-circle",
          assignment: "edit"
        }
      },
      resources: {
        component: "ResourceList",
        showDownload: true,
        showPreview: true
      }
    },

    views: {
      list: {
        default: true,
        fields: ["order", "title", "type", "duration", "completed"]
      },
      detail: {
        fields: "*"
      }
    },

    actions: {
      primary: {
        action: "start",
        label: "Start Lesson",
        icon: "play",
        variant: "primary"
      },
      secondary: [
        {
          action: "complete",
          label: "Mark Complete",
          icon: "check",
          variant: "ghost"
        },
        {
          action: "next",
          label: "Next Lesson",
          icon: "arrow-right",
          variant: "ghost"
        }
      ]
    },

    connections: {
      part_of: {
        label: "Part of {name}",
        icon: "folder",
        display: "inline",
        link: true
      },
      completed_by: {
        label: "{count} completed",
        icon: "check",
        display: "badge"
      }
    },

    empty: {
      icon: "file-text",
      title: "No lessons yet",
      description: "Add lessons to build your course",
      action: {
        action: "create",
        label: "Add Lesson",
        icon: "plus"
      }
    }
  }
}
```

---

### 3. Product

```typescript
{
  type: "product",
  description: "Physical product for sale",

  properties: {
    name: { type: "string", required: true },
    description: { type: "string", required: true },
    price: { type: "number", required: true },
    compareAtPrice: { type: "number", required: false },
    currency: { type: "string", default: "USD" },
    sku: { type: "string", required: false },
    inventory: { type: "number", default: 0 },
    images: { type: "array", items: "url" },
    category: { type: "string", required: false },
    tags: { type: "array", items: "string" },
    weight: { type: "number", required: false },
    dimensions: { type: "object", required: false },
    shippable: { type: "boolean", default: true },
    featured: { type: "boolean", default: false }
  },

  ui: {
    component: "Card",

    layouts: {
      grid: {
        columns: 4,
        gap: "md",
        responsive: true
      },
      list: {
        orientation: "horizontal",
        gap: "md",
        compact: false
      },
      detail: {
        width: "full",
        centered: false,
        sidebar: true
      }
    },

    fields: {
      name: {
        component: "Heading",
        size: "xl",
        weight: "bold",
        truncate: 2
      },
      description: {
        component: "Text",
        size: "base",
        color: "default",
        lines: 3,
        expandable: true
      },
      price: {
        component: "Price",
        currency: "USD",
        size: "lg",
        weight: "bold"
      },
      compareAtPrice: {
        component: "Price",
        currency: "USD",
        size: "sm",
        strikethrough: true,
        color: "muted"
      },
      images: {
        component: "ImageGallery",
        aspect: "square",
        lazy: true,
        zoom: true,
        thumbnails: true
      },
      inventory: {
        component: "Badge",
        label: (value) => value > 0 ? `${value} in stock` : "Out of stock",
        color: (value) => value > 0 ? "green" : "red",
        icon: "package"
      },
      sku: {
        component: "Text",
        size: "xs",
        color: "muted",
        label: "SKU:",
        monospace: true
      },
      tags: {
        component: "TagList",
        max: 5,
        color: "blue"
      },
      category: {
        component: "Breadcrumb",
        separator: "/"
      },
      featured: {
        component: "Badge",
        label: "Featured",
        color: "yellow",
        icon: "star",
        showOnlyIf: true
      }
    },

    views: {
      card: {
        default: true,
        fields: ["images", "name", "price", "compareAtPrice"]
      },
      list: {
        fields: ["images", "name", "price", "inventory", "sku"]
      },
      detail: {
        fields: "*"
      },
      table: {
        fields: ["name", "sku", "price", "inventory", "category"]
      }
    },

    actions: {
      primary: {
        action: "addToCart",
        label: "Add to Cart",
        icon: "shopping-cart",
        variant: "primary"
      },
      secondary: [
        {
          action: "wishlist",
          label: "Add to Wishlist",
          icon: "heart",
          variant: "ghost"
        },
        {
          action: "share",
          label: "Share",
          icon: "share",
          variant: "ghost"
        }
      ]
    },

    connections: {
      purchased_by: {
        label: "{count} sold",
        icon: "shopping-bag",
        display: "badge"
      },
      reviewed_by: {
        label: "{count} reviews",
        icon: "star",
        display: "badge",
        link: true
      },
      in_category: {
        label: "{name}",
        icon: "folder",
        display: "inline",
        link: true
      }
    },

    empty: {
      icon: "shopping-bag",
      title: "No products yet",
      description: "Add products to start selling",
      action: {
        action: "create",
        label: "Add Product",
        icon: "plus"
      }
    },

    search: {
      fields: ["name", "description", "sku", "tags"],
      placeholder: "Search products...",
      filters: [
        {
          field: "category",
          label: "Category",
          type: "select"
        },
        {
          field: "price",
          label: "Price",
          type: "range",
          min: 0,
          max: 1000
        },
        {
          field: "inventory",
          label: "In Stock",
          type: "boolean"
        }
      ]
    },

    organization: {
      groupBy: ["category", "featured"],
      sortBy: ["name", "price", "inventory", "createdAt"],
      defaultSort: { field: "createdAt", order: "desc" }
    }
  }
}
```

---

### 4. Post (Blog Post)

```typescript
{
  type: "post",
  description: "Blog post or article",

  properties: {
    title: { type: "string", required: true },
    content: { type: "markdown", required: true },
    excerpt: { type: "string", required: false },
    featuredImage: { type: "url", required: false },
    author: { type: "string", required: true },
    publishedAt: { type: "timestamp", required: false },
    slug: { type: "string", required: true },
    category: { type: "string", required: false },
    tags: { type: "array", items: "string" },
    status: { type: "enum", values: ["draft", "published", "scheduled", "archived"] },
    readTime: { type: "number", required: false },  // minutes
    views: { type: "number", default: 0 },
    featured: { type: "boolean", default: false }
  },

  ui: {
    component: "Card",

    layouts: {
      grid: {
        columns: 3,
        gap: "lg",
        responsive: true
      },
      list: {
        orientation: "vertical",
        gap: "lg",
        compact: false
      },
      detail: {
        width: "prose",
        centered: true,
        sidebar: false
      }
    },

    fields: {
      title: {
        component: "Heading",
        size: "2xl",
        weight: "bold",
        lineHeight: "tight"
      },
      content: {
        component: "Markdown",
        className: "prose prose-lg prose-headings:font-bold prose-a:text-blue-600"
      },
      excerpt: {
        component: "Text",
        size: "base",
        color: "muted",
        lines: 3,
        italic: true
      },
      featuredImage: {
        component: "Image",
        aspect: "wide",  // 21:9
        lazy: true,
        sizes: "(max-width: 768px) 100vw, 768px"
      },
      author: {
        component: "Text",
        size: "sm",
        weight: "medium",
        icon: "user"
      },
      publishedAt: {
        component: "Date",
        format: "full",  // "January 15, 2024"
        icon: "calendar"
      },
      category: {
        component: "Badge",
        color: "purple",
        size: "sm"
      },
      tags: {
        component: "TagList",
        max: 5,
        color: "gray"
      },
      status: {
        component: "Badge",
        colors: {
          draft: "gray",
          published: "green",
          scheduled: "blue",
          archived: "red"
        }
      },
      readTime: {
        component: "Text",
        size: "sm",
        color: "muted",
        icon: "clock",
        format: (value) => `${value} min read`
      },
      views: {
        component: "Text",
        size: "sm",
        color: "muted",
        icon: "eye",
        format: (value) => `${value.toLocaleString()} views`
      },
      featured: {
        component: "Badge",
        label: "Featured",
        color: "yellow",
        icon: "star",
        showOnlyIf: true
      }
    },

    views: {
      card: {
        default: true,
        fields: ["featuredImage", "category", "title", "excerpt", "author", "publishedAt", "readTime"]
      },
      list: {
        fields: ["featuredImage", "title", "excerpt", "author", "publishedAt", "views"]
      },
      detail: {
        fields: "*"
      }
    },

    actions: {
      primary: {
        action: "read",
        label: "Read Article",
        icon: "arrow-right",
        variant: "primary"
      },
      secondary: [
        {
          action: "bookmark",
          label: "Save",
          icon: "bookmark",
          variant: "ghost"
        },
        {
          action: "share",
          label: "Share",
          icon: "share",
          variant: "ghost"
        }
      ],
      context: [
        {
          action: "edit",
          label: "Edit",
          icon: "edit",
          permission: "post.edit"
        },
        {
          action: "delete",
          label: "Delete",
          icon: "trash",
          variant: "danger",
          confirm: "Delete this post?"
        }
      ]
    },

    connections: {
      written_by: {
        label: "by {name}",
        icon: "user",
        display: "avatar",
        link: true
      },
      tagged_with: {
        label: "{name}",
        icon: "tag",
        display: "badge",
        max: 5
      },
      commented_on: {
        label: "{count} comments",
        icon: "message-circle",
        display: "badge",
        link: true
      }
    },

    empty: {
      icon: "file-text",
      title: "No posts yet",
      description: "Write your first blog post",
      action: {
        action: "create",
        label: "Write Post",
        icon: "plus"
      }
    },

    search: {
      fields: ["title", "content", "excerpt", "tags"],
      placeholder: "Search posts...",
      filters: [
        {
          field: "category",
          label: "Category",
          type: "select"
        },
        {
          field: "author",
          label: "Author",
          type: "select"
        },
        {
          field: "publishedAt",
          label: "Published",
          type: "dateRange"
        }
      ]
    },

    organization: {
      groupBy: ["category", "author", "status"],
      sortBy: ["title", "publishedAt", "views"],
      defaultSort: { field: "publishedAt", order: "desc" }
    }
  }
}
```

---

### 5. Person (Creator)

```typescript
{
  type: "person",
  subtype: "creator",
  description: "Content creator, instructor, or team member",

  properties: {
    name: { type: "string", required: true },
    email: { type: "email", required: true },
    bio: { type: "markdown", required: false },
    avatar: { type: "url", required: false },
    role: { type: "enum", values: ["org_owner", "org_admin", "org_member", "instructor", "author"] },
    title: { type: "string", required: false },
    company: { type: "string", required: false },
    location: { type: "string", required: false },
    website: { type: "url", required: false },
    social: { type: "object", required: false },  // { twitter, linkedin, github }
    verified: { type: "boolean", default: false },
    featured: { type: "boolean", default: false }
  },

  ui: {
    component: "Card",

    layouts: {
      grid: {
        columns: 4,
        gap: "md",
        responsive: true
      },
      list: {
        orientation: "horizontal",
        gap: "md",
        compact: true
      },
      detail: {
        width: "prose",
        centered: true,
        sidebar: true
      }
    },

    fields: {
      name: {
        component: "Heading",
        size: "xl",
        weight: "bold"
      },
      email: {
        component: "Text",
        size: "sm",
        color: "muted",
        icon: "mail",
        link: true,  // mailto: link
        privacy: "private"  // Only show to authorized users
      },
      bio: {
        component: "Markdown",
        className: "prose prose-sm",
        lines: 5,
        expandable: true
      },
      avatar: {
        component: "Avatar",
        size: "xl",
        shape: "circle",
        fallback: "initials"  // Show initials if no avatar
      },
      role: {
        component: "Badge",
        colors: {
          org_owner: "purple",
          org_admin: "blue",
          org_member: "gray",
          instructor: "green",
          author: "yellow"
        },
        labels: {
          org_owner: "Owner",
          org_admin: "Admin",
          org_member: "Member",
          instructor: "Instructor",
          author: "Author"
        }
      },
      title: {
        component: "Text",
        size: "sm",
        weight: "medium",
        color: "default"
      },
      company: {
        component: "Text",
        size: "sm",
        color: "muted",
        icon: "building"
      },
      location: {
        component: "Text",
        size: "sm",
        color: "muted",
        icon: "map-pin"
      },
      website: {
        component: "Link",
        size: "sm",
        icon: "external-link",
        external: true
      },
      social: {
        component: "SocialLinks",
        display: "icons",
        size: "md",
        platforms: ["twitter", "linkedin", "github", "youtube"]
      },
      verified: {
        component: "Badge",
        label: "Verified",
        color: "blue",
        icon: "check-circle",
        showOnlyIf: true
      },
      featured: {
        component: "Badge",
        label: "Featured",
        color: "purple",
        icon: "star",
        showOnlyIf: true
      }
    },

    views: {
      card: {
        default: true,
        fields: ["avatar", "name", "title", "company", "role"]
      },
      list: {
        fields: ["avatar", "name", "title", "location", "social"]
      },
      detail: {
        fields: "*"
      }
    },

    actions: {
      primary: {
        action: "viewProfile",
        label: "View Profile",
        icon: "user",
        variant: "primary"
      },
      secondary: [
        {
          action: "message",
          label: "Message",
          icon: "mail",
          variant: "ghost"
        },
        {
          action: "follow",
          label: "Follow",
          icon: "user-plus",
          variant: "ghost"
        }
      ]
    },

    connections: {
      created: {
        label: "{count} courses",
        icon: "book",
        display: "badge",
        link: true
      },
      taught: {
        label: "{count} students",
        icon: "users",
        display: "badge"
      },
      member_of: {
        label: "{name}",
        icon: "building",
        display: "inline",
        link: true
      }
    },

    empty: {
      icon: "users",
      title: "No team members yet",
      description: "Invite people to join your team",
      action: {
        action: "invite",
        label: "Invite Member",
        icon: "user-plus"
      }
    },

    search: {
      fields: ["name", "email", "title", "bio"],
      placeholder: "Search people...",
      filters: [
        {
          field: "role",
          label: "Role",
          type: "select"
        },
        {
          field: "verified",
          label: "Verified",
          type: "boolean"
        }
      ]
    },

    organization: {
      groupBy: ["role", "company"],
      sortBy: ["name", "createdAt"],
      defaultSort: { field: "name", order: "asc" }
    }
  }
}
```

---

## Field Component Types

All field components are built with shadcn/ui for consistency and accessibility:

### Text Components
- `Heading` - Headings (h1-h6)
- `Text` - Body text
- `Markdown` - Markdown content
- `RichText` - Rich text editor output

### Media Components
- `Image` - Single image
- `ImageGallery` - Multiple images
- `Video` - Video player
- `Audio` - Audio player
- `Avatar` - User avatar

### Data Components
- `Price` - Formatted price
- `Date` - Formatted date/time
- `Number` - Formatted number
- `Percentage` - Formatted percentage
- `Badge` - Status badge
- `Tag` - Single tag
- `TagList` - Multiple tags

### Interactive Components
- `Link` - Hyperlink
- `Button` - Action button
- `Checkbox` - Checkbox input
- `Toggle` - Toggle switch
- `Rating` - Star rating
- `Progress` - Progress bar

### Complex Components
- `Table` - Data table
- `List` - Item list
- `Grid` - Item grid
- `Timeline` - Event timeline
- `Chart` - Data visualization
- `Map` - Geographic map

### Social Components
- `SocialLinks` - Social media links
- `ShareButtons` - Share buttons
- `CommentList` - Comments
- `LikeButton` - Like/favorite

---

## Quick Setup

```bash
# Install shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button badge avatar separator
```

That's it! Components use shadcn/ui automatically.

---

## Usage in Frontend

### Generic Component Example

```tsx
// frontend/src/components/generic/Card.tsx
import { useThingConfig } from '@/ontology/hooks'
import { Card as ShadCard, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Card({ thing }) {
  // Get UI config from ontology
  const config = useThingConfig(thing.type)
  const view = config.ui.views.card

  return (
    <ShadCard>
      <CardContent className="pt-6">
        {view.fields.map(fieldName => (
          <Field
            key={fieldName}
            name={fieldName}
            value={thing.properties[fieldName]}
            config={config.ui.fields[fieldName]}
          />
        ))}
      </CardContent>

      {config.ui.actions.primary && (
        <CardFooter>
          <Button
            onClick={() => handleAction(thing, config.ui.actions.primary.action)}
          >
            {config.ui.actions.primary.label}
          </Button>
        </CardFooter>
      )}
    </ShadCard>
  )
}
```

### Usage

```tsx
// Works for ANY thing type!
<Card thing={course} />
<Card thing={product} />
<Card thing={post} />
<Card thing={lesson} />
<Card thing={person} />
```

---

## Next Steps

### Immediate (Week 1)
- [ ] Complete UI specs for top 10 types
- [ ] Build generic Card component
- [ ] Build generic Field component
- [ ] Test with 3 different types

### Short Term (Week 2-4)
- [ ] Add UI specs for remaining 56 types
- [ ] Build all field component types
- [ ] Build ThingList, ThingDetail, ThingTable
- [ ] Refactor existing type-specific components

### Long Term (Month 2+)
- [ ] Add customization API (override UI config)
- [ ] Add theme support (light/dark)
- [ ] Add responsive breakpoints
- [ ] Add accessibility features
- [ ] Add internationalization

---

## Customization

Organizations can override UI config:

```typescript
// Custom UI for your organization
const customCourseUI = {
  ...defaultCourseUI,
  fields: {
    ...defaultCourseUI.fields,
    price: {
      ...defaultCourseUI.fields.price,
      currency: "EUR",  // Override to EUR
      badge: false       // Don't show as badge
    }
  }
}
```

---

**With ontology-ui, ONE frontend becomes a universal renderer for all 66 thing types.**
