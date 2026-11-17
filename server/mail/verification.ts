import crypto from 'crypto';
import { SESSION_SECRET } from '../middleware/auth.ts';

export type EmailCodePurpose = 'verify' | 'login';

export const CODE_EXPIRY_MINUTES = 15;
export const CODE_EXPIRY_MS = CODE_EXPIRY_MINUTES * 60 * 1000;
export const MAX_CODE_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 60 * 1000;

const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'yopmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.net',
  'sharklasers.com',
  'getnada.com',
  'dispostable.com',
  'fakeinbox.com',
  'maildrop.cc',
  'mintemail.com',
  'mohmal.com',
  'burnermail.io',
  'mailnesia.com',
  'tempinbox.com',
]);

/**
 * Check whether an email uses a known disposable email domain.
 */
export function isDisposableEmail(email: string): boolean {
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(parts[1]);
}

/**
 * Mask an email address for UI hints (e.g. "j***e@example.com").
 */
export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.toLowerCase().trim().split('@');
  if (!domain) return '***';
  if (local.length <= 2) {
    return `${local[0] || '*'}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Generate a cryptographically random 6-digit verification code.
 */
export function generateVerificationCode(): string {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

/**
 * Compute an HMAC-SHA256 hash of a verification code keyed by SESSION_SECRET.
 */
export function hashVerificationCode(
  userId: string,
  purpose: EmailCodePurpose,
  code: string
): string {
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${userId}:${purpose}:${code}`)
    .digest('hex');
}

/**
 * Constant-time comparison between a candidate code and a stored HMAC-SHA256 hex digest.
 */
export function verifyCodeHash(
  userId: string,
  purpose: EmailCodePurpose,
  candidateCode: string,
  expectedHash: string
): boolean {
  const candidateHash = hashVerificationCode(userId, purpose, candidateCode);
  const candidateBuf = Buffer.from(candidateHash, 'hex');
  const expectedBuf = Buffer.from(expectedHash, 'hex');
  if (candidateBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(candidateBuf, expectedBuf);
}

/**
 * Build simple HTML and plain-text verification emails.
 */
export function buildVerificationEmail(
  code: string,
  purpose: EmailCodePurpose
): { subject: string; html: string; text: string } {
  const subject =
    purpose === 'login'
      ? 'MegaMarket — Your Sign-In Verification Code'
      : 'MegaMarket — Confirm Your Email Address';

  const heading =
    purpose === 'login'
      ? 'Sign-In Verification Code'
      : 'Confirm Your Email Address';

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background-color:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#313133;">
    <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border-radius:12px;padding:32px;border:1px solid #E5E7EB;">
      <div style="font-size:20px;font-weight:800;color:#F68B1E;margin-bottom:16px;">MegaMarket</div>
      <h1 style="font-size:18px;font-weight:700;margin:0 0 12px 0;color:#111827;">${heading}</h1>
      <p style="font-size:14px;line-height:1.5;margin:0 0 20px 0;color:#4B5563;">
        Use the verification code below to verify your MegaMarket email address:
      </p>
      <div style="text-align:center;background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:18px 12px;margin:0 0 20px 0;">
        <span style="font-size:34px;font-weight:800;letter-spacing:8px;color:#111827;font-family:monospace;">${code}</span>
      </div>
      <p style="font-size:13px;font-weight:600;color:#374151;margin:0 0 12px 0;">
        This code expires in 15 minutes.
      </p>
      <p style="font-size:12px;color:#6B7280;margin:0;">
        If you did not create this account, ignore this email.
      </p>
    </div>
  </body>
</html>`;

  const text = [
    'MegaMarket',
    '',
    heading,
    '',
    `Your verification code: ${code}`,
    '',
    'This code expires in 15 minutes.',
    'If you did not create this account, ignore this email.',
  ].join('\n');

  return { subject, html, text };
}
