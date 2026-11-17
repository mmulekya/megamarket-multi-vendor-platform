import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbHelpers } from '../db/index.ts';
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from '../middleware/auth.ts';
import {
  loginRateLimiter,
  registerRateLimiter,
  verifyEmailRateLimiter,
  resendCodeRateLimiter,
} from '../middleware/rateLimiter.ts';
import { sendMail } from '../mail/mailer.ts';
import {
  CODE_EXPIRY_MS,
  MAX_CODE_ATTEMPTS,
  RESEND_COOLDOWN_MS,
  buildVerificationEmail,
  generateVerificationCode,
  hashVerificationCode,
  isDisposableEmail,
  maskEmail,
  verifyCodeHash,
} from '../mail/verification.ts';
import type { EmailCodePurpose } from '../mail/verification.ts';

export const authRouter = Router();

// Email format validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function issueAndSendCode(
  userId: string,
  email: string,
  purpose: EmailCodePurpose
): Promise<boolean> {
  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(userId, purpose, code);
  const now = new Date();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MS).toISOString();
  const codeId = `ecd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  await dbHelpers.createEmailCode({
    id: codeId,
    user_id: userId,
    purpose,
    code_hash: codeHash,
    expires_at: expiresAt,
    attempts: 0,
    used_at: null,
    created_at: createdAt,
  });

  const { subject, html, text } = buildVerificationEmail(code, purpose);
  return sendMail({ to: email, subject, html, text });
}

/**
 * POST /api/auth/register
 * 
 * Hardened Requirements:
 * 1. Rate-limited to 5 per hour per IP.
 * 2. Hidden honeypot field silently rejects bot submissions.
 * 3. Rejects disposable email domains and requires acceptedTerms === true.
 * 4. Creates account with email_verified = 0 (vendors stay pending).
 * 5. Sends 6-digit verification code; returns { needsVerification: true, maskedEmail } with NO session cookie.
 */
authRouter.post('/register', registerRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      storeName,
      storeDescription,
      storeLogo,
      acceptedTerms,
      website,
      honeypot,
    } = req.body;

    // 0a. Hidden honeypot check: silently reject if filled
    const hpVal = typeof website === 'string' && website.trim() ? website : typeof honeypot === 'string' && honeypot.trim() ? honeypot : '';
    if (hpVal.length > 0) {
      return res.status(200).json({
        needsVerification: true,
        maskedEmail: '***',
      });
    }

    // 0b. Validate Age (18+) and Terms & Privacy acceptance
    if (acceptedTerms !== true) {
      return res.status(400).json({
        error: 'You must confirm that you are 18 years or older and accept the Terms & Conditions and Privacy Policy.',
      });
    }

    // 1. Validate Name
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ error: 'Full name is required (between 2 and 100 characters).' });
    }
    const cleanName = escapeHtml(name.trim().slice(0, 100));

    // 2. Validate Email Format & reject disposable domains
    const normalizedEmail = (typeof email === 'string' ? email : '').toLowerCase().trim();
    if (!normalizedEmail || normalizedEmail.length > 100 || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ error: 'A valid email address is required (maximum 100 characters).' });
    }
    if (isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({
        error: 'Disposable email addresses are not allowed. Please use a permanent email address.',
      });
    }

    // 3. Validate Password Length (8 to 128 characters)
    if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 8 and 128 characters long.' });
    }

    // 4. Role Assignment & Protection against Admin Elevation
    // Strictly assign either 'vendor' or 'customer'. 'admin' is NEVER accepted from registration.
    const assignedRole: 'customer' | 'vendor' = role === 'vendor' ? 'vendor' : 'customer';

    // 5. Check if email already exists
    const existing = await dbHelpers.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // 6. Hash password with bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    let vendorId: string | undefined;

    // 7. Insert User (email_verified = 0) and optional Vendor store record (status = pending)
    if (assignedRole === 'vendor') {
      vendorId = `vnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const cleanStoreName = typeof storeName === 'string' && storeName.trim()
        ? escapeHtml(storeName.trim().slice(0, 100))
        : `${cleanName}'s Shop`;

      const cleanStoreDesc = typeof storeDescription === 'string' && storeDescription.trim()
        ? escapeHtml(storeDescription.trim().slice(0, 500))
        : 'Newly registered vendor store on MegaMarket.';

      const cleanLogo = typeof storeLogo === 'string' && storeLogo.startsWith('http')
        ? storeLogo.trim().slice(0, 255)
        : 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80';

      await dbHelpers.registerUserAndVendor(
        {
          id: userId,
          name: cleanName,
          email: normalizedEmail,
          password_hash: passwordHash,
          role: assignedRole,
          email_verified: 0,
          created_at: now,
        },
        {
          id: vendorId,
          user_id: userId,
          shop_name: cleanStoreName,
          description: cleanStoreDesc,
          logo: cleanLogo,
          status: 'pending',
          created_at: now,
        }
      );
    } else {
      await dbHelpers.insertUser({
        id: userId,
        name: cleanName,
        email: normalizedEmail,
        password_hash: passwordHash,
        role: assignedRole,
        email_verified: 0,
        created_at: now,
      });
    }

    // 8. Generate and send verification code; DO NOT set a session cookie
    const sent = await issueAndSendCode(userId, normalizedEmail, 'verify');
    if (!sent) {
      return res.status(503).json({
        error: 'We could not send the email. Please try again later.',
      });
    }

    return res.status(201).json({
      success: true,
      needsVerification: true,
      maskedEmail: maskEmail(normalizedEmail),
      message:
        assignedRole === 'vendor'
          ? 'Merchant account registered! Check your email for your verification code. Your store remains pending until approved by the administrator.'
          : 'Account created! Please enter the verification code sent to your email.',
    });
  } catch (error: any) {
    console.error('Registration error:', error?.message || 'Database error');
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

/**
 * POST /api/auth/verify-email
 * Verifies 6-digit email code (timing-safe HMAC-SHA256, 15m expiry, max 5 wrong attempts).
 * Sets email_verified = 1 and returns "Email confirmed" without starting a session.
 */
authRouter.post('/verify-email', verifyEmailRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const normalizedEmail = (typeof email === 'string' ? email : '').toLowerCase().trim().slice(0, 100);
    const trimmedCode = typeof code === 'string' ? code.trim() : '';

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail) || !/^\d{6}$/.test(trimmedCode)) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    const user = await dbHelpers.findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    const activeCode = await dbHelpers.findLatestActiveEmailCode(user.id, 'verify');
    if (!activeCode) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    const nowIso = new Date().toISOString();

    if (new Date(activeCode.expires_at).getTime() <= Date.now()) {
      await dbHelpers.invalidateEmailCode(activeCode.id, nowIso);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (Number(activeCode.attempts) >= MAX_CODE_ATTEMPTS) {
      await dbHelpers.invalidateEmailCode(activeCode.id, nowIso);
      return res.status(400).json({
        error: 'Too many incorrect attempts. This code has been invalidated. Please request a new code.',
      });
    }

    const isMatch = verifyCodeHash(user.id, 'verify', trimmedCode, activeCode.code_hash);
    if (!isMatch) {
      const nextAttempts = Number(activeCode.attempts || 0) + 1;
      const invalidateAt = nextAttempts >= MAX_CODE_ATTEMPTS ? nowIso : undefined;
      await dbHelpers.incrementEmailCodeAttempt(activeCode.id, nextAttempts, invalidateAt);

      return res.status(400).json({
        error: invalidateAt
          ? 'Too many incorrect attempts. This code has been invalidated. Please request a new code.'
          : 'Invalid verification code.',
      });
    }

    await dbHelpers.markEmailCodeUsedAndVerifyUser(activeCode.id, user.id, nowIso);

    return res.json({
      success: true,
      message: 'Email confirmed',
    });
  } catch (error: any) {
    console.error('Verify email error:', error?.message || 'Server error');
    return res.status(500).json({ error: 'Internal server error during email verification.' });
  }
});

