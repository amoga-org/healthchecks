// src/helper.js - Helper functions for Cloudflare Worker

// Generates a UUID v7 string (time-sortable)
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

// Creates a JSON response with standard format and CORS headers
export function createResponse(data = null, message = "Success", code = 200) {
    return new Response(
        JSON.stringify({
            status: code < 400 ? 1 : 0,
            message,
            data: code < 400 ? data : null,
        }),
        {
            status: code,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        }
    );
}

// Creates an error response
export function createErrorResponse(message, code = 500) {
    return createResponse(null, message, code);
}

// Extracts request routing details
export function getRequestDetails(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    return { url, path, method };
}

// Builds the full URL from check components
export function buildUrl(check) {
    const protocol = check.type.toLowerCase();
    const defaultPort = protocol === "https" ? 443 : 80;
    const portSuffix = check.port === defaultPort ? "" : `:${check.port}`;
    const path = check.path.startsWith("/") ? check.path : `/${check.path}`;
    return `${protocol}://${check.address}${portSuffix}${path}`;
}

// Validates the request body for creating a check
export function validateCreateCheckBody(body) {
    if (!body.name || typeof body.name !== "string") {
        throw { code: 400, message: "name is required" };
    }
    if (!body.address || typeof body.address !== "string") {
        throw { code: 400, message: "address is required" };
    }
    if (!body.frequency || typeof body.frequency !== "number" || body.frequency < 1) {
        throw { code: 400, message: "frequency must be a positive integer" };
    }
    if (
        body.offset !== undefined &&
        (typeof body.offset !== "number" || body.offset < 0 || body.offset >= body.frequency)
    ) {
        throw {
            code: 400,
            message: "offset must be between 0 and frequency - 1",
        };
    }
    if (body.type !== undefined && !["HTTP", "HTTPS"].includes(body.type)) {
        throw { code: 400, message: "type must be HTTP or HTTPS" };
    }
    if (body.method !== undefined && !["GET", "POST", "HEAD", "PUT", "DELETE"].includes(body.method)) {
        throw { code: 400, message: "method must be GET, POST, HEAD, PUT, or DELETE" };
    }
    if (body.match !== undefined && !["none", "exact", "regex", "contains"].includes(body.match)) {
        throw { code: 400, message: "match must be none, exact, regex, or contains" };
    }
    if (body.port !== undefined && (typeof body.port !== "number" || body.port < 1 || body.port > 65535)) {
        throw { code: 400, message: "port must be between 1 and 65535" };
    }
}
