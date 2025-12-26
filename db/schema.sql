-- schema.sql - D1 database schema for healthcheck scheduler

CREATE TABLE IF NOT EXISTS monitors (
  id TEXT PRIMARY KEY,

  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  address TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  method TEXT NOT NULL DEFAULT 'GET',
  port INTEGER NOT NULL DEFAULT 443,
  type TEXT NOT NULL DEFAULT 'HTTPS',

  header TEXT,
  body TEXT,

  expected_code TEXT NOT NULL DEFAULT '200',
  expected_body TEXT,
  match TEXT NOT NULL DEFAULT 'none',

  timeout INTEGER NOT NULL DEFAULT 5000,
  frequency INTEGER NOT NULL,
  offset INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,

  monitor_slug TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT,
  active INTEGER NOT NULL DEFAULT 1,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (monitor_slug) REFERENCES monitors(slug) ON DELETE CASCADE,
  UNIQUE(monitor_slug, email)
);

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  monitor_id TEXT NOT NULL,

  status TEXT NOT NULL,
  status_code INTEGER,
  latency INTEGER,

  error TEXT,
  response_body TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_logs_monitor_id
  ON logs (monitor_id);

CREATE INDEX IF NOT EXISTS idx_logs_created_at
  ON logs (monitor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscribers_monitor_slug
  ON subscribers (monitor_slug);