/**
 * POST /api/auth/resend-code
 * Rate limited to 5/hour per IP and 60s cooldown per user.
 * Always returns the same success response whether or not the email exists.
 */
authRouter.post('/resend-code', resendCodeRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, purpose } = req.body;

    const normalizedEmail = (typeof email === 'string' ? email : '').toLowerCase().trim().slice(0, 100);
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const validPurpose: EmailCodePurpose | null =
      purpose === 'verify' || purpose === 'login' ? purpose : null;
    if (!validPurpose) {
      return res.status(400).json({ error: 'Invalid verification purpose.' });
    }

    const genericSuccess = {
      success: true,
      message: 'If an account matching this email requires verification, a code has been sent.',
    };

    const user = await dbHelpers.findUserByEmail(normalizedEmail);
    if (!user) {
      return res.json(genericSuccess);
    }

    if (validPurpose === 'verify' && Number(user.email_verified) === 1) {
      return res.json(genericSuccess);
    }

    const latest = await dbHelpers.findLatestEmailCodeByUser(user.id, validPurpose);
    if (latest) {
      const elapsedMs = Date.now() - new Date(latest.created_at).getTime();
      if (elapsedMs < RESEND_COOLDOWN_MS) {
        return res.json(genericSuccess);
      }
    }

    const sent = await issueAndSendCode(user.id, user.email, validPurpose);
    if (!sent) {
      return res.status(503).json({
        error: 'We could not send the email. Please try again later.',
      });
    }

    return res.json(genericSuccess);
  } catch (error: any) {
    console.error('Resend code error:', error?.message || 'Server error');
    return res.status(500).json({ error: 'Internal server error while sending code.' });
  }
});

