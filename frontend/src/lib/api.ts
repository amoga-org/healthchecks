// src/lib/api.ts - API client for healthcheck data

const API_BASE = '/api';

export interface Monitor {
  id: string;
  slug: string;
  url: string;
  method: string;
  frequency: number;
  regions: string[];
  status: 'active' | 'paused';
  created_at: string;
}

export interface MonitorStats {
  uptime: number;
  degraded: number;
  failing: number;
  requests: number;
  lastChecked: string;
  latency: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  uptimeHistory: {
    time: number;
    status: number;
    duration: number;
  }[];
  latencyHistory: {
    time: number;
    dns: number;
    connect: number;
    tls: number;
    ttfb: number;
    transfer: number;
  }[];
}

export interface Log {
  id: string;
  monitor_id: string;
  status: number;
  method: string;
  url: string;
  timestamp: string;
  duration: number;
  region: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface StatusData {
  overall: 'operational' | 'degraded' | 'outage';
  systems: {
    name: string;
    uptime: number;
    status: 'operational' | 'degraded' | 'outage';
    history: ('operational' | 'degraded' | 'outage')[];
  }[];
  incidents: {
    id: string;
    title: string;
    date: string;
    status: 'monitoring' | 'resolved' | 'identified';
    updates: {
      type: string;
      date: string;
      text: string;
    }[];
  }[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}

// Fetch all monitors
export async function fetchMonitors(): Promise<Monitor[]> {
  return fetchJson<Monitor[]>(`${API_BASE}/monitors`);
}

// Fetch stats for a specific monitor
export async function fetchMonitorStats(monitorId: string): Promise<MonitorStats> {
  return fetchJson<MonitorStats>(`${API_BASE}/monitors/${monitorId}/stats`);
}

// Fetch response logs
export async function fetchLogs(params?: {
  monitorId?: string;
  limit?: number;
  since?: string;
}): Promise<Log[]> {
  const searchParams = new URLSearchParams();
  if (params?.monitorId) searchParams.set('monitor_id', params.monitorId);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.since) searchParams.set('since', params.since);

  const query = searchParams.toString();
  return fetchJson<Log[]>(`${API_BASE}/logs${query ? `?${query}` : ''}`);
}

// Fetch public status page data
export async function fetchStatus(): Promise<StatusData> {
  return fetchJson<StatusData>(`${API_BASE}/status`);
}

// Create a new monitor
export async function createMonitor(monitor: Omit<Monitor, 'id' | 'created_at' | 'status'>): Promise<Monitor> {
  const response = await fetch(`${API_BASE}/monitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(monitor),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}

// Update a monitor
export async function updateMonitor(id: string, monitor: Partial<Monitor>): Promise<Monitor> {
  const response = await fetch(`${API_BASE}/monitors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(monitor),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}

// Delete a monitor
export async function deleteMonitor(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/monitors/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
}
