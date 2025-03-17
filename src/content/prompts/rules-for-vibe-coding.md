---
title: "Rules for vibe coding"
description: "For cursor "
tags: ["code-review", "programming", "security", "performance"]
date: 2024-02-03
---
Rules for vibe coding
Code structure & organization
Keep code DRY (Don't Repeat Yourself)

Extract repeated logic into reusable functions
Create utility functions for common operations (validation, formatting, etc.)
Use shared components for UI patterns that appear multiple times
Break down large files

Split files larger than 300-400 lines into smaller modules
Separate concerns: data fetching, business logic, UI rendering
Create focused components that do one thing well
Use logical file organization

Group related files by feature or domain
Create separate directories for components, utilities, services, etc.
Follow consistent naming conventions across the project
Security practices
Input validation and sanitization

Validate all user inputs on both client and server sides
Use parameterized queries for database operations
Sanitize any data before rendering it to prevent XSS attacks
Authentication & authorization

Protect sensitive routes with authentication middleware
Implement proper authorization checks for data access
Use role-based permissions for different user types
API security

Implement rate limiting on authentication endpoints
Set secure HTTP headers (CORS, Content-Security-Policy)
Use HTTPS for all connections
Secrets management

Never hardcode secrets or credentials in source code
Store sensitive values in environment variables
Use secret management services for production environments
Error handling
Implement comprehensive error handling

Catch and handle specific error types differently
Log errors with sufficient context for debugging
Present user-friendly error messages in the UI
Handle async operations properly

Use try/catch blocks with async/await
Handle network failures gracefully
Implement loading states for better user experience
Performance optimization
Minimize expensive operations

Cache results of costly calculations
Use memoization for pure functions
Implement pagination for large data sets
Prevent memory leaks

Clean up event listeners and subscriptions
Cancel pending requests when components unmount
Clear intervals and timeouts when no longer needed
Optimize rendering

Avoid unnecessary re-renders
Use virtualization for long lists
Implement code splitting and lazy loading
Database best practices
Use transactions for related operations

Wrap related database operations in transactions
Ensure data consistency across multiple operations
Implement proper rollback mechanisms
Optimize queries

Create indexes for frequently queried fields
Select only the fields you need
Use query pagination when fetching large datasets
Handle database connections properly

Use connection pools
Close connections when operations complete
Implement retry mechanisms for transient failures
API design
Follow RESTful principles

Use appropriate HTTP methods (GET, POST, PUT, DELETE)
Return consistent response formats
Use meaningful HTTP status codes
Design clear endpoints

Organize endpoints by resource
Version your API
Document all endpoints with examples
Implement proper error responses

Return structured error objects
Include error codes and helpful messages
Maintain detailed logs of API errors
Maintainability
Use clear naming

Choose descriptive variable, function, and class names
Avoid abbreviations and cryptic naming
Use consistent naming patterns throughout the codebase
Add documentation

Document complex functions with clear descriptions
Explain the "why" not just the "what"
Keep documentation up-to-date when code changes
Write tests

Cover critical business logic with unit tests
Write integration tests for important flows
Implement end-to-end tests for critical user journeys
Frontend specific
Implement form validation

Validate input as users type
Provide clear error messages
Handle form submission errors gracefully
Use proper state management

Choose appropriate state management for your app's complexity
Avoid prop drilling through many component levels
Keep state as close as possible to where it's needed
Ensure accessibility

Use semantic HTML elements
Add proper ARIA attributes for complex elements
Ensure keyboard navigability
Maintain sufficient color contrast
Security vulnerabilities to prevent
SQL/NoSQL injection

Never concatenate user input directly into queries
Use parameterized queries or ORM methods
Cross-site scripting (XSS)

Sanitize user input before displaying it
Use frameworks' built-in protection mechanisms
Cross-site request forgery (CSRF)

Implement anti-CSRF tokens
Validate request origins
Broken authentication

Implement proper session management
Use secure password hashing
Enforce strong password policies