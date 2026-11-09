import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Database & Seed
import { seedDatabase } from './server/db/index.ts';

// Middlewares
import { authenticateSession } from './server/middleware/auth.ts';

// Modular Route Handlers
import { authRouter } from './server/routes/auth.ts';
import { adminRouter } from './server/routes/admin.ts';
import { vendorRouter } from './server/routes/vendor.ts';
import { ordersRouter } from './server/routes/orders.ts';
import { geminiRouter } from './server/routes/gemini.ts';
import { contactRouter } from './server/routes/contact.ts';
import { securityRouter } from './server/routes/security.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Authenticate session from HTTP-Only cookie or Authorization header on every request
app.use(authenticateSession);

// Mount Modular API Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/vendor', vendorRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/gemini', geminiRouter);
app.use('/api/contact', contactRouter);
app.use('/api/security', securityRouter);
app.use('/api/system', securityRouter);

// Frontend Integration: Vite middlewares in dev, static files in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  try {
    // 1. Initialize SQLite Database & Seed initial accounts (Admin, Demo Vendor, Demo Customer)
    await seedDatabase();

    // 2. Attach Vite middleware or static serving
    if (!isProduction) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist/index.html'));
      });
    }

    // 3. Start listening
    app.listen(PORT, () => {
      console.log(`MegaMarket Server running on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
      console.log(`SQLite Database initialized with real accounts and bcrypt hashing.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
