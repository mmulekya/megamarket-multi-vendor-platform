import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbHelpers } from '../db/index.ts';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.trim().length < 32) {
      console.error('Configuration Error: Missing required environment variable: SESSION_SECRET must be at least 32 characters in production.');
      process.exit(1);
    }
    return secret.trim();
  }
  return secret || 'megamarket_default_dev_session_secret_2026_at_least_32_characters';
}

export const SESSION_SECRET = getSessionSecret();
export const COOKIE_NAME = 'mm_session';

export interface AuthSessionPayload {
  userId: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  vendorId?: string;
  vendorStatus?: 'pending' | 'approved' | 'suspended';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Sign JWT session token (7-day validity)
 */
export function createSessionToken(payload: AuthSessionPayload): string {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: '7d' });
}

/**
 * Set HTTP-Only, Secure, SameSite Session Cookie that expires with the JWT token
 */
export function setSessionCookie(res: Response, token: string): void {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
    expires: new Date(Date.now() + maxAge),
    path: '/',
  });
}

/**
 * Invalidate Session Cookie completely on Logout
 */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  res.cookie(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    maxAge: 0,
    path: '/',
  });
}

/**
 * Middleware: Extract and verify session token from Cookie or Bearer header
 */
export async function authenticateSession(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token =
    req.cookies?.[COOKIE_NAME] ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, SESSION_SECRET) as AuthSessionPayload;
    if (decoded && decoded.userId) {
      const user = await dbHelpers.findUserById(decoded.userId);
      if (user && Number(user.email_verified) === 1) {
        let vendorId: string | undefined;
        let vendorStatus: 'pending' | 'approved' | 'suspended' | undefined;

        if (user.role === 'vendor') {
          const vendor = await dbHelpers.findVendorByUserId(user.id);
          if (vendor) {
            vendorId = vendor.id;
            vendorStatus = vendor.status;
          }
        }

        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorId,
          vendorStatus,
        };
      }
    }
  } catch {
    // Invalid or expired token; proceed as guest
  }

  next();
}

/**
 * Guard: Require authenticated user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

/**
 * Guard: Require specific roles
 */
export function requireRole(...allowedRoles: Array<'customer' | 'vendor' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

/**
 * Guard: Require an approved vendor
 * A pending or suspended vendor cannot publish products.
 */
export function requireApprovedVendor(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in as a vendor.' });
  }
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only vendors or administrators can perform this action.' });
  }
  if (req.user.role === 'vendor') {
    if (!req.user.vendorId) {
      return res.status(403).json({ error: 'Forbidden: No vendor store associated with this account.' });
    }
    if (req.user.vendorStatus !== 'approved') {
      return res.status(403).json({
        error: `Forbidden: Vendor store is ${req.user.vendorStatus || 'pending'}. A pending or suspended vendor cannot publish products. Please wait for administrator approval.`,
        vendorStatus: req.user.vendorStatus,
      });
    }
  }
  next();
}
