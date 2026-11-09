import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbHelpers } from '../db/index.ts';

export const SESSION_SECRET = process.env.SESSION_SECRET || 'megamarket_default_dev_session_secret_2026';
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
 * Sign JWT session token
 */
export function createSessionToken(payload: AuthSessionPayload): string {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: '7d' });
}

/**
 * Set HTTP-Only, SameSite Session Cookie
 */
export function setSessionCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/**
 * Clear Session Cookie on Logout
 */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

/**
 * Middleware: Extract and verify session token from Cookie or Bearer header
 */
export function authenticateSession(req: Request, _res: Response, next: NextFunction): void {
  // Read from httpOnly cookie or Authorization Bearer header
  const token =
    req.cookies?.[COOKIE_NAME] ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, SESSION_SECRET) as AuthSessionPayload;
    if (decoded && decoded.userId) {
      const user = dbHelpers.findUserById(decoded.userId);
      if (user) {
        let vendorId: string | undefined;
        let vendorStatus: 'pending' | 'approved' | 'suspended' | undefined;

        if (user.role === 'vendor') {
          const vendor = dbHelpers.findVendorByUserId(user.id);
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

