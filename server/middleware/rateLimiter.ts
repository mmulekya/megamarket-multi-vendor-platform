import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Universal sliding-window rate limiter check
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Evict timestamps outside the rolling window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);
  return { allowed: true, retryAfterSeconds: 0, remaining: maxRequests - record.timestamps.length };
}

/**
 * Specialized Rate Limiter for Login:
 * 5 attempts per 15 minutes per IP.
 */
export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const key = `login_limit_${clientIp}`;

  const limitCheck = checkRateLimit(key, 5, 15 * 60 * 1000); // 15 minutes = 900,000ms

  if (!limitCheck.allowed) {
    res.setHeader('Retry-After', limitCheck.retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many login attempts. Please try again in 15 minutes.',
      code: 'LOGIN_RATE_LIMITED',
      retryAfterSeconds: limitCheck.retryAfterSeconds,
    });
  }

  next();
}
