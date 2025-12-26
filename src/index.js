// src/index.js - Cloudflare Worker for HTTP healthcheck scheduler

import { createResponse, createErrorResponse, getRequestDetails, validateCreateCheckBody } from "./helper.js";
import {
    createHealthcheck,
    listHealthchecks,
    listLogs,
    getUptimeStats,
    deleteOldLogs,
    getHealthcheckById,
    getMonitorStats,
    getStatusPageData,
    updateHealthcheck,
    deleteHealthcheck,
} from "./database.js";
import { processChecks } from "./request.js";
import { sendStatusChangeEmail } from "./email.js";

// Handles GET /api/checks endpoint
async function handleListChecks(env) {
    const checks = await listHealthchecks(env.DB);
    return createResponse(checks, "Checks retrieved successfully");
}

// Handles POST /api/checks endpoint
async function handleCreateCheck(request, env) {
    const body = await request.json();
    validateCreateCheckBody(body);
    const check = await createHealthcheck(env.DB, body);
    return createResponse(check, "Check created successfully", 201);
}

// Handles GET /api/logs endpoint
async function handleListLogs(request, env) {
    const url = new URL(request.url);
    const monitorId = url.searchParams.get("monitor_id");
    const since = url.searchParams.get("since");
    const limit = parseInt(url.searchParams.get("limit") || "100");

    const logs = await listLogs(env.DB, monitorId, since, limit);
    return createResponse(logs, "Logs retrieved successfully");
}

// Handles GET /api/uptime endpoint
async function handleGetUptime(request, env) {
    const url = new URL(request.url);
    const minutes = parseInt(url.searchParams.get("minutes") || "30");

    // Validate minutes parameter
    if (![30, 60, 180].includes(minutes)) {
        throw { code: 400, message: "minutes must be 30, 60, or 180" };
    }

    const stats = await getUptimeStats(env.DB, minutes);
    return createResponse(stats, "Uptime stats retrieved successfully");
}

// Handles GET /api/monitors endpoint (alias for checks)
async function handleListMonitors(env) {
    const monitors = await listHealthchecks(env.DB);
    return createResponse(monitors, "Monitors retrieved successfully");
}

// Handles GET /api/monitors/:id endpoint
async function handleGetMonitor(id, env) {
    const monitor = await getHealthcheckById(env.DB, id);
    if (!monitor) {
        throw { code: 404, message: "Monitor not found" };
    }
    return createResponse(monitor, "Monitor retrieved successfully");
}

// Handles GET /api/monitors/:id/stats endpoint
async function handleGetMonitorStats(request, id, env) {
    const url = new URL(request.url);
    const minutes = parseInt(url.searchParams.get("minutes") || "1440");

    const stats = await getMonitorStats(env.DB, id, minutes);
    if (!stats) {
        throw { code: 404, message: "Monitor not found" };
    }
    return createResponse(stats, "Monitor stats retrieved successfully");
}

// Handles PUT /api/monitors/:id endpoint
async function handleUpdateMonitor(request, id, env) {
    const body = await request.json();
    const monitor = await updateHealthcheck(env.DB, id, body);
    if (!monitor) {
        throw { code: 404, message: "Monitor not found" };
    }
    return createResponse(monitor, "Monitor updated successfully");
}

// Handles DELETE /api/monitors/:id endpoint
async function handleDeleteMonitor(id, env) {
    const deleted = await deleteHealthcheck(env.DB, id);
    if (!deleted) {
        throw { code: 404, message: "Monitor not found" };
    }
    return createResponse(null, "Monitor deleted successfully");
}

// Handles GET /api/status endpoint (public status page)
async function handleGetStatus(env) {
    const status = await getStatusPageData(env.DB);
    return createResponse(status, "Status retrieved successfully");
}

