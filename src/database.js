// src/database.js - Database operations

import { generateUuidV7 } from "./helper.js";

// Creates a new monitor in the database
export async function createHealthcheck(db, data) {
    const id = generateUuidV7();
    const headerJson = data.header ? JSON.stringify(data.header) : null;
    const now = new Date().toISOString();

    const result = await db
        .prepare(
            `INSERT INTO monitors (
        id, slug, description, address, path, method, port, type,
        header, body, expected_code, expected_body, match,
        timeout, frequency, offset, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *`
        )
        .bind(
            id,
            data.slug,
            data.description ?? null,
            data.address,
            data.path ?? "/",
            data.method ?? "GET",
            data.port ?? 443,
            data.type ?? "HTTPS",
            headerJson,
            data.body ?? null,
            data.expected_code ?? "200",
            data.expected_body ?? null,
            data.match ?? "none",
            data.timeout ?? 5000,
            data.frequency,
            data.offset ?? 0,
            data.active !== undefined ? (data.active ? 1 : 0) : 1,
            now,
            now
        )
        .first();

    if (!result) {
        throw { code: 500, message: "Failed to create monitor" };
    }
    return result;
}

// Lists all monitors from the database
export async function listHealthchecks(db) {
    const { results } = await db.prepare("SELECT * FROM monitors ORDER BY created_at DESC").all();
    return results ?? [];
}

// Gets active monitors with a limit
export async function getHealthchecks(db, limit) {
    const { results } = await db.prepare(`SELECT * FROM monitors WHERE active = 1 LIMIT ?`).bind(limit).all();
    return results ?? [];
}

