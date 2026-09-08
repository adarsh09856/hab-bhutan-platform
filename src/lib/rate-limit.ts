import prisma from './prisma';

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * In-Memory sliding-window rate limiter (synchronous fallback)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldestTimestamp = entry.timestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds,
    };
  }

  entry.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: limit - entry.timestamps.length,
    resetInSeconds: windowSeconds,
  };
}

/**
 * Durable Sliding-Window Rate Limiter backed by PostgreSQL.
 * Persists across serverless function instances, cold starts, and container recycling.
 */
export async function checkDurableRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowSeconds * 1000);

  try {
    const count = await prisma.rateLimitAttempt.count({
      where: {
        key,
        createdAt: { gte: cutoff },
      },
    });

    if (count >= limit) {
      const oldest = await prisma.rateLimitAttempt.findFirst({
        where: { key, createdAt: { gte: cutoff } },
        orderBy: { createdAt: 'asc' },
      });
      const oldestTime = oldest ? oldest.createdAt.getTime() : cutoff.getTime();
      const resetInSeconds = Math.max(1, Math.ceil((oldestTime + windowSeconds * 1000 - now.getTime()) / 1000));

      return {
        success: false,
        limit,
        remaining: 0,
        resetInSeconds,
      };
    }

    await prisma.rateLimitAttempt.create({
      data: {
        key,
        createdAt: now,
      },
    });

    // Prune older attempts (> 1 hour) asynchronously with 10% sampling
    if (Math.random() < 0.10) {
      pruneExpiredRateLimits().catch(() => {});
    }

    return {
      success: true,
      limit,
      remaining: limit - (count + 1),
      resetInSeconds: windowSeconds,
    };
  } catch (err) {
    console.error('Database rate limiter fallback to in-memory store:', err);
    return checkRateLimit(key, limit, windowSeconds);
  }
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Prunes expired rate limit attempts older than specified duration (defaults to 1 hour).
 */
export async function pruneExpiredRateLimits(olderThanMs = 60 * 60 * 1000): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - olderThanMs);
    const res = await prisma.rateLimitAttempt.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return res.count;
  } catch (err) {
    console.error('Error pruning expired rate limit records:', err);
    return 0;
  }
}

