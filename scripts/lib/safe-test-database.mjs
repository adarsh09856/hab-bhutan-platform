const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/** Require an explicitly named, loopback-only disposable PostgreSQL database. */
export function validateTestDatabaseUrl(value) {
  if (!value) throw new Error('Set TEST_DATABASE_URL to an isolated disposable PostgreSQL database; refusing to use DATABASE_URL.');

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('TEST_DATABASE_URL is invalid; value suppressed.');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('TEST_DATABASE_URL must use PostgreSQL.');
  }
  if (!LOOPBACK_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error('Safety stop: TEST_DATABASE_URL must target loopback only; host value suppressed.');
  }

  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!/(^|[_-])(test|tests|tmp|temp|verify|verification|scratch)([_-]|$)/i.test(databaseName)) {
    throw new Error('Safety stop: TEST_DATABASE_URL database name must clearly identify a disposable test database.');
  }
  return value;
}

export function requireTestDatabaseUrl(env = process.env) {
  return validateTestDatabaseUrl(env.TEST_DATABASE_URL);
}