/**
 * POST /api/auth/login
 * 
 * Hardened Requirements:
 * 1. Rate-limit to 5 attempts per 15 minutes per IP.
 * 2. Generic error ("Invalid email or password") for both wrong email and wrong password.
 * 3. If password matches but email_verified = 0, send a new code and return { needsVerification: true } with NO cookie.
 * 4. Cookie-only authentication: NO token field in JSON body.
 */
authRouter.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const normalizedEmail = email.toLowerCase().trim().slice(0, 100);

    // Query user by email
    const user = await dbHelpers.findUserByEmail(normalizedEmail);

    // Generic error if user not found (avoids email enumeration)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    // Generic error if password does not match
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If user is not email-verified yet, send a new verification code and return needsVerification with NO cookie
    if (Number(user.email_verified) !== 1) {
      const sent = await issueAndSendCode(user.id, user.email, 'verify');
      if (!sent) {
        return res.status(503).json({
          error: 'We could not send the email. Please try again later.',
        });
      }

      return res.json({
        needsVerification: true,
        maskedEmail: maskEmail(user.email),
        message: 'Please verify your email address before signing in. A verification code has been sent.',
      });
    }

    // Look up associated vendor details if vendor
    let vendorId: string | undefined;
    let vendorStatus: 'pending' | 'approved' | 'suspended' | undefined;

    if (user.role === 'vendor') {
      const vendor = await dbHelpers.findVendorByUserId(user.id);
      if (vendor) {
        vendorId = vendor.id;
        vendorStatus = vendor.status;
      }
    }

    // Create signed session token and set httpOnly cookie
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    setSessionCookie(res, token);

    // Cookie-only authentication: NO token field in JSON body
    return res.json({
      success: true,
      message: `Signed in as ${user.name} (${user.role.toUpperCase()}).`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorId,
        vendorStatus,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error?.message || 'Server error');
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

/**
 * POST /api/auth/logout
 * Clears and invalidates httpOnly session cookie.
 */
authRouter.post('/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user from the verified session, or null if guest.
 */
authRouter.get('/me', (req: Request, res: Response) => {
  if (req.user) {
    return res.json({
      authenticated: true,
      user: req.user,
    });
  }

  return res.json({
    authenticated: false,
    user: null,
  });
});
