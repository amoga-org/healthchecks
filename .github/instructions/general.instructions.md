---
applyTo: "**"
---

# Technology Choices & Standards

Opinionated technology stack and implementation standards.

## Frontend Libraries

### HTTP Client: Axios

-   **Why over fetch:** Request/response interceptors for auth tokens, automatic JSON transforms, better error handling, request cancellation
-   **Setup:** Create axios instance with base URL and auth interceptor

### State: Redux Toolkit

-   **Why:** Predictable state, DevTools, time-travel debugging, middleware support
-   **Setup:** Use Redux Toolkit for modern Redux

### Dates: date-fns

-   **Why:** Tree-shakeable, immutable, comprehensive
-   **Not Moment:** 67KB vs 2KB per function
-   **Not Day.js:** Less comprehensive API

### UI Components: Shadcn/ui

-   **Why:** Copy-paste ownership, built on Radix UI, customizable
-   **Not MUI:** Too opinionated, large bundle
-   **Not Chakra:** Runtime overhead

### Icons: Lucide React

-   **Why:** Tree-shakeable, consistent style, 1400+ icons
-   **Not React Icons:** Imports entire icon sets

## Backend Libraries

### Framework: Express 5.x

-   **Essential middleware:**

```javascript
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(compression()); // Gzip
app.use(express.json({ limit: "10mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

-   Use proper middleware order: body parsers, custom middleware, routes, error handlers
-   Organize routes using Express Router for modular code structure
-   Use async/await with proper error handling and try/catch blocks
-   Create a centralized error handler middleware as the last middleware
-   Use environment variables for configuration with a config module
-   Implement request validation using libraries like express-validator
-   Use middleware for authentication and authorization
-   Use appropriate HTTP status codes in responses

### Database ORM: Prisma

-   **Why:** Type-safe queries, migrations, great DX
-   **Not Sequelize:** No type safety
-   **Not TypeORM:** Overcomplicated

### Authentication: JWT with jose

-   **Why jose:** Edge runtime compatible, modern API
-   **Not jsonwebtoken:** Doesn't work in edge runtime

### Logging: Pino

-   **Why:** Fastest JSON logger, pretty printing in dev
-   **Not Winston:** 5x slower

### File Uploads: Multer + S3 SDK

## Environment & Versions

### Runtime Versions

-   **Node.js:** 20 LTS or 22 LTS
-   **npm:** 10.x
-   **PostgreSQL:** 16
-   **Redis:** 7.x

### Package Versions (Minimum)

```json
{
    "express": "^4.21.0",
    "prisma": "^6.0.0",
    "@prisma/client": "^6.0.0",
    "zod": "^3.24.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "date-fns": "^4.1.0",
    "jose": "^5.9.0",
    "pino": "^9.5.0"
}
```

## API Response Format

```typescript
// Success
{
  success: true,
  data: T,
  meta?: { page: number, total: number }
}

// Error
{
  success: false,
  error: {
    message: string,
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'SERVER_ERROR'
  }
}
```

---

No alternatives. No explanations for obvious choices. Just use these.
