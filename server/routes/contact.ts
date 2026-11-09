import { Router, Request, Response } from 'express';
import { checkRateLimit } from '../middleware/rateLimiter.ts';

export const contactRouter = Router();

/**
 * RULE 4: Rate-limit every form that sends email
 * Endpoint: POST /api/contact/send-email
 * Max 3 requests per 2 minutes per IP. Exceeding triggers HTTP 429 Too Many Requests.
 */
contactRouter.post('/send-email', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const rateLimitKey = `email_form_${clientIp}`;

  // Limit: 3 email requests per 120,000ms (2 minutes)
  const limitCheck = checkRateLimit(rateLimitKey, 3, 120_000);

  if (!limitCheck.allowed) {
    res.setHeader('Retry-After', limitCheck.retryAfterSeconds);
    return res.status(429).json({
      error: 'Rate limit exceeded: Too many email requests from this IP.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: limitCheck.retryAfterSeconds,
      rule: 'Rule 4: Rate-limit every form that sends email (Sliding Window)',
    });
  }

  const { recipient, subject, senderName, senderEmail, message, formType } = req.body;
  if (!senderEmail || !message) {
    return res.status(400).json({ error: 'senderEmail and message are required.' });
  }

  return res.json({
    success: true,
    message: `Inquiry dispatched securely to ${recipient || 'support@megamarket.co.ke'}.`,
    formType: formType || 'general_contact',
    remainingQuota: limitCheck.remaining,
    windowSeconds: 120,
  });
});
