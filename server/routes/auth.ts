import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbHelpers } from '../db/index.ts';
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from '../middleware/auth.ts';
import { loginRateLimiter } from '../middleware/rateLimiter.ts';

export const authRouter = Router();

// Email format validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * 
 * Requirements:
 * 1. Validate name (min 2 chars).
 * 2. Validate email format.
 * 3. Validate password of at least 8 characters.
 * 4. Customers become role "customer".
 * 5. Vendors become role "vendor" with vendor status "pending".
 * 6. Nobody can register as admin from the browser; role is never taken from body for admin.
 * 7. Passwords hashed with bcrypt (10 rounds).
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, storeName, storeDescription, storeLogo } = req.body;

    // 1. Validate Name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Full name is required (minimum 2 characters).' });
    }

    // 2. Validate Email Format
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    // 3. Validate Password Length (at least 8 characters)
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // 4. Role Assignment & Protection against Admin Elevation
    // Strictly assign either 'vendor' or 'customer'. 'admin' is NEVER allowed from registration.
    const assignedRole: 'customer' | 'vendor' = role === 'vendor' ? 'vendor' : 'customer';

    // 5. Check if email already exists
    const existing = dbHelpers.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // 6. Hash password with bcrypt (at least 10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    // 7. Insert User
    dbHelpers.insertUser({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: assignedRole,
      created_at: now,
    });

    let vendorId: string | undefined;
    let vendorStatus: 'pending' | 'approved' | 'suspended' | undefined;

    // 8. If Vendor, create vendor store record with status "pending"
    if (assignedRole === 'vendor') {
      vendorId = `vnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      vendorStatus = 'pending';

      dbHelpers.insertVendor({
        id: vendorId,
        user_id: userId,
        shop_name: (storeName || `${name.trim()}'s Shop`).trim(),
        description: (storeDescription || '').trim() || 'Newly registered vendor store on MegaMarket.',
        logo: storeLogo || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
        status: 'pending', // Vendors always start in pending status awaiting admin approval
        created_at: now,
      });
    }

    // 9. Create signed session token and set httpOnly cookie
    const token = createSessionToken({
      userId,
      email: normalizedEmail,
      role: assignedRole,
    });
    setSessionCookie(res, token);

    return res.status(201).json({
      success: true,
      message:
        assignedRole === 'vendor'
          ? 'Merchant account registered! Your store is submitted for administrator approval.'
          : 'Customer account created successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        role: assignedRole,
        vendorId,
        vendorStatus,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

/**
 * POST /api/auth/login
 * 
 * Requirements:
 * 1. Check email and password.
 * 2. Return a generic error ("Invalid email or password") for both wrong email and wrong password.
 * 3. Rate-limit to 5 attempts per 15 minutes per IP.
 * 4. Set httpOnly, sameSite cookie containing signed session token.
 */
authRouter.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user by email
    const user = dbHelpers.findUserByEmail(normalizedEmail);

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

    // Look up associated vendor details if vendor
    let vendorId: string | undefined;
    let vendorStatus: 'pending' | 'approved' | 'suspended' | undefined;

    if (user.role === 'vendor') {
      const vendor = dbHelpers.findVendorByUserId(user.id);
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

    return res.json({
      success: true,
      message: `Signed in as ${user.name} (${user.role.toUpperCase()}).`,
      token,
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
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

/**
 * POST /api/auth/logout
 * 
 * Requirements:
 * Clears httpOnly session cookie and ends session.
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
 * 
 * Requirements:
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

