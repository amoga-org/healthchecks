-- seed.sql - Sample data for testing healthcheck scheduler

INSERT INTO monitors (
  id, slug, description, address, path, method, port, type,
  expected_code, frequency, timeout, active, created_at, updated_at
)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
    'crm.staging',
    'CRM system healthcheck',
    'crm.amoga.app',
    '/',
    'GET',
    443,
    'HTTPS',
    '200',
    1,
    5000,
    1,
    datetime('now'),
    datetime('now')
  );

INSERT INTO subscribers (
  id, monitor_slug, email, category, active, created_at, updated_at
)
VALUES
  (
    'b1b2c3d4-e5f6-7890-abcd-ef1234567891',
    'crm.staging',
    'admin@example.com',
    'psme',
    1,
    datetime('now'),
    datetime('now')
  );
