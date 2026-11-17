import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// Database & Seed
import { seedDatabase } from './server/db/index.ts';

// Middlewares
import { authenticateSession } from './server/middleware/auth.ts';
import { generalApiRateLimiter } from './server/middleware/rateLimiter.ts';

// Modular Route Handlers
import { authRouter } from './server/routes/auth.ts';
import { adminRouter } from './server/routes/admin.ts';
import { vendorRouter } from './server/routes/vendor.ts';
import { ordersRouter } from './server/routes/orders.ts';
import { geminiRouter } from './server/routes/gemini.ts';
import { contactRouter } from './server/routes/contact.ts';
import { securityRouter } from './server/routes/security.ts';
import { reportsRouter } from './server/routes/reports.ts';
import { ratesRouter } from './server/routes/rates.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// In production, refuse to start if SESSION_SECRET is missing or shorter than 32 characters (no fallback secret)
if (isProduction) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.trim().length < 32) {
    console.error('Configuration Error: Missing required environment variable: SESSION_SECRET must be at least 32 characters in production.');
    process.exit(1);
  }
}

// 1. Trust proxy for Cloud Run and real client IP resolution
app.set('trust proxy', 1);

// 2. Disable X-Powered-By header
app.disable('x-powered-by');

// 3. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        // Allow this app to be framed only by itself and the AI Studio preview (override with FRAME_ANCESTORS, space-separated)
        frameAncestors: (process.env.FRAME_ANCESTORS
          ? process.env.FRAME_ANCESTORS.split(/\s+/).filter(Boolean)
          : ["'self'", 'https://aistudio.google.com', 'https://*.google.com', 'https://*.googleusercontent.com', 'https://*.usercontent.goog']),
      },
    },
    // X-Frame-Options would override the frame-ancestors list above, so it is disabled (CSP frame-ancestors replaces it)
    xFrameOptions: false,
    xContentTypeOptions: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    xPoweredBy: false,
  })
);

// 4. File Exposure Prevention: Return a real 404 for dotfiles, source files, or internal dirs
const BLOCKED_EXTENSIONS = ['.env', '.map', '.ts', '.sqlite'];
const BLOCKED_PREFIXES = ['/server', '/src', '/node_modules', '/.git'];

// Production only: in development Vite must be able to serve /src, /node_modules and dot paths, or the preview stays black.
if (isProduction) app.use((req: Request, res: Response, next: NextFunction) => {
  const urlPath = req.path;
  const segments = urlPath.split('/').filter(Boolean);
  const hasDotSegment = segments.some((s) => s.startsWith('.'));
  const hasBlockedExt = BLOCKED_EXTENSIONS.some((ext) => urlPath.toLowerCase().endsWith(ext));
  const hasBlockedPrefix = BLOCKED_PREFIXES.some(
    (prefix) => urlPath.startsWith(prefix) || urlPath.startsWith(`/${prefix}`)
  );

  if (hasDotSegment || hasBlockedExt || hasBlockedPrefix) {
    return res.status(404).type('text/plain').send('Not Found');
  }
  next();
});

// 5. Body Parsing with strict size limits (100kb)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// 6. CSRF and Origin Protection: Verify Origin / Referer matches app's own host for mutating requests
app.use((req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const host = req.get('host');
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (!origin && !referer) {
    return res.status(403).json({ error: 'Forbidden: Missing Origin or Referer header.' });
  }

  let sourceHost: string | null = null;
  if (origin) {
    try {
      sourceHost = new URL(origin).host;
    } catch {
      return res.status(403).json({ error: 'Forbidden: Invalid Origin header.' });
    }
  } else if (referer) {
    try {
      sourceHost = new URL(referer).host;
    } catch {
      return res.status(403).json({ error: 'Forbidden: Invalid Referer header.' });
    }
  }

  // Hosts this app may legitimately be served from: the Host header, the host forwarded by a proxy
  // (Cloud Run / AI Studio preview), and any extra hosts listed in ALLOWED_ORIGINS (comma separated).
  const forwardedHost = (req.get('x-forwarded-host') || '').split(',')[0].trim();
  const extraHosts = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .map((o) => {
      try {
        return new URL(o.includes('://') ? o : `https://${o}`).host.toLowerCase();
      } catch {
        return '';
      }
    });
  const allowedHosts = [host, forwardedHost, ...extraHosts]
    .filter((h): h is string => Boolean(h))
    .map((h) => h.toLowerCase());

  if (!sourceHost || !allowedHosts.includes(sourceHost.toLowerCase())) {
    return res.status(403).json({ error: 'Forbidden: Cross-origin request rejected.' });
  }

  next();
});

// 7. General API Rate Limiting (300 requests per 15 minutes per IP)
app.use('/api', generalApiRateLimiter);

// 8. Authenticate session from HTTP-Only cookie or Authorization header on every request
app.use(authenticateSession);

// 9. Mount Modular API Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/vendor', vendorRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/gemini', geminiRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/security', securityRouter);
app.use('/api/system', securityRouter);
app.use('/api/rates', ratesRouter);

// 10. Frontend Serving: In production serve ONLY the dist folder with real 404 handling
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath, { index: false }));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// 11. Global Error Handler: Returns generic message without exposing stack traces
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Never log sensitive data (passwords, tokens, cookies, secrets)
  console.error('Unhandled server error:', err?.message || 'Server error');
  return res.status(err?.status || 500).json({
    error: 'An internal server error occurred. Please try again later.',
  });
});

async function startServer() {
  try {
    // Initialize Database & Seed initial accounts (Admin, Demo Vendor, Demo Customer)
    await seedDatabase();

    // Start listening on port 3000
    app.listen(PORT, () => {
      console.log(`MegaMarket Server running on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
      console.log('Hosted Turso database connected; security hardening active.');
    });
  } catch (error) {
    console.error('Failed to start server. Could not connect to or set up the Turso database.');
    console.error('Check that TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are correctly configured.');
    console.error('Details:', error instanceof Error ? error.message : 'Database initialization failure');
    process.exit(1);
  }
}

startServer();
