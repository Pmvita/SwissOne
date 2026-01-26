// apps/web/lib/services/rate-limiter.ts
// Shared rate limiting service for API endpoints
// Uses in-memory storage (can be upgraded to Redis for production)

interface RateLimitEntry {
  count: number;
  resetAt: number;
  firstRequestAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number; // Optional: block user for this duration after exceeding limit
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private blockedUsers: Map<string, number> = new Map(); // userId -> unblock timestamp
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Clean up expired entries periodically
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
    }
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (usually userId or userId:endpoint)
   * @param config - Rate limit configuration
   * @returns { allowed: boolean, remaining: number, resetAt: number, retryAfter?: number }
   */
  checkLimit(
    key: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
  } {
    const now = Date.now();

    // Check if user is blocked
    const blockedUntil = this.blockedUsers.get(key);
    if (blockedUntil && blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: blockedUntil,
        retryAfter: Math.ceil((blockedUntil - now) / 1000),
      };
    }

    // Remove block if expired
    if (blockedUntil && blockedUntil <= now) {
      this.blockedUsers.delete(key);
    }

    const entry = this.store.get(key);
    const windowMs = config.windowMs;

    // No entry or window expired - create new entry
    if (!entry || entry.resetAt < now) {
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs,
        firstRequestAt: now,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + windowMs,
      };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      // Block user if blockDurationMs is configured
      if (config.blockDurationMs) {
        const blockUntil = now + config.blockDurationMs;
        this.blockedUsers.set(key, blockUntil);
      }

      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      };
    }

    // Increment count
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Get current rate limit status (without incrementing)
   */
  getStatus(key: string, config: RateLimitConfig): {
    remaining: number;
    resetAt: number;
    isBlocked: boolean;
    retryAfter?: number;
  } {
    const now = Date.now();
    const blockedUntil = this.blockedUsers.get(key);

    if (blockedUntil && blockedUntil > now) {
      return {
        remaining: 0,
        resetAt: blockedUntil,
        isBlocked: true,
        retryAfter: Math.ceil((blockedUntil - now) / 1000),
      };
    }

    const entry = this.store.get(key);

    if (!entry || entry.resetAt < now) {
      return {
        remaining: config.maxRequests,
        resetAt: now + config.windowMs,
        isBlocked: false,
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetAt: entry.resetAt,
      isBlocked: false,
    };
  }

  /**
   * Reset rate limit for a key (useful for testing or manual override)
   */
  reset(key: string): void {
    this.store.delete(key);
    this.blockedUsers.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    // Clean up expired rate limit entries
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }

    // Clean up expired blocks
    for (const [key, blockedUntil] of this.blockedUsers.entries()) {
      if (blockedUntil <= now) {
        this.blockedUsers.delete(key);
      }
    }
  }

  /**
   * Get statistics (for monitoring)
   */
  getStats(): {
    activeLimits: number;
    blockedUsers: number;
  } {
    return {
      activeLimits: this.store.size,
      blockedUsers: Array.from(this.blockedUsers.values()).filter(
        (until) => until > Date.now()
      ).length,
    };
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // Price API: 20 requests per minute per user
  PRICE_API: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes if exceeded
  } as RateLimitConfig,

  // AUM API: 10 requests per minute per user
  AUM_API: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  } as RateLimitConfig,

  // General API: 30 requests per minute per user
  GENERAL_API: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  } as RateLimitConfig,
};
