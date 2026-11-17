import type { Request, Response, NextFunction } from 'express';

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
 * Helper to get clean real client IP using Express req.ip (trust proxy)
 */
function getClientIp(req: Request): string {
  return req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown-ip';
}

/**
 * Rate Limiter for Login:
 * 5 attempts per 15 minutes per IP.
 */
export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req);
  const key = `login_limit_${clientIp}`;

  const limitCheck = checkRateLimit(key, 5, 15 * 60 * 1000); // 15 mins

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

/**
 * Rate Limiter for Registration:
 * 5 attempts per hour per IP.
 */
export function registerRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req);
  const key = `register_limit_${clientIp}`;

  const limitCheck = checkRateLimit(key, 5, 60 * 60 * 1000); // 1 hour

  if (!limitCheck.allowed) {
    res.setHeader('Retry-After', limitCheck.retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many registration attempts from this network. Please wait before creating another account.',
      code: 'REGISTER_RATE_LIMITED',
      retryAfterSeconds: limitCheck.retryAfterSeconds,
    });
  }

  next();
}

/**
 * Rate Limiter for Contact Form:
 * 5 attempts per hour per IP.
 */
export function contactRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req);
  const key = `contact_limit_${clientIp}`;

  const limitCheck = checkRateLimit(key, 5, 60 * 60 * 1000); // 1 hour

  if (!limitCheck.allowed) {
    res.setHeader('Retry-After', limitCheck.retryAfterSeconds);
    return res.status(429).json({
      error: 'Rate limit exceeded: Too many messages sent from this IP. Please wait.',
      code: 'CONTACT_RATE_LIMITED',
      retryAfterSeconds: limitCheck.retryAfterSeconds,
    });
  }

  next();
}

/**
 * Rate Limiter for Reports:
 * 5 attempts per hour per IP.
 */
export function reportsRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req);
  const key = `reports_limit_${clientIp}`;

  const limitCheck = checkRateLimit(key, 5, 60 * 60 * 1000); // 1 hour

  if (!limitCheck.allowed) {
    res.setHeader('Retry-After', limitCheck.retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many reports submitted from this network. Please wait before submitting another report.',
      code: 'REPORTS_RATE_LIMITED',
      retryAfterSeconds: limitCheck.retryAfterSeconds,
    });
  }

  next();
}

/**
 * Rate Limiter for Email Verification:
 * 20 attempts per 15 minutes per IP.
 */
export function verifyEmailRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req);
  const key = `verify_email_limit_${clientIp}`;

  const limitCheck = checkRateLimit(key, 20, 15 * 60 * 1000); // 15 mins

  if (!limitCheck.allowed) {
    res.setHeader('Retry-After', limitCheck.retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many verification attempts. Please try again in 15 minutes.',
      code: 'VERIFY_EMAIL_RATE_LIMITED',
      retryAfterSeconds: limitCheck.retryAfterSeconds,
    });
  }

  next();
}

/**
 * Rate Limiter for Resend Code:
 * 5 attempts per hour per IP.
 */
export function resendCodeRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req);
  const key = `resend_code_limit_${clientIp}`;

  const limitCheck = checkRateLimit(key, 5, 60 * 60 * 1000); // 1 hour

  if (!limitCheck.allowed) {
    res.setHeader('Retry-After', limitCheck.retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many verification code requests. Please wait before trying again.',
      code: 'RESEND_CODE_RATE_LIMITED',
      retryAfterSeconds: limitCheck.retryAfterSeconds,
    });
  }

  next();
}

/**
 * General API Rate Limiter:
 * 300 requests per 15 minutes per IP.
 */
export function generalApiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req);
  const key = `general_api_${clientIp}`;

  const limitCheck = checkRateLimit(key, 300, 15 * 60 * 1000); // 15 mins

  if (!limitCheck.allowed) {
    res.setHeader('Retry-After', limitCheck.retryAfterSeconds);
    return res.status(429).json({
      error: 'API rate limit exceeded. Please slow down your requests.',
      code: 'API_RATE_LIMITED',
      retryAfterSeconds: limitCheck.retryAfterSeconds,
    });
  }

  next();
}
