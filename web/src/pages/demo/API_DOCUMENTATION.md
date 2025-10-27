---
layout: /src/layouts/Layout.astro
title: REST API Demo Page - Documentation
description: Interactive REST API documentation and testing for ONE Platform
---

# REST API Demo Page - Documentation

## Overview

The REST API demo page (`/demo/api.astro`) provides comprehensive, interactive documentation for all 13 REST API endpoints of the ONE Platform, organized by the 6-dimension ontology.

## Key Features

### 1. **Interactive API Testing**
- Live API tester component with request/response visualization
- Real-time curl command generation
- Copy-to-clipboard functionality for all code snippets
- Full request/response inspection

### 2. **Complete Endpoint Documentation**
- All 13 endpoints organized by ontology dimension
- Expandable endpoint cards with full parameter documentation
- Curl examples with copy functionality
- Response examples with proper JSON formatting

### 3. **Educational Content**
- Query parameter guide (pagination, sorting, filtering, search)
- Common relationship types documentation
- Common event types documentation
- HTTP status codes reference
- Error handling best practices
- TypeScript type definitions

## Page Structure

### Hero Section
- Eye-catching title and description
- Quick stat badges (13 endpoints, 6 dimensions, type safe, production-ready)
- Stats dashboard (endpoints count, HTTP methods, dimensions, type safety)

### API Overview
- Endpoints organized by dimension with descriptions
- Base URL and authentication information
- Getting started guide

### Standardized Response Format
- Success response structure (success, data, timestamp)
- Error response structure (error.code, error.message)
- Color-coded examples for both success and error cases

### HTTP Status Codes
- Comprehensive table of status codes (200, 201, 400, 401, 404, 500)
- Descriptions and examples for each code

### Endpoints by Dimension

#### 1. **Groups (4 endpoints)**
- GET /api/groups - List groups
- POST /api/groups - Create group
- GET /api/groups/[id] - Get group
- POST /api/groups/[id] - Update group

#### 2. **People (2 endpoints)**
- GET /api/people/me - Get current user
- GET /api/people/[id] - Get user by ID

#### 3. **Things (4 endpoints)**
- GET /api/things - List entities
- POST /api/things - Create entity
- GET /api/things/[id] - Get entity
- POST /api/things/[id] - Update entity

#### 4. **Connections (3 endpoints)**
- GET /api/connections - List relationships
- POST /api/connections - Create relationship
- GET /api/connections/[id] - Get relationship

#### 5. **Events (2 endpoints)**
- GET /api/events - List events (audit trail)
- POST /api/events - Record event

#### 6. **Knowledge (1 endpoint)**
- GET /api/knowledge/search - Semantic search

### Query Parameters & Filters
- **Pagination**: limit, offset
- **Sorting**: sort field, order (asc/desc)
- **Filtering**: type, status, groupId, etc.
- **Search**: Full-text search with semantic search support

### Interactive API Tester
- Endpoint selector dropdown
- Method selection (GET, POST, PUT, DELETE)
- URL editor with suggestions
- Headers editor
- Request body editor for POST/PUT
- Real-time curl generation
- Send button with loading state
- Response display with headers and body
- Copy response functionality

### Reference Documentation
- **Relationship Types**: owns, enrolled_in, follows, member_of, transacted, authored, etc.
- **Event Types**: entity_created, course_enrolled, payment_received, etc.
- **TypeScript Types**: Full type definitions for all data structures

### Error Handling Guide
- Error code reference
- Recommended error handling pattern with JavaScript example
- Best practices for consuming API errors

### Rate Limiting Information
- Request limits (1000 requests/minute per IP)
- Result limits (max 1000 items per request)
- Response headers (X-RateLimit-Limit, X-RateLimit-Remaining, etc.)

## Component Architecture

### EndpointCard.tsx
Interactive expandable card component for each API endpoint.

**Props:**
```typescript
interface Endpoint {
  method: string;
  path: string;
  title: string;
  description: string;
  pathParams?: Param[];
  queryParams?: Param[];
  bodyParams?: Param[];
  requiresAuth?: boolean;
  curl: string;
  example: any;
}
```

**Features:**
- Method color-coding (GET=blue, POST=green, PUT=orange, DELETE=red)
- Expandable parameter documentation
- Curl example with copy button
- JSON response example preview

### ResponseExample.tsx
Simple component for displaying JSON responses with copy functionality.

**Props:**
```typescript
interface ResponseExampleProps {
  title: string;
  example: any;
}
```

### ApiTester.tsx
Interactive API testing interface with request builder and response viewer.

**Props:**
```typescript
interface ApiTesterProps {
  endpoints: {
    [key: string]: any[];
  };
}
```

**Features:**
- Endpoint selector from all available endpoints
- HTTP method selector
- URL editor with path parameter substitution
- Headers editor
- Request body editor (JSON)
- Curl command generator with copy
- Live request execution
- Response viewer with headers and body
- Error display with alerts

