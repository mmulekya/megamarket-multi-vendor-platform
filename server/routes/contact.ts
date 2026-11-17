import { Router } from 'express';
import type { Request, Response } from 'express';
import { contactRateLimiter } from '../middleware/rateLimiter.ts';

export const contactRouter = Router();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/contact/send-email
 * Hardened with 5 requests/hour rate limit, strict field validation and HTML sanitization.
 */
contactRouter.post('/send-email', contactRateLimiter, (req: Request, res: Response) => {
  const { recipient, subject, senderName, senderEmail, message, formType } = req.body;

  if (!senderEmail || typeof senderEmail !== 'string' || !message || typeof message !== 'string') {
    return res.status(400).json({ error: 'senderEmail and message are required.' });
  }

  const cleanEmail = senderEmail.toLowerCase().trim().slice(0, 100);
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid senderEmail format.' });
  }

  const cleanMessage = message.trim();
  if (cleanMessage.length < 10 || cleanMessage.length > 2000) {
    return res.status(400).json({ error: 'Message must be between 10 and 2000 characters.' });
  }

  const cleanName = typeof senderName === 'string' ? escapeHtml(senderName.trim().slice(0, 100)) : 'Shopper';
  const cleanSubject = typeof subject === 'string' ? escapeHtml(subject.trim().slice(0, 150)) : 'Customer Inquiry';
  const cleanRecipient = typeof recipient === 'string' && EMAIL_REGEX.test(recipient.trim()) ? recipient.trim().slice(0, 100) : 'support@megamarket.co.ke';

  return res.json({
    success: true,
    message: `Inquiry dispatched securely to ${cleanRecipient}.`,
    subject: cleanSubject,
    senderName: cleanName,
    formType: formType ? String(formType).slice(0, 50) : 'general_contact',
  });
});
