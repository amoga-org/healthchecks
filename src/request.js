// src/request.js - Healthcheck execution functions

import { buildUrl } from "./helper.js";
import { getHealthchecks, insertLog, getLatestStatuses } from "./database.js";

const MAX_CHECKS_PER_TICK = 200;

// Parses header JSON string into object
function parseHeaders(headerJson) {
    if (!headerJson) return {};
    try {
        return JSON.parse(headerJson);
    } catch (error) {
        console.error("Failed to parse header JSON:", error);
        return {};
    }
}

// Validates response body against expected value using match type
function validateResponseBody(body, expected, matchType) {
    if (matchType === "none") return true;
    if (!expected) return true;
    if (matchType === "exact") return body === expected;
    if (matchType === "contains") return body.includes(expected);
    if (matchType === "regex") {
        try {
            return new RegExp(expected).test(body);
        } catch (error) {
            console.error("Invalid regex pattern:", expected, error);
            return false;
        }
    }
    return true;
}

// Truncates response body if longer than max length
function truncateBody(body, maxLength = 5000) {
    if (!body || body.length <= maxLength) return body;
    return null;
}

// Executes a single healthcheck with timeout
async function executeHealthcheck(check) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), check.timeout);
    const url = buildUrl(check);
    const headers = parseHeaders(check.header);
    const startTime = Date.now();

    const fetchOptions = {
        method: check.method,
        headers,
        signal: controller.signal,
    };

    if (check.body && ["POST", "PUT"].includes(check.method)) {
        fetchOptions.body = check.body;
    }

    try {
        const response = await fetch(url, fetchOptions);
        const latency = Date.now() - startTime;

        clearTimeout(timeoutId);

        const body = await response.text();
        const statusCode = response.status;
        const responseBody = truncateBody(body);

        const statusMatch = String(statusCode) === check.expected_code;
        if (!statusMatch) {
            return {
                status: "unhealthy",
                statusCode,
                latency,
                error: `expected status ${check.expected_code}, got ${statusCode}`,
                responseBody,
            };
        }

        if (check.match !== "none" && check.expected_body) {
            const bodyMatch = validateResponseBody(body, check.expected_body, check.match);
            if (!bodyMatch) {
                return {
                    status: "unhealthy",
                    statusCode,
                    latency,
                    error: `response body did not match expected (${check.match})`,
                    responseBody,
                };
            }
        }

        return { status: "healthy", statusCode, latency, error: null, responseBody };
    } catch (err) {
        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return { status: "unhealthy", statusCode: null, latency, error: errorMessage, responseBody: null };
    }
}

// Processes a single check: execute and compare with previous status
async function processCheck(db, check, previousStatus) {
    const result = await executeHealthcheck(check);
    const newStatus = result.status;

    // If no previous status exists, treat as first check (assume healthy before this)
    const oldStatus = previousStatus ? previousStatus.status : 'healthy';

    // Only log if status changed
    if (newStatus !== oldStatus) {
        let downtimeDuration = null;

        // If recovering from unhealthy to healthy, calculate downtime for email
        if (oldStatus === 'unhealthy' && newStatus === 'healthy' && previousStatus) {
            const previousTimestamp = new Date(previousStatus.timestamp);
            const currentTimestamp = new Date();
            downtimeDuration = currentTimestamp - previousTimestamp;
        }

        // Insert log without downtime duration (not stored in DB)
        await insertLog(
            db,
            check.id,
            result.status,
            result.statusCode,
            result.latency,
            result.error,
            result.responseBody
        );

        // Return status change information (including downtime for email)
        return {
            monitorId: check.id,
            monitorName: check.slug,
            oldStatus,
            newStatus,
            downtimeDuration,
            error: result.error,
            timestamp: new Date().toISOString()
        };
    }

    // No status change
    return null;
}

// Checks if a healthcheck should run at the current minute based on frequency and offset
function shouldRunCheck(check, currentMinute) {
    return currentMinute % check.frequency === check.offset;
}

// Processes all due healthchecks and returns status changes
export async function processChecks(db) {
    const now = new Date();
    const currentMinute = now.getUTCHours() * 60 + now.getUTCMinutes();

    const results = await getHealthchecks(db, MAX_CHECKS_PER_TICK);

    if (results.length === 0) {
        return [];
    }

    const checksToRun = results.filter((check) => shouldRunCheck(check, currentMinute));

    if (checksToRun.length === 0) {
        return [];
    }

    console.log(`Running ${checksToRun.length} healthchecks: ${checksToRun.map((check) => check.slug).join(", ")}`);

    // Fetch latest statuses for all monitors scheduled to run
    const monitorIds = checksToRun.map((check) => check.id);
    const latestStatuses = await getLatestStatuses(db, monitorIds);

    // Process all checks with their previous status
    const checkResults = await Promise.allSettled(
        checksToRun.map((check) => processCheck(db, check, latestStatuses[check.id]))
    );

    // Collect all status changes (filter out null results and rejected promises)
    const statusChanges = checkResults
        .filter((result) => result.status === 'fulfilled' && result.value !== null)
        .map((result) => result.value);

    console.log(`Status changes detected: ${statusChanges.length}`);

    return statusChanges;
}