// Serves static files from the public directory
async function serveStaticAsset(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;

    // For SPA routing, serve index.html for non-asset paths
    if (!path.includes('.') && path !== '/') {
        path = '/index.html';
    } else if (path === '/') {
        path = '/index.html';
    }

    // Check if ASSETS binding exists
    if (!env.ASSETS) {
        // Fallback: return a simple response indicating the frontend should be built
        return new Response('Frontend not available. Please run "npm run build" in the frontend directory.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    try {
        const asset = await env.ASSETS.fetch(new URL(path, request.url));
        return asset;
    } catch (e) {
        // If asset not found, serve index.html for SPA routing
        return env.ASSETS.fetch(new URL('/index.html', request.url));
    }
}

export default {
    async fetch(request, env) {
        try {
            const { path, method } = getRequestDetails(request);

            // Handle CORS preflight requests
            if (method === "OPTIONS") {
                return new Response(null, {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                    },
                });
            }

            // API routes
            if (path === "/api/checks" && method === "GET") {
                return handleListChecks(env);
            }

            if (path === "/api/checks" && method === "POST") {
                return handleCreateCheck(request, env);
            }

            if (path === "/api/logs" && method === "GET") {
                return handleListLogs(request, env);
            }

            if (path === "/api/uptime" && method === "GET") {
                return handleGetUptime(request, env);
            }

            // Monitor routes (new UI)
            if (path === "/api/monitors" && method === "GET") {
                return handleListMonitors(env);
            }

            if (path === "/api/monitors" && method === "POST") {
                return handleCreateCheck(request, env);
            }

            // Monitor stats route: /api/monitors/:id/stats
            const statsMatch = path.match(/^\/api\/monitors\/([^/]+)\/stats$/);
            if (statsMatch && method === "GET") {
                return handleGetMonitorStats(request, statsMatch[1], env);
            }

            // Single monitor routes: /api/monitors/:id
            const monitorMatch = path.match(/^\/api\/monitors\/([^/]+)$/);
            if (monitorMatch) {
                const monitorId = monitorMatch[1];
                if (method === "GET") {
                    return handleGetMonitor(monitorId, env);
                }
                if (method === "PUT") {
                    return handleUpdateMonitor(request, monitorId, env);
                }
                if (method === "DELETE") {
                    return handleDeleteMonitor(monitorId, env);
                }
            }

            // Public status page
            if (path === "/api/status" && method === "GET") {
                return handleGetStatus(env);
            }

            // Check if this is an API request that doesn't match any route
            if (path.startsWith("/api/")) {
                throw { code: 404, message: "API endpoint not found" };
            }

            // Serve static files for all other paths
            return serveStaticAsset(request, env);
        } catch (error) {
            console.error("Unhandled error in fetch()", error);
            const code = error?.code ?? 500;
            const message = error?.message ?? "Internal server error";
            return createErrorResponse(message, code);
        }
    },

    async scheduled(_controller, env) {
        try {
            // Check if it's 12:30 AM IST (19:00 UTC)
            const now = new Date();
            const utcHour = now.getUTCHours();
            const utcMinute = now.getUTCMinutes();

            if (utcHour === 19 && utcMinute === 0) {
                console.log("Running daily log cleanup...");
                const result = await deleteOldLogs(env.DB, 7);
                console.log(`Deleted ${result.deleted} logs older than ${result.cutoffDate}`);
            }

            // Always run healthchecks every minute and collect status changes
            const statusChanges = await processChecks(env.DB);

            // Send email notification if there are status changes
            if (statusChanges && statusChanges.length > 0) {
                try {
                    // Fetch SendGrid API key from Secrets Store
                    const sendgridApiKey = await env.SENDGRID_API_KEY.get();
                    if (!sendgridApiKey) {
                        console.error("SENDGRID_API_KEY not found in Secrets Store");
                    } else {
                        await sendStatusChangeEmail(sendgridApiKey, statusChanges);
                    }
                } catch (emailError) {
                    console.error("Failed to send status change email:", emailError);
                }
            }
        } catch (error) {
            console.error("Unhandled error in scheduled()", error);
        }
    },
};
