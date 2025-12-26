---
applyTo: "**"
---

# Cloudflare Worker

## 1. General

### 1.1 Project Structure & Dependencies

-   Name the main entry file `index.js`.
-   Place reusable helpers in `helper.js` (response helpers, request utilities).
-   Use JavaScript, not TypeScript.
-   Avoid `package.json`; prefer native Web/Workers APIs (no Node.js-only APIs).
-   Don't run `npm run build` or `npm run deploy` in examples.

### 1.2 Environment & Configuration

-   Use the deployed Cloudflare URL in docs/tests, not `localhost`.
-   Prefer SQLite-based Durable Objects over in-memory–only designs.
-   For SQLite DOs, add classes under `migrations.new_sqlite_classes` in `wrangler.jsonc`.

### 1.3 Cloudflare Secrets Store

Use Cloudflare Secrets Store when mentioned by the user. Never log or expose secret values in responses or console output. Use the same `binding` name as the `secret_name` for clarity.

**Configuration in `wrangler.jsonc`:**

```jsonc
{
    "secrets_store_secrets": [
        {
            "binding": "CLICKUP_KEY",
            "store_id": "792206780c0c46e8ba8ade3f21b44eac",
            "secret_name": "CLICKUP_KEY"
        }
    ]
}
```

**Accessing secrets in code:**

```js
// Fetch secret from Secrets Store
const clickupKey = await env.CLICKUP_KEY.get();
```

### 1.4 Code & Helpers

-   Use `const` / `let` only – never `var`.
-   Top-level handlers (e.g. `fetch`) must be `async`.
-   Use `async/await`, not `.then()/.catch()`.
-   Only `await` what's needed (e.g. `request.json()`, `do.fetch(...)`).
-   Use `generateUuidV7()` for IDs (time-sortable).
-   Use `console.error()` with context for errors.
-   Keep helpers small, single-purpose, and return structured data.

```js
// helpers.js
export function generateUuidV7() {
    const now = Date.now();
    const bytes = new Uint8Array(16);

    // Timestamp (48 bits)
    const timestamp = BigInt(now);
    bytes[0] = Number((timestamp >> 40n) & 0xffn);
    bytes[1] = Number((timestamp >> 32n) & 0xffn);
    bytes[2] = Number((timestamp >> 24n) & 0xffn);
    bytes[3] = Number((timestamp >> 16n) & 0xffn);
    bytes[4] = Number((timestamp >> 8n) & 0xffn);
    bytes[5] = Number(timestamp & 0xffn);

    // Random data
    crypto.getRandomValues(bytes.subarray(6));

    // Version 7
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    // Variant 10xx
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return [...bytes]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

// Example: extract JWT token per endpoint
export function getToken(request, url) {
    if (url.pathname === "/connect") {
        return url.searchParams.get("token");
    }

    if (url.pathname === "/send") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) return null;
        return authHeader.substring(7);
    }

    return null;
}
```

## 2. Request, JWT & Validation

### 2.1 Request Routing

Place in `helper.js`:

```js
// helper.js
export function getRequestDetails(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    return { url, path, method };
}
```

Usage in `index.js`:

```js
import { getRequestDetails } from "./helper.js";

const { url, path, method } = getRequestDetails(request);
if (path !== "/connect" && path !== "/send") {
    throw { code: 400, message: "Invalid endpoint" };
}
```

### 2.2 Validation Patterns

Fail fast; avoid deep nesting.

```js
// Token required
if (!token) {
    throw { code: 401, message: "JWT token required" };
}

// Arrays
if (!body.emails || !Array.isArray(body.emails)) {
    throw { code: 400, message: "emails array is required" };
}

// Required JWT fields (no optional chaining for required fields)
if (!jwtPayload.username || !jwtPayload.tenant || !jwtPayload.environment) {
    throw {
        code: 401,
        message: "JWT token missing required fields: username, tenant, environment",
    };
}
```

---

## 3. Errors & Responses

### 3.1 Error Philosophy

-   Throw structured errors: `{ code, message }`.
-   Always `console.error()` with context (path, user, etc.).
-   No empty `catch` blocks.
-   Don’t use optional chaining for required fields – validate them.

### 3.2 Try–Catch Placement

-   Single `try/catch` in the top-level `fetch`:

```js
export default {
    async fetch(request, env, ctx) {
        try {
            // route + handle
        } catch (error) {
            console.error("Unhandled error in fetch()", error);
            const code = error?.code ?? 500;
            const message = error?.message ?? "Internal server error";
            return createErrorResponse(message, code);
        }
    },
};
```

-   No nested `try/catch` except around WebSocket `send`/`close` (see §4).

### 3.3 Response Helpers & Format

Place in `helper.js`:

```js
// helper.js
export function createResponse(data = null, message = "Success", code = 200) {
    return new Response(
        JSON.stringify({
            status: code < 400 ? 1 : 0,
            message,
            data: code < 400 ? data : null,
        }),
        {
            status: code,
            headers: { "Content-Type": "application/json" },
        }
    );
}

export function createErrorResponse(message, code = 500) {
    return createResponse(null, message, code);
}
```

Usage in `index.js`:

```js
import { createResponse, createErrorResponse } from "./helper.js";
```

**Success example:**

```json
{
    "status": 1,
    "message": "Message sent successfully",
    "data": { "delivered": [{ "user@example.com": 2 }] }
}
```

**Error example:**

```json
{
    "status": 0,
    "message": "Error description",
    "data": null
}
```

Use proper HTTP codes: `200`, `400`, `401`, `404`, `500`, etc.

---

## 4. WebSocket Patterns

### 4.1 Setup & Handshake

```js
const [client, server] = Object.values(new WebSocketPair());

server.accept();

return new Response(null, {
    status: 101,
    webSocket: client,
});
```

### 4.2 Events & State

```js
server.addEventListener("message", (event) => {
    // handle incoming message
});

server.addEventListener("close", (event) => {
    // cleanup
});

server.addEventListener("error", (event) => {
    console.error("WebSocket error:", event.error);
});
```

Check state before sending:

```js
if (session.ws.readyState === WebSocket.OPEN) {
    // safe to send
}
```

### 4.3 Error Handling

```js
try {
    session.ws.send(JSON.stringify(message));
    deliveredSessions++;
} catch (error) {
    console.error(`Error sending message to session ${sessionId}:`, error);
    try {
        session.ws.close(1011, "Send error");
    } catch (closeError) {
        console.error(`Error closing session ${sessionId}:`, closeError);
    }
    this.evictSession(sessionId);
}
```

> This is the only acceptable nested `try/catch` (inside the top-level `fetch` error handling).

---

## 5. D1 Database Schema

### 5.1 Schema Design

-   **Primary Keys**: Use `uuid7` (text) for all primary keys.
-   **Timestamps**: Always include `created_at` and `updated_at` columns in all tables.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- UUID v7
  email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```
