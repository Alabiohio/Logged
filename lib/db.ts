import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 150;

function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('fetch failed') ||
    msg.includes('Error connecting to database') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('socket hang up') ||
    msg.includes('UND_ERR') // undici connection pool errors
  );
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isTransientError(err) || attempt === MAX_RETRIES - 1) throw err;
      // Exponential backoff + jitter to prevent concurrent retries thundering-herding
      const jitter = Math.random() * BASE_DELAY_MS;
      await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** attempt + jitter));
    }
  }
  throw lastError;
}

const rawSql = neon(process.env.DATABASE_URL, {
  // Disable keepalive so Node.js/undici doesn't serve stale pooled connections —
  // this is the main cause of "fetch failed" errors on an otherwise warm database.
  fetchOptions: { keepalive: false },
});

// Proxy every call through the retry wrapper so transient failures are
// transparently retried before bubbling up to better-auth or route handlers.
const sql = new Proxy(rawSql, {
  apply(_target, _thisArg, args) {
    return withRetry(() => (rawSql as unknown as (...a: unknown[]) => Promise<unknown>)(...args));
  },
}) as typeof rawSql;

export const db = drizzle({ client: sql, schema });