## Data Structure

The page defines all 13 endpoints with complete metadata:

```typescript
const apiEndpoints = {
  groups: [
    {
      method: "GET",
      path: "/api/groups",
      title: "List Groups",
      description: "...",
      queryParams: [...],
      curl: "...",
      example: {...}
    },
    // ... more endpoints
  ],
  people: [...],
  things: [...],
  connections: [...],
  events: [...],
  knowledge: [...]
}
```

## Styling Features

### Colors & Themes
- **Blue**: Primary accent (Groups, GET requests)
- **Green**: Success (People, POST requests)
- **Purple**: Secondary accent (Things)
- **Pink**: Tertiary accent (Connections)
- **Amber**: Events
- **Cyan**: Knowledge/Search

### Responsive Design
- Mobile-first responsive grid layouts
- Collapsible endpoint cards for mobile viewing
- Side-by-side request/response panels on desktop
- Single column on mobile

### Interactive Elements
- Expandable cards with smooth transitions
- Hover effects on buttons and links
- Copy-to-clipboard feedback
- Loading states for API requests
- Error alerts with icon indicators

## Usage Examples

### Basic Usage
```bash
# List all groups
curl http://localhost:4321/api/groups

# List groups with filtering
curl "http://localhost:4321/api/groups?type=organization&limit=10"

# Create a new group
curl -X POST http://localhost:4321/api/groups \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Engineering",
    "type": "business",
    "properties": {}
  }'
```

### Pagination Pattern
```bash
# Page 1: 20 items
curl "http://localhost:4321/api/things?limit=20&offset=0"

# Page 2: next 20 items
curl "http://localhost:4321/api/things?limit=20&offset=20"
```

### Search & Filter
```bash
# Search by name
curl "http://localhost:4321/api/things?search=python"

# Filter by type and status
curl "http://localhost:4321/api/things?type=course&status=published"

# Combine filters
curl "http://localhost:4321/api/things?type=course&status=published&search=python&limit=50"
```

### Error Handling
```javascript
async function fetchData(endpoint) {
  const response = await fetch(endpoint);
  const json = await response.json();

  if (!json.success) {
    console.error('Error:', json.error.code, json.error.message);
    return null;
  }

  return json.data;
}
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript for interactive features
- Falls back gracefully in JavaScript-disabled environments

## Performance Considerations

- Uses Astro for static generation where possible
- React components only loaded when needed (client:idle)
- Efficient state management with React hooks
- Minimal bundle size for API testing component

## Future Enhancements

1. **Authentication UI**
   - Token input field
   - OAuth flow visualization
   - Session management

2. **History & Favorites**
   - Save frequently used requests
   - Request history with timestamps
   - Shareable request URLs

3. **Code Generation**
   - Generate client code (JavaScript, Python, etc.)
   - Generate type definitions from responses
   - OpenAPI spec export

4. **Advanced Testing**
   - Request/response validation
   - Performance profiling
   - Load testing tools
   - WebSocket support for real-time features

5. **Documentation**
   - GraphQL schema export
   - Postman collection export
   - Swagger/OpenAPI documentation
   - Webhook examples

## Related Pages

- **[/demo](/demo)** - Main demo landing page
- **[/demo/groups](/demo/groups)** - Groups implementation example
- **[/demo/hooks](/demo/hooks)** - React hooks documentation
- **[/demo/connections](/demo/connections)** - Connections implementation example

## File Locations

- **Page**: `/Users/toc/Server/ONE/web/src/pages/demo/api.astro`
- **Components**:
  - `/Users/toc/Server/ONE/web/src/components/demo/EndpointCard.tsx`
  - `/Users/toc/Server/ONE/web/src/components/demo/ResponseExample.tsx`
  - `/Users/toc/Server/ONE/web/src/components/demo/ApiTester.tsx`

## Development Notes

### Adding New Endpoints

1. Define endpoint object in `apiEndpoints` object
2. Include all required fields: method, path, title, description
3. List parameters in appropriate arrays (pathParams, queryParams, bodyParams)
4. Provide curl example and response example
5. Use consistent colors and formatting

### Customization

- Modify colors in `getMethodColor()` function
- Update parameter documentation as API evolves
- Add new status codes to `statusCodes` array
- Extend relationship and event type lists as needed

## Testing Checklist

- [ ] All 13 endpoints display correctly
- [ ] Endpoint cards expand/collapse smoothly
- [ ] Curl examples copy correctly
- [ ] JSON examples are properly formatted
- [ ] API tester sends real requests
- [ ] Response displays show correct data
- [ ] Error handling works properly
- [ ] Mobile responsive layout works
- [ ] Copy-to-clipboard feedback displays
- [ ] All links work correctly

## Maintenance

- Update endpoint examples when API changes
- Keep parameter documentation in sync with backend
- Update error codes when new error types are added
- Monitor for API deprecations
- Test with real backend regularly