// Inserts a log entry for a monitor result
export async function insertLog(db, monitorId, status, statusCode, latency, error, responseBody) {
    const logId = generateUuidV7();
    const now = new Date().toISOString();

    await db
        .prepare(
            `INSERT INTO logs (id, monitor_id, status, status_code, latency, error, response_body, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(logId, monitorId, status, statusCode, latency, error, responseBody, now, now)
        .run();
}

// Gets the latest status for each monitor
export async function getLatestStatuses(db, monitorIds) {
    if (!monitorIds || monitorIds.length === 0) {
        return {};
    }

    const statusMap = {};

    for (const monitorId of monitorIds) {
        const result = await db
            .prepare(
                `SELECT status, created_at
                FROM logs
                WHERE monitor_id = ?
                ORDER BY created_at DESC
                LIMIT 1`
            )
            .bind(monitorId)
            .first();

        statusMap[monitorId] = result ? { status: result.status, timestamp: result.created_at } : null;
    }

    return statusMap;
}

// Lists logs with optional filters
export async function listLogs(db, monitorId, since, limit = 100) {
    let query = `
        SELECT l.*, m.slug as monitor_slug, m.address, m.type
        FROM logs l
        LEFT JOIN monitors m ON l.monitor_id = m.id
        WHERE 1=1
    `;
    const params = [];

    if (monitorId) {
        query += " AND l.monitor_id = ?";
        params.push(monitorId);
    }

    if (since) {
        query += " AND l.created_at >= ?";
        params.push(since);
    }

    query += " ORDER BY l.created_at DESC LIMIT ?";
    params.push(limit);

    const { results } = await db.prepare(query).bind(...params).all();
    return results ?? [];
}

// Gets uptime statistics grouped by monitor for the last X minutes
export async function getUptimeStats(db, minutes = 30) {
    const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();

    const query = `
        SELECT
            m.id as monitor_id,
            m.slug as monitor_slug,
            m.address,
            m.type,
            COUNT(CASE WHEN l.status = 'healthy' THEN 1 END) as healthy_count,
            COUNT(CASE WHEN l.status = 'unhealthy' THEN 1 END) as unhealthy_count,
            COUNT(*) as total_count
        FROM monitors m
        LEFT JOIN logs l ON m.id = l.monitor_id AND l.created_at >= ?
        WHERE m.active = 1
        GROUP BY m.id, m.slug, m.address, m.type
        ORDER BY m.slug
    `;

    const { results } = await db.prepare(query).bind(since).all();
    return results ?? [];
}

// Deletes logs older than specified days
export async function deleteOldLogs(db, days = 7) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const result = await db.prepare("DELETE FROM logs WHERE created_at < ?").bind(cutoffDate).run();

    return {
        deleted: result.meta.changes,
        cutoffDate,
    };
}

// Gets a single monitor by ID
export async function getHealthcheckById(db, id) {
    const result = await db.prepare("SELECT * FROM monitors WHERE id = ?").bind(id).first();
    return result;
}

// Gets detailed stats for a specific monitor
export async function getMonitorStats(db, monitorId, minutes = 1440) {
    const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();

    // Get the monitor
    const monitor = await db.prepare("SELECT * FROM monitors WHERE id = ?").bind(monitorId).first();
    if (!monitor) return null;

    // Get log stats
    const stats = await db
        .prepare(
            `SELECT
                COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_count,
                COUNT(CASE WHEN status = 'unhealthy' THEN 1 END) as unhealthy_count,
                COUNT(*) as total_count,
                AVG(latency) as avg_latency,
                MAX(created_at) as last_checked
            FROM logs
            WHERE monitor_id = ? AND created_at >= ?`
        )
        .bind(monitorId, since)
        .first();

    // Get latency percentiles
    const latencyQuery = await db
        .prepare(
            `SELECT latency FROM logs
            WHERE monitor_id = ? AND created_at >= ? AND latency IS NOT NULL
            ORDER BY latency`
        )
        .bind(monitorId, since)
        .all();

    const latencies = latencyQuery.results?.map((r) => r.latency) ?? [];
    const percentile = (arr, p) => {
        if (arr.length === 0) return 0;
        const idx = Math.ceil((p / 100) * arr.length) - 1;
        return arr[Math.max(0, idx)];
    };

    // Get recent history for uptime chart (last 60 data points)
    const historyQuery = await db
        .prepare(
            `SELECT status, latency, created_at
            FROM logs
            WHERE monitor_id = ? AND created_at >= ?
            ORDER BY created_at DESC
            LIMIT 60`
        )
        .bind(monitorId, since)
        .all();

    const uptimeHistory = (historyQuery.results ?? []).reverse().map((log, i) => ({
        time: i,
        status: log.status === "healthy" ? 2 : 0,
        duration: log.latency || 100,
    }));

    // Simplified latency history
    const latencyHistory = (historyQuery.results ?? []).reverse().map((log, i) => ({
        time: i,
        dns: Math.floor((log.latency || 100) * 0.1),
        connect: Math.floor((log.latency || 100) * 0.15),
        tls: Math.floor((log.latency || 100) * 0.2),
        ttfb: Math.floor((log.latency || 100) * 0.35),
        transfer: Math.floor((log.latency || 100) * 0.2),
    }));

    const totalCount = stats?.total_count || 0;
    const healthyCount = stats?.healthy_count || 0;
    const unhealthyCount = stats?.unhealthy_count || 0;
    const uptime = totalCount > 0 ? (healthyCount / totalCount) * 100 : 100;

    return {
        uptime: uptime.toFixed(2),
        degraded: 0,
        failing: unhealthyCount,
        requests: totalCount,
        lastChecked: stats?.last_checked || null,
        latency: {
            p50: Math.round(percentile(latencies, 50)),
            p75: Math.round(percentile(latencies, 75)),
            p90: Math.round(percentile(latencies, 90)),
            p95: Math.round(percentile(latencies, 95)),
            p99: Math.round(percentile(latencies, 99)),
        },
        uptimeHistory,
        latencyHistory,
    };
}

// Gets public status page data
export async function getStatusPageData(db) {
    const days = 45;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get all active monitors with their stats
    const monitors = await db.prepare("SELECT * FROM monitors WHERE active = 1 ORDER BY slug").all();

    const systems = [];
    let allOperational = true;

    for (const monitor of monitors.results ?? []) {
        // Get overall stats
        const stats = await db
            .prepare(
                `SELECT
                    COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_count,
                    COUNT(*) as total_count
                FROM logs
                WHERE monitor_id = ? AND created_at >= ?`
            )
            .bind(monitor.id, since)
            .first();

        const totalCount = stats?.total_count || 0;
        const healthyCount = stats?.healthy_count || 0;
        const uptime = totalCount > 0 ? (healthyCount / totalCount) * 100 : 100;

        // Get daily status for last 45 days
        const dailyStats = await db
            .prepare(
                `SELECT
                    date(created_at) as day,
                    COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy,
                    COUNT(*) as total
                FROM logs
                WHERE monitor_id = ? AND created_at >= ?
                GROUP BY date(created_at)
                ORDER BY day`
            )
            .bind(monitor.id, since)
            .all();

        const history = (dailyStats.results ?? []).map((day) => {
            const dayUptime = day.total > 0 ? (day.healthy / day.total) * 100 : 100;
            if (dayUptime >= 99) return "operational";
            if (dayUptime >= 95) return "degraded";
            return "outage";
        });

        // Pad to 45 days if needed
        while (history.length < 45) {
            history.unshift("operational");
        }

        const status = uptime >= 99 ? "operational" : uptime >= 95 ? "degraded" : "outage";
        if (status !== "operational") allOperational = false;

        systems.push({
            name: monitor.slug,
            uptime: parseFloat(uptime.toFixed(2)),
            status,
            history,
        });
    }

    return {
        overall: allOperational ? "operational" : "degraded",
        systems,
        incidents: [], // Can be extended later with incident tracking
    };
}

// Updates a monitor
export async function updateHealthcheck(db, id, data) {
    const existing = await getHealthcheckById(db, id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const headerJson = data.header ? JSON.stringify(data.header) : existing.header;

    const result = await db
        .prepare(
            `UPDATE monitors SET
                slug = ?, description = ?, address = ?, path = ?, method = ?,
                port = ?, type = ?, header = ?, body = ?, expected_code = ?,
                expected_body = ?, match = ?, timeout = ?, frequency = ?,
                offset = ?, active = ?, updated_at = ?
            WHERE id = ?
            RETURNING *`
        )
        .bind(
            data.slug ?? existing.slug,
            data.description ?? existing.description,
            data.address ?? existing.address,
            data.path ?? existing.path,
            data.method ?? existing.method,
            data.port ?? existing.port,
            data.type ?? existing.type,
            headerJson,
            data.body ?? existing.body,
            data.expected_code ?? existing.expected_code,
            data.expected_body ?? existing.expected_body,
            data.match ?? existing.match,
            data.timeout ?? existing.timeout,
            data.frequency ?? existing.frequency,
            data.offset ?? existing.offset,
            data.active !== undefined ? (data.active ? 1 : 0) : existing.active,
            now,
            id
        )
        .first();

    return result;
}

// Deletes a monitor
export async function deleteHealthcheck(db, id) {
    // Logs will be deleted automatically via CASCADE
    const result = await db.prepare("DELETE FROM monitors WHERE id = ?").bind(id).run();
    return result.meta.changes > 0;
}
